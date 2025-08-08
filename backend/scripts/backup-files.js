const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const BACKUP_DIR = path.join(__dirname, '../backups/files');
const UPLOADS_DIR = path.join(__dirname, '../uploads');
const LOGS_DIR = path.join(__dirname, '../logs');

if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupFile = path.join(BACKUP_DIR, `files-backup-${timestamp}.zip`);

const output = fs.createWriteStream(backupFile);
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', () => {
  console.log('File backup completed:', backupFile);
  console.log('Total size:', archive.pointer() + ' bytes');
  
  // Clean up old backups (keep last 7 days)
  const files = fs.readdirSync(BACKUP_DIR);
  const oldFiles = files
    .filter(file => file.startsWith('files-backup-'))
    .map(file => ({
      name: file,
      path: path.join(BACKUP_DIR, file),
      time: fs.statSync(path.join(BACKUP_DIR, file)).mtime.getTime()
    }))
    .sort((a, b) => b.time - a.time)
    .slice(7);
    
  oldFiles.forEach(file => {
    fs.unlinkSync(file.path);
    console.log('Deleted old backup:', file.name);
  });
});

archive.on('error', (err) => {
  throw err;
});

archive.pipe(output);

// Add uploads directory
if (fs.existsSync(UPLOADS_DIR)) {
  archive.directory(UPLOADS_DIR, 'uploads');
}

// Add logs directory
if (fs.existsSync(LOGS_DIR)) {
  archive.directory(LOGS_DIR, 'logs');
}

archive.finalize();
