const os = require('os');
const fs = require('fs');

function getSystemStats() {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const memUsagePercent = (usedMem / totalMem) * 100;
  
  const cpuUsage = os.loadavg();
  const uptime = os.uptime();
  
  // Disk usage (Linux/Unix)
  let diskUsage = null;
  try {
    const { execSync } = require('child_process');
    const df = execSync('df -h /').toString();
    const lines = df.split('\n');
    const diskLine = lines[1].split(/\s+/);
    diskUsage = {
      total: diskLine[1],
      used: diskLine[2],
      available: diskLine[3],
      usagePercent: diskLine[4]
    };
  } catch (error) {
    // Windows or error
    diskUsage = { error: 'Unable to get disk usage' };
  }
  
  const stats = {
    memory: {
      total: Math.round(totalMem / 1024 / 1024),
      used: Math.round(usedMem / 1024 / 1024),
      free: Math.round(freeMem / 1024 / 1024),
      usagePercent: Math.round(memUsagePercent)
    },
    cpu: {
      load1: cpuUsage[0],
      load5: cpuUsage[1],
      load15: cpuUsage[2],
      cores: os.cpus().length
    },
    uptime,
    disk: diskUsage,
    timestamp: new Date().toISOString()
  };
  
  // Log warnings for high resource usage
  if (memUsagePercent > 80) {
    console.warn('High memory usage detected:', stats.memory);
  }
  
  if (cpuUsage[0] > os.cpus().length) {
    console.warn('High CPU load detected:', stats.cpu);
  }
  
  return stats;
}

// Run monitoring
function startMonitoring() {
  setInterval(() => {
    const stats = getSystemStats();
    console.log('System stats:', stats);
  }, 60000); // Every minute
}

// Run if called directly
if (require.main === module) {
  console.log('Current system stats:', getSystemStats());
  console.log('Starting continuous monitoring...');
  startMonitoring();
}

module.exports = { getSystemStats, startMonitoring };
