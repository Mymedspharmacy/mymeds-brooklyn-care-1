const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabaseHealth() {
  try {
    const startTime = Date.now();
    
    // Test connection
    await prisma.$connect();
    
    // Check table counts
    const [users, orders, prescriptions] = await Promise.all([
      prisma.user.count(),
      prisma.order.count(),
      prisma.prescription.count()
    ]);
    
    // Check for long-running queries
    let longQueries = [];
    try {
      longQueries = await prisma.$queryRaw`
        SELECT 
          pid,
          now() - pg_stat_activity.query_start AS duration,
          query
        FROM pg_stat_activity
        WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes'
        AND state = 'active';
      `;
    } catch (error) {
      console.log('Could not check long-running queries:', error.message);
    }
    
    const healthStatus = {
      status: 'healthy',
      responseTime: Date.now() - startTime,
      tableCounts: {
        users,
        orders,
        prescriptions
      },
      longQueries: longQueries.length,
      timestamp: new Date().toISOString()
    };
    
    if (longQueries.length > 0) {
      healthStatus.status = 'warning';
      console.warn('Long running queries detected:', longQueries);
    }
    
    console.log('Database health check:', healthStatus);
    return healthStatus;
    
  } catch (error) {
    console.error('Database health check failed:', error.message);
    return { status: 'unhealthy', error: error.message };
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  checkDatabaseHealth()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { checkDatabaseHealth };
