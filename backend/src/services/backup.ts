import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import logger from '../utils/logger';
import { DatabaseShardingManager } from '../config/database-sharding';

const execAsync = promisify(exec);

interface BackupConfig {
  database: {
    enabled: boolean;
    schedule: string; // Cron expression
    retention: number; // Days to keep backups
    compression: boolean;
    encryption: boolean;
  };
  files: {
    enabled: boolean;
    schedule: string;
    retention: number;
    includePaths: string[];
    excludePaths: string[];
  };
  storage: {
    local: boolean;
    localPath: string;
    s3?: {
      bucket: string;
      region: string;
      accessKeyId: string;
      secretAccessKey: string;
    };
    ftp?: {
      host: string;
      port: number;
      username: string;
      password: string;
      path: string;
    };
  };
}

class BackupService {
  private config: BackupConfig;
  private backupDir: string;

  constructor() {
    this.config = this.loadConfig();
    this.backupDir = path.join(process.cwd(), 'backups');
    this.ensureBackupDirectory();
  }

  private loadConfig(): BackupConfig {
    return {
      database: {
        enabled: process.env.BACKUP_DATABASE === 'true',
        schedule: process.env.BACKUP_DATABASE_SCHEDULE || '0 2 * * *', // Daily at 2 AM
        retention: parseInt(process.env.BACKUP_RETENTION_DAYS || '30'),
        compression: process.env.BACKUP_COMPRESSION === 'true',
        encryption: process.env.BACKUP_ENCRYPTION === 'true'
      },
      files: {
        enabled: process.env.BACKUP_FILES === 'true',
        schedule: process.env.BACKUP_FILES_SCHEDULE || '0 3 * * *', // Daily at 3 AM
        retention: parseInt(process.env.BACKUP_FILES_RETENTION_DAYS || '7'),
        includePaths: (process.env.BACKUP_INCLUDE_PATHS || 'uploads,logs,config').split(','),
        excludePaths: (process.env.BACKUP_EXCLUDE_PATHS || 'node_modules,temp,.git').split(',')
      },
      storage: {
        local: process.env.BACKUP_LOCAL !== 'false',
        localPath: process.env.BACKUP_LOCAL_PATH || this.backupDir,
        s3: process.env.AWS_ACCESS_KEY_ID ? {
          bucket: process.env.AWS_S3_BUCKET || '',
          region: process.env.AWS_REGION || 'us-east-1',
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
        } : undefined,
        ftp: process.env.FTP_HOST ? {
          host: process.env.FTP_HOST,
          port: parseInt(process.env.FTP_PORT || '21'),
          username: process.env.FTP_USERNAME || '',
          password: process.env.FTP_PASSWORD || '',
          path: process.env.FTP_PATH || '/backups'
        } : undefined
      }
    };
  }

  private ensureBackupDirectory(): void {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
      logger.info('Backup directory created', { path: this.backupDir });
    }
  }

  async createDatabaseBackup(): Promise<string> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `database-backup-${timestamp}.sql`;
      const filepath = path.join(this.backupDir, filename);

      // Get database connection details from DATABASE_URL
      const dbUrl = process.env.DATABASE_URL;
      if (!dbUrl) {
        throw new Error('DATABASE_URL not configured');
      }

      // Parse DATABASE_URL to extract connection details
      const url = new URL(dbUrl);
      const host = url.hostname;
      const port = url.port || '3306';
      const database = url.pathname.slice(1);
      const username = url.username;
      const password = url.password;

      // Create MySQL dump command
      const dumpCommand = `mysqldump -h ${host} -P ${port} -u ${username} -p${password} ${database} > ${filepath}`;
      
      logger.info('Starting database backup', { filename, database });
      
      const { stdout, stderr } = await execAsync(dumpCommand);
      
      if (stderr && !stderr.includes('Warning')) {
        throw new Error(`Database backup failed: ${stderr}`);
      }

      // Compress backup if enabled
      let finalFilepath = filepath;
      if (this.config.database.compression) {
        finalFilepath = await this.compressFile(filepath);
        fs.unlinkSync(filepath); // Remove uncompressed file
      }

      // Encrypt backup if enabled
      if (this.config.database.encryption) {
        finalFilepath = await this.encryptFile(finalFilepath);
        fs.unlinkSync(finalFilepath.replace('.enc', '')); // Remove unencrypted file
      }

      const fileSize = fs.statSync(finalFilepath).size;
      logger.info('Database backup completed', { 
        filename: path.basename(finalFilepath), 
        size: `${(fileSize / 1024 / 1024).toFixed(2)}MB` 
      });

      // Upload to remote storage if configured
      await this.uploadToRemoteStorage(finalFilepath);

      return finalFilepath;

    } catch (error: any) {
      logger.error('Database backup failed', { error: error.message });
      throw error;
    }
  }

  async createFilesBackup(): Promise<string> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `files-backup-${timestamp}.tar.gz`;
      const filepath = path.join(this.backupDir, filename);

      logger.info('Starting files backup', { filename });

      // Create tar command with include/exclude paths
      const includeArgs = this.config.files.includePaths
        .map(path => `--include="${path}"`)
        .join(' ');
      
      const excludeArgs = this.config.files.excludePaths
        .map(path => `--exclude="${path}"`)
        .join(' ');

      const tarCommand = `tar -czf ${filepath} ${includeArgs} ${excludeArgs} .`;

      const { stdout, stderr } = await execAsync(tarCommand);
      
      if (stderr && !stderr.includes('Removing leading')) {
        throw new Error(`Files backup failed: ${stderr}`);
      }

      const fileSize = fs.statSync(filepath).size;
      logger.info('Files backup completed', { 
        filename, 
        size: `${(fileSize / 1024 / 1024).toFixed(2)}MB` 
      });

      // Upload to remote storage if configured
      await this.uploadToRemoteStorage(filepath);

      return filepath;

    } catch (error: any) {
      logger.error('Files backup failed', { error: error.message });
      throw error;
    }
  }

  private async compressFile(filepath: string): Promise<string> {
    const compressedPath = `${filepath}.gz`;
    const { stdout, stderr } = await execAsync(`gzip ${filepath}`);
    
    if (stderr) {
      throw new Error(`Compression failed: ${stderr}`);
    }

    return compressedPath;
  }

  private async encryptFile(filepath: string): Promise<string> {
    const encryptedPath = `${filepath}.enc`;
    const password = process.env.BACKUP_ENCRYPTION_PASSWORD || 'default-password';
    
    const { stdout, stderr } = await execAsync(
      `openssl enc -aes-256-cbc -salt -in ${filepath} -out ${encryptedPath} -pass pass:${password}`
    );
    
    if (stderr && !stderr.includes('WARNING')) {
      throw new Error(`Encryption failed: ${stderr}`);
    }

    return encryptedPath;
  }

  private async uploadToRemoteStorage(filepath: string): Promise<void> {
    try {
      // Upload to S3 if configured
      if (this.config.storage.s3) {
        await this.uploadToS3(filepath);
      }

      // Upload to FTP if configured
      if (this.config.storage.ftp) {
        await this.uploadToFTP(filepath);
      }
    } catch (error: any) {
      logger.error('Remote storage upload failed', { 
        filepath, 
        error: error.message 
      });
      // Don't throw error - backup is still successful locally
    }
  }

  private async uploadToS3(filepath: string): Promise<void> {
    if (!this.config.storage.s3) return;

    const { bucket, region, accessKeyId, secretAccessKey } = this.config.storage.s3;
    const filename = path.basename(filepath);
    
    const awsCommand = `aws s3 cp ${filepath} s3://${bucket}/backups/${filename} --region ${region}`;
    
    // Set AWS credentials
    process.env.AWS_ACCESS_KEY_ID = accessKeyId;
    process.env.AWS_SECRET_ACCESS_KEY = secretAccessKey;
    
    const { stdout, stderr } = await execAsync(awsCommand);
    
    if (stderr && !stderr.includes('upload:')) {
      throw new Error(`S3 upload failed: ${stderr}`);
    }

    logger.info('Backup uploaded to S3', { bucket, filename });
  }

  private async uploadToFTP(filepath: string): Promise<void> {
    if (!this.config.storage.ftp) return;

    const { host, port, username, password, path: ftpPath } = this.config.storage.ftp;
    const filename = path.basename(filepath);
    
    // Use curl for FTP upload
    const ftpCommand = `curl -T ${filepath} ftp://${host}:${port}${ftpPath}/${filename} --user ${username}:${password}`;
    
    const { stdout, stderr } = await execAsync(ftpCommand);
    
    if (stderr && !stderr.includes('100%')) {
      throw new Error(`FTP upload failed: ${stderr}`);
    }

    logger.info('Backup uploaded to FTP', { host, filename });
  }

  async restoreDatabase(backupFile: string): Promise<void> {
    try {
      logger.info('Starting database restore', { backupFile });

      // Decrypt if encrypted
      let restoreFile = backupFile;
      if (backupFile.endsWith('.enc')) {
        restoreFile = await this.decryptFile(backupFile);
      }

      // Decompress if compressed
      if (restoreFile.endsWith('.gz')) {
        restoreFile = await this.decompressFile(restoreFile);
      }

      // Get database connection details
      const dbUrl = process.env.DATABASE_URL;
      if (!dbUrl) {
        throw new Error('DATABASE_URL not configured');
      }

      const url = new URL(dbUrl);
      const host = url.hostname;
      const port = url.port || '3306';
      const database = url.pathname.slice(1);
      const username = url.username;
      const password = url.password;

      // Restore database
      const restoreCommand = `mysql -h ${host} -P ${port} -u ${username} -p${password} ${database} < ${restoreFile}`;
      
      const { stdout, stderr } = await execAsync(restoreCommand);
      
      if (stderr && !stderr.includes('Warning')) {
        throw new Error(`Database restore failed: ${stderr}`);
      }

      logger.info('Database restore completed', { backupFile });

      // Clean up temporary files
      if (restoreFile !== backupFile) {
        fs.unlinkSync(restoreFile);
      }

    } catch (error: any) {
      logger.error('Database restore failed', { error: error.message });
      throw error;
    }
  }

  private async decryptFile(filepath: string): Promise<string> {
    const decryptedPath = filepath.replace('.enc', '');
    const password = process.env.BACKUP_ENCRYPTION_PASSWORD || 'default-password';
    
    const { stdout, stderr } = await execAsync(
      `openssl enc -aes-256-cbc -d -in ${filepath} -out ${decryptedPath} -pass pass:${password}`
    );
    
    if (stderr && !stderr.includes('WARNING')) {
      throw new Error(`Decryption failed: ${stderr}`);
    }

    return decryptedPath;
  }

  private async decompressFile(filepath: string): Promise<string> {
    const decompressedPath = filepath.replace('.gz', '');
    const { stdout, stderr } = await execAsync(`gunzip ${filepath}`);
    
    if (stderr) {
      throw new Error(`Decompression failed: ${stderr}`);
    }

    return decompressedPath;
  }

  async cleanupOldBackups(): Promise<void> {
    try {
      const files = fs.readdirSync(this.backupDir);
      const now = Date.now();
      const retentionMs = this.config.database.retention * 24 * 60 * 60 * 1000;

      let deletedCount = 0;
      for (const file of files) {
        const filepath = path.join(this.backupDir, file);
        const stats = fs.statSync(filepath);
        const age = now - stats.mtime.getTime();

        if (age > retentionMs) {
          fs.unlinkSync(filepath);
          deletedCount++;
          logger.info('Deleted old backup', { file, age: `${Math.floor(age / (24 * 60 * 60 * 1000))} days` });
        }
      }

      if (deletedCount > 0) {
        logger.info('Cleanup completed', { deletedCount });
      }

    } catch (error: any) {
      logger.error('Backup cleanup failed', { error: error.message });
    }
  }

  async getBackupStatus(): Promise<{
    lastDatabaseBackup?: string;
    lastFilesBackup?: string;
    totalBackups: number;
    totalSize: string;
    nextScheduledBackup: string;
  }> {
    try {
      const files = fs.readdirSync(this.backupDir);
      const backupFiles = files.filter(f => f.includes('backup-'));
      
      let totalSize = 0;
      let lastDatabaseBackup: string | undefined;
      let lastFilesBackup: string | undefined;

      for (const file of backupFiles) {
        const filepath = path.join(this.backupDir, file);
        const stats = fs.statSync(filepath);
        totalSize += stats.size;

        if (file.includes('database-backup')) {
          if (!lastDatabaseBackup || stats.mtime > fs.statSync(path.join(this.backupDir, lastDatabaseBackup)).mtime) {
            lastDatabaseBackup = file;
          }
        } else if (file.includes('files-backup')) {
          if (!lastFilesBackup || stats.mtime > fs.statSync(path.join(this.backupDir, lastFilesBackup)).mtime) {
            lastFilesBackup = file;
          }
        }
      }

      return {
        lastDatabaseBackup,
        lastFilesBackup,
        totalBackups: backupFiles.length,
        totalSize: `${(totalSize / 1024 / 1024).toFixed(2)}MB`,
        nextScheduledBackup: 'Daily at 2 AM' // This should be calculated based on cron schedule
      };

    } catch (error: any) {
      logger.error('Failed to get backup status', { error: error.message });
      throw error;
    }
  }
}

export default new BackupService();
export { BackupService, BackupConfig };
