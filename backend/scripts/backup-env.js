const fs = require('fs');
const path = require('path');

const BACKUP_DIR = path.join(__dirname, '../backups/env');
const ENV_FILE = path.join(__dirname, '../.env');

if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupFile = path.join(BACKUP_DIR, `env-backup-${timestamp}.env`);

if (fs.existsSync(ENV_FILE)) {
  fs.copyFileSync(ENV_FILE, backupFile);
  console.log('Environment backup completed:', backupFile);
  
  // Clean up old backups (keep last 30 days)
  const files = fs.readdirSync(BACKUP_DIR);
  const oldFiles = files
    .filter(file => file.startsWith('env-backup-'))
    .map(file => ({
      name: file,
      path: path.join(BACKUP_DIR, file),
      time: fs.statSync(path.join(BACKUP_DIR, file)).mtime.getTime()
    }))
    .sort((a, b) => b.time - a.time)
    .slice(30);
    
  oldFiles.forEach(file => {
    fs.unlinkSync(file.path);
    console.log('Deleted old env backup:', file.name);
  });
} else {
  console.log('No .env file found to backup');
}
