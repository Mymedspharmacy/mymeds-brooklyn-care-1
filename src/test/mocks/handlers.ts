import { http, HttpResponse } from 'msw';

export const handlers = [
  // Mock API endpoints for testing
  http.get('/api/health', () => {
    return HttpResponse.json({ status: 'ok' });
  }),
  
  http.get('/api/products', () => {
    return HttpResponse.json([
      { id: 1, name: 'Test Product 1', price: 10.99 },
      { id: 2, name: 'Test Product 2', price: 19.99 }
    ]);
  }),
  
  http.post('/api/contact', () => {
    return HttpResponse.json({ success: true, message: 'Message sent successfully' });
  }),
  
  // Add more mock handlers as needed for your application
];
