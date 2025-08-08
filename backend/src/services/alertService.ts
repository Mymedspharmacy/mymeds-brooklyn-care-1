import nodemailer from 'nodemailer';

interface AlertConfig {
  type: 'error' | 'warning' | 'info';
  subject: string;
  message: string;
  data?: any;
}

class AlertService {
  private transporter: nodemailer.Transporter;
  
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
  
  async sendAlert(config: AlertConfig) {
    try {
      const emailContent = `
        <h2>MyMeds Pharmacy Alert</h2>
        <p><strong>Type:</strong> ${config.type}</p>
        <p><strong>Subject:</strong> ${config.subject}</p>
        <p><strong>Message:</strong> ${config.message}</p>
        ${config.data ? `<pre>${JSON.stringify(config.data, null, 2)}</pre>` : ''}
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
      `;
      
      await this.transporter.sendMail({
        from: process.env.SMTP_USER,
        to: process.env.ALERT_EMAIL || process.env.SMTP_USER,
        subject: `[MyMeds Alert] ${config.subject}`,
        html: emailContent
      });
      
      console.log('Alert sent successfully:', config);
    } catch (error) {
      console.error('Failed to send alert:', error);
    }
  }
  
  async sendErrorAlert(error: Error, context?: string) {
    await this.sendAlert({
      type: 'error',
      subject: 'Application Error',
      message: error.message,
      data: {
        stack: error.stack,
        context
      }
    });
  }
  
  async sendSystemAlert(message: string, data?: any) {
    await this.sendAlert({
      type: 'warning',
      subject: 'System Alert',
      message,
      data
    });
  }
}

export default new AlertService();
