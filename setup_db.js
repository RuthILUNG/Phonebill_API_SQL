import * as sqlite from 'sqlite';
import sqlite3 from 'sqlite3';

async function setupDatabase() {
  const db = await sqlite.open({
    filename: './data_plan.db',
    driver: sqlite3.Database
  });

  // Create tables and seed data
  await db.exec(`
    CREATE TABLE IF NOT EXISTS price_plan (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      plan_name TEXT,
      sms_price REAL,
      call_price REAL
    );
  `);

  await db.exec(`
    INSERT OR IGNORE INTO price_plan (plan_name, sms_price, call_price) VALUES
    ('sms 101', 2.35, 0.37),
    ('call 101', 1.75, 0.65),
    ('call 201', 1.85, 0.85);
  `);

  console.log('Database setup completed.');
}

setupDatabase().catch(err => {
  console.error('Error setting up the database:', err);
});
