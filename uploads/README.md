# 📁 Uploads Directory

This directory is for files that need to be uploaded to the VPS.

## 🚀 **How to Upload Files:**

### **Option 1: GitHub Actions (Recommended)**
1. Place your files in this directory
2. Commit and push to GitHub
3. Go to Actions → "Upload Files to VPS"
4. Click "Run workflow"
5. Fill in the details and run

### **Option 2: Manual Upload via SSH**
```bash
# Upload entire uploads folder
scp -r -i ~/.ssh/your_key ./uploads/ root@your_vps_ip:/var/www/mymeds-production/

# Upload specific file
scp -i ~/.ssh/your_key ./uploads/myfile.txt root@your_vps_ip:/var/www/mymeds-production/uploads/
```

### **Option 3: Automatic CI/CD**
- Push to `main` branch → Files automatically deployed to production
- Push to `develop` branch → Files automatically deployed to staging

## 📂 **Directory Structure:**
```
uploads/
├── images/          # Images and graphics
├── documents/       # PDFs, docs, etc.
├── media/          # Videos, audio files
├── backups/        # Database backups, etc.
└── README.md       # This file
```

## ⚠️ **Important Notes:**
- Files in this directory will be uploaded to your VPS
- Large files (>100MB) may take time to upload
- Sensitive files should not be committed to Git
- Use `.gitignore` to exclude large or temporary files
