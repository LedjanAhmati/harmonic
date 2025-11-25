import { initializeDatabase } from '../src/database.js';

async function init() {
  console.log('🔧 Initializing database...');
  try {
    await initializeDatabase();
    console.log('✅ Database ready!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Initialization failed:', err);
    process.exit(1);
  }
}

init();
