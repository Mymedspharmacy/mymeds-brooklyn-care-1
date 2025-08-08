import axios from 'axios';

interface WebhookAlert {
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  data?: any;
}

class WebhookAlertService {
  private webhookUrl: string;
  
  constructor() {
    this.webhookUrl = process.env.WEBHOOK_URL || '';
  }
  
  async sendAlert(alert: WebhookAlert) {
    if (!this.webhookUrl) {
      console.warn('Webhook URL not configured');
      return;
    }
    
    try {
      const payload = {
        embeds: [{
          title: alert.title,
          description: alert.message,
          color: this.getColor(alert.type),
          fields: alert.data ? Object.entries(alert.data).map(([key, value]) => ({
            name: key,
            value: typeof value === 'object' ? JSON.stringify(value) : String(value),
            inline: true
          })) : [],
          timestamp: new Date().toISOString()
        }]
      };
      
      await axios.post(this.webhookUrl, payload);
      console.log('Webhook alert sent:', alert);
    } catch (error) {
      console.error('Failed to send webhook alert:', error);
    }
  }
  
  private getColor(type: string): number {
    switch (type) {
      case 'error': return 0xFF0000; // Red
      case 'warning': return 0xFFA500; // Orange
      case 'info': return 0x0000FF; // Blue
      default: return 0x808080; // Gray
    }
  }
}

export default new WebhookAlertService();
