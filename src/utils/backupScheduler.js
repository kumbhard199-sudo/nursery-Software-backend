const cron = require('node-cron');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const execAsync = promisify(exec);

class BackupScheduler {
  constructor() {
    this.backupDir = process.env.BACKUP_DIR || './backups';
    this.scheduleTime = process.env.BACKUP_SCHEDULE || '0 2 * * *'; // Daily at 2 AM

    // Ensure backup directory exists
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  /**
   * Start the backup scheduler
   */
  start() {
    console.log(`📅 Backup scheduler starting... Schedule: ${this.scheduleTime}`);

    // Schedule daily backup
    cron.schedule(this.scheduleTime, async () => {
      console.log('⏰ Running scheduled database backup...');
      try {
        await this.performBackup();
        console.log('✅ Scheduled backup completed successfully');
      } catch (error) {
        console.error('❌ Scheduled backup failed:', error.message);
      }
    });

    console.log('✅ Backup scheduler started');
  }

  /**
   * Perform database backup
   */
  async performBackup() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const backupFileName = `nursery_backup_${timestamp}.sql`;
      const backupPath = path.join(this.backupDir, backupFileName);

      // Get database connection details from DATABASE_URL
      const dbUrl = process.env.DATABASE_URL;
      const urlParts = dbUrl.replace('postgresql://', '').split('@');
      const credentials = urlParts[0].split(':');
      const username = credentials[0];
      const password = credentials[1];
      const hostAndDb = urlParts[1].split('/');
      const host = hostAndDb[0].split(':')[0];
      const database = hostAndDb[1].split('?')[0];

      // Use pg_dump to create backup
      const command = `pg_dump -h ${host} -U ${username} -d ${database} -F p -f "${backupPath}"`;

      // Set environment variable for password
      const env = { ...process.env, PGPASSWORD: password };

      const { stdout, stderr } = await execAsync(command, { env });

      if (stderr && !stderr.includes('WARNING')) {
        console.warn('Backup warnings:', stderr);
      }

      // Verify backup file was created
      if (fs.existsSync(backupPath)) {
        const stats = fs.statSync(backupPath);
        console.log(`📦 Backup created: ${backupFileName} (${(stats.size / 1024).toFixed(2)} KB)`);

        // Clean up old backups (keep last 30 days)
        await this.cleanupOldBackups();

        return {
          success: true,
          fileName: backupFileName,
          filePath: backupPath,
          size: stats.size,
        };
      } else {
        throw new Error('Backup file was not created');
      }
    } catch (error) {
      console.error('Backup error:', error.message);
      throw error;
    }
  }

  /**
   * Manual backup trigger
   */
  async manualBackup() {
    console.log('🔄 Manual backup initiated...');
    return await this.performBackup();
  }

  /**
   * Clean up old backups (keep last 30 days)
   */
  async cleanupOldBackups() {
    try {
      const files = fs.readdirSync(this.backupDir);
      const now = Date.now();
      const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

      files.forEach(file => {
        if (file.startsWith('nursery_backup_') && file.endsWith('.sql')) {
          const filePath = path.join(this.backupDir, file);
          const stats = fs.statSync(filePath);
          const fileAge = now - stats.mtimeMs;

          if (fileAge > maxAge) {
            fs.unlinkSync(filePath);
            console.log(`🗑️ Deleted old backup: ${file}`);
          }
        }
      });
    } catch (error) {
      console.error('Cleanup error:', error.message);
    }
  }

  /**
   * Get list of available backups
   */
  getBackupList() {
    try {
      const files = fs.readdirSync(this.backupDir)
        .filter(f => f.startsWith('nursery_backup_') && f.endsWith('.sql'))
        .map(file => {
          const filePath = path.join(this.backupDir, file);
          const stats = fs.statSync(filePath);
          return {
            fileName: file,
            filePath: filePath,
            size: stats.size,
            createdAt: stats.birthtime,
            modifiedAt: stats.mtime,
          };
        })
        .sort((a, b) => b.modifiedAt - a.modifiedAt);

      return files;
    } catch (error) {
      console.error('Get backup list error:', error.message);
      return [];
    }
  }
}

module.exports = new BackupScheduler();
