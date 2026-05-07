import nodemailer from 'nodemailer';
import { Cron } from 'croner';
import { run, query } from './db';
import { Message, Reminder, Contact, Campaign, Template } from './types';
import { v4 as uuidv4 } from 'uuid';

export class NexusEngine {
  private static isRunning = false;

  static async render(template: string, data: Record<string, any>) {
    let rendered = template;
    for (const [key, value] of Object.entries(data)) {
      rendered = rendered.replace(new RegExp(`{${key}}`, 'g'), value);
    }
    return rendered;
  }

  static async sendEmail(message: Message) {
    // Check if we have real SMTP creds
    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    // Detect placeholder values or missing credentials
    const isPlaceholder = user?.includes('your-email') || pass?.includes('your-app-password') || host?.includes('placeholder');

    if (!host || !user || !pass || isPlaceholder) {
      console.log(`[DRY-RUN] Sending email to Node: ${message.contactId}. Subject: ${message.subject}`);
      // Simulate success
      await run(`UPDATE messages SET status='sent', sentAt=? WHERE id=?`, [Date.now(), message.id]);
      return;
    }

    const transporter = nodemailer.createTransport({
      host,
      port: 587,
      secure: false,
      auth: { user, pass }
    });

    try {
      // Fetch sender info from campaign
      const [campaign] = await query<Campaign>(`SELECT * FROM campaigns WHERE id=?`, [message.campaignId]);
      const [contact] = await query<Contact>(`SELECT * FROM contacts WHERE id=?`, [message.contactId]);

      await transporter.sendMail({
        from: `"${campaign.senderName}" <${campaign.senderEmail}>`,
        to: contact.email,
        subject: message.subject,
        html: message.body
      });

      await run(`UPDATE messages SET status='sent', sentAt=? WHERE id=?`, [Date.now(), message.id]);
    } catch (error: any) {
      console.error('Email Fail:', error);
      await run(`UPDATE messages SET status='failed', error=? WHERE id=?`, [error.message, message.id]);
    }
  }

  static async processQueue() {
    if (this.isRunning) return;
    this.isRunning = true;

    try {
      const now = Date.now();
      
      // 1. Check for reminders that need to fire
      const activeReminders = await query<Reminder>(`SELECT * FROM reminders WHERE active=1`);
      for (const reminder of activeReminders) {
        let shouldFire = false;
        
        if (reminder.cron) {
          const cron = new Cron(reminder.cron);
          const lastFire = reminder.lastFiredAt || reminder.startAt;
          const nextFire = cron.nextRun(new Date(lastFire));
          if (nextFire && nextFire.getTime() <= now) {
            shouldFire = true;
          }
        } else if (!reminder.lastFiredAt && reminder.startAt <= now) {
          shouldFire = true;
        }

        if (shouldFire) {
          // Create a message
          const [campaign] = await query<Campaign>(`SELECT * FROM campaigns WHERE id=?`, [reminder.campaignId]);
          const [contact] = await query<Contact>(`SELECT * FROM contacts WHERE id=?`, [reminder.contactId]);
          const [template] = await query<Template>(`SELECT * FROM templates WHERE id=?`, [campaign.templateId]);
          
          if (contact.unsubscribed) continue;

          const context = { name: contact.name, title: reminder.title };
          const subject = await this.render(template.subject, context);
          const body = await this.render(template.body, context);

          const msgId = uuidv4();
          await run(`
            INSERT INTO messages (id, campaignId, contactId, scheduledAt, status, subject, body)
            VALUES (?, ?, ?, ?, 'scheduled', ?, ?)
          `, [msgId, campaign.id, contact.id, now, subject, body]);

          await run(`UPDATE reminders SET lastFiredAt=? WHERE id=?`, [now, reminder.id]);
        }
      }

      // 2. Dispatch scheduled messages
      const dueMessages = await query<Message>(`SELECT * FROM messages WHERE status='scheduled' AND scheduledAt <= ?`, [now]);
      for (const msg of dueMessages) {
        await this.sendEmail(msg);
      }

    } catch (e) {
      console.error('Queue error:', e);
    } finally {
      this.isRunning = false;
    }
  }

  static start() {
    setInterval(() => this.processQueue(), 10000); // Check every 10 seconds
    console.log('NexusEngine started.');
  }
}
