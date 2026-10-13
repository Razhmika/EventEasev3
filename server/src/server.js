import app from './app.js';
import { testConnection } from './config/db.js';

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await testConnection();
    app.listen(PORT, () => {
      console.log(`\n======================================================`);
      console.log(`🌟 EventEase REST API running on http://localhost:${PORT}`);
      console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`======================================================\n`);
    });
  } catch (error) {
    console.error('Failed to start server due to database connection error:', error);
    process.exit(1);
  }
}

startServer();
