import { app } from './app.js';
import { env } from './config/env.js';
import { checkPostgresConnection } from './db/postgres.js';
import { directoryStore } from './services/directoryCache.js';

async function startServer() {
  console.log(`🚀 Starting ${env.PROJECT_NAME} (Node.js & Express) in ${env.ENVIRONMENT} mode...`);

  // 1. Verify PostgreSQL Connection
  const pgStatus = await checkPostgresConnection();
  if (pgStatus.connected) {
    console.log('✅ PostgreSQL (Neon) connected successfully.');
  } else {
    console.warn(`⚠️ PostgreSQL connection warning: ${pgStatus.message}`);
  }

  // 2. Pre-load and prime in-memory directory store
  console.log('⚡ Pre-warming in-memory directory cache from Neon...');
  await directoryStore.reloadAll();

  // 3. Start Express server
  const server = app.listen(env.PORT, env.HOST, () => {
    console.log(`🌟 MedVexa Express REST API listening on http://${env.HOST}:${env.PORT}`);
    console.log(`   - Root Info: http://localhost:${env.PORT}/`);
    console.log(`   - Health Check: http://localhost:${env.PORT}/api/v1/health`);
    console.log(`   - Hospitals Directory: http://localhost:${env.PORT}/api/v1/hospitals`);
    console.log(`   - Doctors Directory: http://localhost:${env.PORT}/api/v1/doctors`);
    console.log(`   - Laboratories Directory: http://localhost:${env.PORT}/api/v1/laboratories`);
    console.log(`   - Wellness Centers: http://localhost:${env.PORT}/api/v1/wellness-centers`);
  });

  const gracefulShutdown = () => {
    console.log('\n🛑 Gracefully shutting down Express server...');
    server.close(() => {
      console.log('Server closed.');
      process.exit(0);
    });
  };

  process.on('SIGINT', gracefulShutdown);
  process.on('SIGTERM', gracefulShutdown);
}

startServer().catch((err) => {
  console.error('Fatal error during Express server startup:', err);
  process.exit(1);
});
