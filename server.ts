import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDb, run, query } from './src/lib/db.js';
import { NexusEngine } from './src/lib/engine.js';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize DB and Engine
  await initDb();
  NexusEngine.start();

  // --- API ROUTES ---

  // Contacts
  app.get('/api/contacts', async (req, res) => {
    const rows = await query('SELECT * FROM contacts');
    res.json(rows);
  });

  app.post('/api/contacts', async (req, res) => {
    try {
      const { name, email, timezone } = req.body;
      const id = uuidv4();
      
      // Check if email exists
      const existing = await query('SELECT id FROM contacts WHERE email = ?', [email]);
      if (existing.length > 0) {
        return res.json({ id: (existing[0] as any).id, status: 'existing' });
      }

      await run('INSERT INTO contacts (id, name, email, timezone) VALUES (?, ?, ?, ?)', [id, name, email, timezone || 'UTC']);
      res.json({ id, status: 'created' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Templates
  app.get('/api/templates', async (req, res) => {
    const rows = await query('SELECT * FROM templates');
    res.json(rows);
  });

  app.post('/api/templates', async (req, res) => {
    try {
      const { name, subject, body } = req.body;
      const id = uuidv4();
      
      // Check for existing name
      const existing = await query('SELECT id FROM templates WHERE name = ?', [name]);
      if (existing.length > 0) {
        return res.json({ id: (existing[0] as any).id, status: 'existing' });
      }

      await run('INSERT INTO templates (id, name, subject, body, createdAt) VALUES (?, ?, ?, ?, ?)', [id, name, subject, body, Date.now()]);
      res.json({ id, status: 'created' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Campaigns
  app.get('/api/campaigns', async (req, res) => {
    const rows = await query('SELECT * FROM campaigns');
    res.json(rows);
  });

  app.post('/api/campaigns', async (req, res) => {
    const { name, templateId, senderName, senderEmail } = req.body;
    const id = uuidv4();
    await run('INSERT INTO campaigns (id, name, templateId, senderName, senderEmail, createdAt) VALUES (?, ?, ?, ?, ?, ?)', [id, name, templateId, senderName, senderEmail, Date.now()]);
    res.json({ id });
  });

  // Reminders
  app.get('/api/reminders', async (req, res) => {
    const rows = await query(`
      SELECT r.*, c.name as contactName, ca.name as campaignName 
      FROM reminders r 
      JOIN contacts c ON r.contactId = c.id
      JOIN campaigns ca ON r.campaignId = ca.id
    `);
    res.json(rows);
  });

  app.post('/api/reminders', async (req, res) => {
    const { title, contactId, campaignId, startAt, cron } = req.body;
    const id = uuidv4();
    await run('INSERT INTO reminders (id, title, contactId, campaignId, startAt, cron) VALUES (?, ?, ?, ?, ?, ?)', [id, title, contactId, campaignId, startAt, cron]);
    res.json({ id });
  });

  // Messages (Logs)
  app.get('/api/messages', async (req, res) => {
    const rows = await query(`
      SELECT m.*, c.name as contactName, c.email as contactEmail
      FROM messages m
      JOIN contacts c ON m.contactId = c.id
      ORDER BY scheduledAt DESC
    `);
    res.json(rows);
  });

  // --- VITE MIDDLEWARE ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NexusMail Server running on port ${PORT}`);
  });
}

startServer().catch(console.error);
