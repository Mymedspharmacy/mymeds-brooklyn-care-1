// Centralized contact information configuration
export const contactConfig = {
  phone: import.meta.env.VITE_PHONE_NUMBER || '3473126458',
  email: import.meta.env.VITE_CONTACT_EMAIL || 'mymedspharmacy@outlook.com',
  address: import.meta.env.VITE_PHARMACY_ADDRESS || 'J279+5V Brooklyn, NY',
  googleMapsUrl: import.meta.env.VITE_GOOGLE_MAPS_URL || 'https://maps.google.com',
  hours: import.meta.env.VITE_PHARMACY_HOURS || 'Mon-Fri: 9AM-7PM, Sat: 9AM-5PM, Sun: 10AM-4PM',
} as const;

// Helper functions
export const getPhoneNumber = () => contactConfig.phone;
export const getEmail = () => contactConfig.email;
export const getAddress = () => contactConfig.address;
export const getGoogleMapsUrl = () => contactConfig.googleMapsUrl;
export const getHours = () => contactConfig.hours;

// Format phone number for display
export const formatPhoneNumber = (phone: string = contactConfig.phone) => {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone;
};

// Create tel: link
export const getTelLink = (phone: string = contactConfig.phone) => `tel:${phone}`;

// Create mailto: link
export const getMailtoLink = (email: string = contactConfig.email) => `mailto:${email}`;
