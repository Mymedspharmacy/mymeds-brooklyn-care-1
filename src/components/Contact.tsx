import { useState } from "react";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import api from '../lib/api';

export const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      await api.post('/contact', formData);
      setSuccess(true);
      setFormData({ name: '', email: '', phone: '', message: '' });
      toast({ title: 'Message Sent!', description: "Thank you for contacting us. We'll get back to you soon." });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send message');
      toast({ title: 'Error', description: error, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <section id="contact" className="py-12 sm:py-16 md:py-20 bg-background">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-2xl sm:text-4xl font-bold text-foreground mb-2 sm:mb-4">Contact Us</h2>
          <p className="text-base sm:text-xl text-muted-foreground">
            Get in touch with our friendly team for any questions or concerns
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-8 lg:mb-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-6">Get In Touch</h3>
              <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
                We're here to help with all your pharmaceutical needs. Contact us by phone, 
                email, or visit us in person. Our knowledgeable staff is ready to assist you.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <MapPin className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h4 className="font-semibold text-foreground">Address</h4>
                  <p className="text-muted-foreground">2242 65th St., Brooklyn, NY 11204</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Phone className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h4 className="font-semibold text-foreground">Phone</h4>
                  <p className="text-muted-foreground">(347) 312-6458</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Mail className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h4 className="font-semibold text-foreground">Email</h4>
                  <button 
                    onClick={() => {
                      const emailAddress = 'Mymedspharmacy@outlook.com';
                      const subject = 'Inquiry from My Meds Pharmacy Website';
                      const body = `Dear My Meds Pharmacy Team,

I hope this email finds you well. I am reaching out regarding:

[Please describe your inquiry, question, or concern here]

Best regards,
[Your Name]

---
Sent from My Meds Pharmacy website
Location: 2242 65th St., Brooklyn, NY 11204
Phone: (347) 312-6458`;

                      // Try to open email client
                      const mailtoLink = `mailto:${emailAddress}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                      
                      // Show user what's happening
                      const userChoice = confirm(
                        `Click OK to open your email client and compose a message to:\n\n${emailAddress}\n\nSubject: ${subject}\n\nIf your email client doesn't open, click Cancel to copy the email address to your clipboard.`
                      );
                      
                      if (userChoice) {
                        // User clicked OK - try to open email client
                        window.location.href = mailtoLink;
                      } else {
                        // User clicked Cancel - copy email to clipboard
                        navigator.clipboard.writeText(emailAddress).then(() => {
                          alert(`Email address copied to clipboard: ${emailAddress}\n\nYou can now paste this into your email client.`);
                        }).catch(() => {
                          alert(`Please email us at: ${emailAddress}\n\nSubject: ${subject}`);
                        });
                      }
                    }}
                    className="text-muted-foreground hover:text-primary hover:underline cursor-pointer transition-colors"
                  >
                    Mymedspharmacy@outlook.com
                  </button>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Clock className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h4 className="font-semibold text-foreground">Hours</h4>
                  <div className="text-muted-foreground space-y-1">
                    <p><strong>Pharmacy:</strong></p>
                    <p>Monday - Friday: 10:00 AM - 6:00 PM</p>
                    <p>Saturday: 10:00 AM - 4:00 PM</p>
                    <p className="mt-2"><strong>Store:</strong></p>
                    <p>Monday - Friday: 9:00 AM - 7:00 PM</p>
                    <p>Saturday: 10:00 AM - 4:00 PM</p>
                    <p>Sunday: Closed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-2xl text-foreground">Send Us a Message</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                      Full Name
                    </label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
                      Phone Number
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    rows={4}
                    required
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full"
                    placeholder="Tell us how we can help you..."
                  />
                </div>

                <Button type="submit" className="w-full text-lg py-3" disabled={loading}>{loading ? 'Sending...' : 'Send Message'}</Button>
                {error && <div className="text-red-500 mt-2">{error}</div>}
                {success && <div className="text-green-600 mt-2">Message sent successfully!</div>}
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Integrated Map */}
        <div className="mt-8 sm:mt-12">
          <Card className="overflow-hidden shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-foreground flex items-center">
                <MapPin className="h-6 w-6 mr-2 text-primary" />
                Find Us
              </CardTitle>
              <p className="text-muted-foreground">Visit us at our convenient Brooklyn location</p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="w-full h-96 bg-muted relative">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3029.9649649649647!2d-73.984963684593!3d40.6139649793416!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c244e6f6a7a6a7%3A0x5b5b5b5b5b5b5b5b!2s2242%2065th%20St%2C%20Brooklyn%2C%20NY%2011204%2C%20USA!5e0!3m2!1sen!2sus!4v1718040000000!5m2!1sen!2sus"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="My Meds Pharmacy Location"
                  className="absolute inset-0"
                ></iframe>
                <div className="absolute top-4 left-4 bg-background rounded-lg shadow-md p-3 max-w-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">
                      MM
                    </div>
                    <div>
                      <p className="font-semibold text-sm">My Meds Pharmacy</p>
                      <p className="text-xs text-muted-foreground">2242 65th St., Brooklyn, NY</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 sm:mt-12 text-center">
          <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6 text-center">
                <Phone className="h-12 w-12 text-primary mx-auto mb-4" />
                <h4 className="font-semibold mb-2">Call Us Now</h4>
                <p className="text-muted-foreground mb-4">Speak directly with our pharmacy team</p>
                <Button 
                  className="w-full"
                  onClick={() => {
                    // Try to open phone dialer
                    const phoneNumber = '3473126458';
                    const telLink = `tel:${phoneNumber}`;
                    
                    // For mobile devices, this will open the phone app
                    // For desktop, it will show a confirmation dialog
                    if (navigator.userAgent.match(/iPhone|iPad|iPod|Android/i)) {
                      window.location.href = telLink;
                    } else {
                      // For desktop browsers, show a confirmation dialog
                      if (confirm(`Call ${phoneNumber}?`)) {
                        window.open(telLink);
                      }
                    }
                  }}
                >
                  Call (347) 312-6458
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6 text-center">
                <Mail className="h-12 w-12 text-primary mx-auto mb-4" />
                <h4 className="font-semibold mb-2">Email Us</h4>
                <p className="text-muted-foreground mb-4">Send us your questions or concerns</p>
                <Button 
                  className="w-full"
                  onClick={() => {
                    const emailAddress = 'Mymedspharmacy@outlook.com';
                    const subject = 'Inquiry from My Meds Pharmacy Website';
                    const body = `Dear My Meds Pharmacy Team,

I hope this email finds you well. I am reaching out regarding:

[Please describe your inquiry, question, or concern here]

Best regards,
[Your Name]

---
Sent from My Meds Pharmacy website
Location: 2242 65th St., Brooklyn, NY 11204
Phone: (347) 312-6458`;

                    // Try to open email client
                    const mailtoLink = `mailto:${emailAddress}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                    
                    // Show user what's happening
                    const userChoice = confirm(
                      `Click OK to open your email client and compose a message to:\n\n${emailAddress}\n\nSubject: ${subject}\n\nIf your email client doesn't open, click Cancel to copy the email address to your clipboard.`
                    );
                    
                    if (userChoice) {
                      // User clicked OK - try to open email client
                      window.location.href = mailtoLink;
                    } else {
                      // User clicked Cancel - copy email to clipboard
                      navigator.clipboard.writeText(emailAddress).then(() => {
                        alert(`Email address copied to clipboard: ${emailAddress}\n\nYou can now paste this into your email client.`);
                      }).catch(() => {
                        alert(`Please email us at: ${emailAddress}\n\nSubject: ${subject}`);
                      });
                    }
                  }}
                >
                  📧 Send Email
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6 text-center">
                <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
                <h4 className="font-semibold mb-2">Get Directions</h4>
                <p className="text-muted-foreground mb-4">Navigate to our Brooklyn location</p>
                <Button 
                  className="w-full"
                  onClick={() => window.open('https://maps.google.com/?q=2242+65th+St,+Brooklyn,+NY+11204')}
                >
                  Get Directions
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};