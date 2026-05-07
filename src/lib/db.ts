import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('nexusmail.db');

export function query<T>(sql: string, params: any[] = []): Promise<T[]> {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows as T[]);
    });
  });
}

export function run(sql: string, params: any[] = []): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve();
    });
  });
}

export async function initDb() {
  await run(`
    CREATE TABLE IF NOT EXISTS contacts (
      id TEXT PRIMARY KEY,
      name TEXT,
      email TEXT UNIQUE,
      timezone TEXT DEFAULT 'UTC',
      unsubscribed INTEGER DEFAULT 0
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS templates (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE,
      subject TEXT,
      body TEXT,
      createdAt INTEGER
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS campaigns (
      id TEXT PRIMARY KEY,
      name TEXT,
      templateId TEXT,
      senderName TEXT,
      senderEmail TEXT,
      createdAt INTEGER,
      FOREIGN KEY(templateId) REFERENCES templates(id)
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS reminders (
      id TEXT PRIMARY KEY,
      title TEXT,
      contactId TEXT,
      campaignId TEXT,
      startAt INTEGER,
      cron TEXT,
      active INTEGER DEFAULT 1,
      lastFiredAt INTEGER,
      FOREIGN KEY(contactId) REFERENCES contacts(id),
      FOREIGN KEY(campaignId) REFERENCES campaigns(id)
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      campaignId TEXT,
      contactId TEXT,
      scheduledAt INTEGER,
      sentAt INTEGER,
      status TEXT,
      subject TEXT,
      body TEXT,
      error TEXT,
      FOREIGN KEY(campaignId) REFERENCES campaigns(id),
      FOREIGN KEY(contactId) REFERENCES contacts(id)
    )
  `);
}
