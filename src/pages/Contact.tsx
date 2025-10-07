import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Checkbox } from '../components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useToast } from '../hooks/use-toast';
import api from '../lib/api';
import { getErrorStatus } from '../utils/errorUtils';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { SEOHead } from '../components/SEOHead';
import { Map } from '../components/Map';
import { 
  MessageCircle, 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle, 
  Send,
  Clock,
  Heart,
  Shield,
  Users,
  Stethoscope,
  Sparkles
} from 'lucide-react';

const Contact = () => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    preferredContact: 'email',
    urgency: 'normal',
    serviceType: '',
    bestTimeToContact: '',
    agreeToTerms: false,
    allowMarketing: false
  });
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.subject || !formData.message) {
      setError('Please fill in all required fields');
      toast({ 
        title: 'Validation Error', 
        description: 'Please fill in all required fields', 
        variant: 'destructive' 
      });
      return;
    }

    if (!formData.agreeToTerms) {
      setError('You must agree to the terms and conditions');
      toast({ 
        title: 'Validation Error', 
        description: 'You must agree to the terms and conditions', 
        variant: 'destructive' 
      });
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Try backend submission first
      try {
        await api.post('/contact', {
          ...formData,
          timestamp: new Date().toISOString()
        });
        
        toast({ 
          title: 'Message Sent Successfully!', 
          description: "We'll get back to you within 24 hours." 
        });
      } catch (backendError: unknown) {
        // If backend endpoint doesn't exist, save to localStorage as fallback
        if (getErrorStatus(backendError) === 404) {
          const contactData = {
            ...formData,
            timestamp: new Date().toISOString(),
            type: 'contact'
          };
          
          // Save to localStorage
          const existingContacts = JSON.parse(localStorage.getItem('pharmacy-contacts') || '[]');
          existingContacts.push(contactData);
          localStorage.setItem('pharmacy-contacts', JSON.stringify(existingContacts));
          
          toast({ 
            title: 'Message Saved Locally!', 
            description: "Your message has been saved and will be processed when the backend is available." 
          });
        } else {
          throw backendError; // Re-throw if it's a different error
        }
      }
      
      setSuccess(true);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        preferredContact: 'email',
        urgency: 'normal',
        serviceType: '',
        bestTimeToContact: '',
        agreeToTerms: false,
        allowMarketing: false
      });
      
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      toast({ 
        title: 'Error', 
        description: errorMessage, 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEOHead 
        title="Contact Us - My Meds Pharmacy | Location & Hours"
        description="Contact My Meds Pharmacy. Visit us at 2242 65th St, call (347) 312-6458, or send us a message. We're here to help with all your pharmaceutical needs."
        keywords="contact pharmacy, pharmacy contact, pharmacy location, pharmacy hours, pharmacy phone number, pharmacy email, visit pharmacy, pharmacy address"
      />
      <div className="min-h-screen bg-[#D5C6BC]">
        <Header 
          onRefillClick={() => window.location.href = '/'}
          onAppointmentClick={() => window.location.href = '/'}
          onTransferClick={() => window.location.href = '/'}
        />
      
      <div className="">
                  <section id="contact" className="py-16 sm:py-20 md:py-24 relative overflow-hidden">
          {/* Background Image Placeholder - Replace with actual pharmacy location/staff image */}
                       <div
               className="absolute inset-0 opacity-100 pointer-events-none"
               style={{
                 backgroundImage: `url('/images/new/contactus.jpg')`,
                 backgroundSize: 'cover',
                 backgroundPosition: 'center',
                 backgroundRepeat: 'no-repeat'
               }}
             ></div>
             

          
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              {/* Enhanced Badge with Static Elements */}
              <div className="relative mb-8">
                <div className="inline-flex items-center gap-2 bg-[#57BBB6] text-white px-6 py-3 rounded-full text-sm font-semibold shadow-xl border-2 border-white/20">
                  <MessageCircle className="h-5 w-5" />
                  Get In Touch
                </div>
              </div>
              
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-8">
                Contact 
                <span className="block text-white bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent">
                  Our Team
                </span>
              </h2>
              
              <p className="text-xl sm:text-2xl text-white/95 max-w-4xl mx-auto font-medium leading-relaxed">
                We're here to help with all your pharmaceutical needs. Reach out to us through any of the methods below, 
                and our knowledgeable team will get back to you promptly.
              </p>
              
              {/* Enhanced Decorative Underline */}
              <div className="w-32 h-1 bg-gradient-to-r from-transparent via-white/60 to-transparent mx-auto mt-8 rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
              {/* Enhanced Contact Information */}
              <div className="space-y-8">
                <div>
                  <h3 className="text-3xl font-bold text-white mb-6">Contact Information</h3>
                  <p className="text-lg text-white/95 leading-relaxed mb-8">
                    Visit us in person, call us directly, or send us an email. Our friendly staff is ready to assist you 
                    with all your pharmaceutical and health-related questions.
                  </p>
                </div>

                <div className="space-y-8">
                  {/* Enhanced Address Card */}
                  <Card className="hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 bg-white/95 backdrop-blur-sm group">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-[#57BBB6] rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                          <Building2 className="h-6 w-6 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-[#376F6B] text-lg mb-2">Visit Our Location</h4>
                          <p className="text-gray-600 mb-3">J279+5V New York</p>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              const pharmacyAddress = "My Meds Pharmacy Inc, 2242 65th St, New York 11204, United States";
                              const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(pharmacyAddress)}`;
                              window.open(mapsUrl, '_blank');
                            }}
                            className="text-[#57BBB6] border-[#57BBB6] hover:bg-[#57BBB6] hover:text-white transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
                          >
                            <MapPin className="h-4 w-4 mr-2" />
                            Get Directions
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Enhanced Phone Card */}
                  <Card className="hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 bg-white/95 backdrop-blur-sm group">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-[#57BBB6] rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                          <Phone className="h-6 w-6 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-[#376F6B] text-lg mb-2">Call Us</h4>
                          <p className="text-gray-600 mb-3">(347) 312-6458</p>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open('tel:3473126458')}
                            className="text-[#57BBB6] border-[#57BBB6] hover:bg-[#57BBB6] hover:text-white transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
                          >
                            <Phone className="h-4 w-4 mr-2" />
                            Call Now
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Enhanced Email Card */}
                  <Card className="hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 bg-white/95 backdrop-blur-sm group">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-[#57BBB6] rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                          <Mail className="h-6 w-6 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-[#376F6B] text-lg mb-2">Email Us</h4>
                          <p className="text-gray-600 mb-3">mymedspharmacy@outlook.com</p>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open('mailto:mymedspharmacy@outlook.com')}
                            className="text-[#57BBB6] border-[#57BBB6] hover:bg-[#57BBB6] hover:text-white transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
                          >
                            <Mail className="h-4 w-4 mr-2" />
                            Send Email
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Enhanced Contact Form */}
              <div className="bg-white rounded-3xl p-8 shadow-2xl border border-white/20 relative overflow-hidden group">
                {/* Form Background Static Elements */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-4 right-4 w-16 h-16 border border-[#57BBB6]/10 rounded-full"></div>
                  <div className="absolute bottom-4 left-4 w-12 h-12 border border-[#376F6B]/10 rounded-lg rotate-45"></div>
                </div>
                
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold text-[#376F6B] mb-6">Send us a Message</h3>
                  
                  {success ? (
                    <div className="text-center py-12">
                      <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                      <h4 className="text-xl font-semibold text-gray-900 mb-2">Message Sent Successfully!</h4>
                      <p className="text-gray-600 mb-6">We'll get back to you within 24 hours.</p>
                      <Button 
                        onClick={() => setSuccess(false)}
                        className="bg-[#57BBB6] hover:bg-[#376F6B] text-white transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                      >
                        Send Another Message
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                          <Input
                            type="text"
                            value={formData.firstName}
                            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                            className="border-gray-300 focus:border-[#57BBB6] focus:ring-[#57BBB6] transition-all duration-300 hover:border-[#57BBB6]/50"
                            placeholder="Enter your first name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                          <Input
                            type="text"
                            value={formData.lastName}
                            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                            className="border-gray-300 focus:border-[#57BBB6] focus:ring-[#57BBB6] transition-all duration-300 hover:border-[#57BBB6]/50"
                            placeholder="Enter your last name"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                          <Input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="border-gray-300 focus:border-[#57BBB6] focus:ring-[#57BBB6] transition-all duration-300 hover:border-[#57BBB6]/50"
                            placeholder="Enter your email"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                          <Input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            className="border-gray-300 focus:border-[#57BBB6] focus:ring-[#57BBB6] transition-all duration-300 hover:border-[#57BBB6]/50"
                            placeholder="Enter your phone number"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                        <Input
                          type="text"
                          value={formData.subject}
                          onChange={(e) => setFormData({...formData, subject: e.target.value})}
                          className="border-gray-300 focus:border-[#57BBB6] focus:ring-[#57BBB6] transition-all duration-300 hover:border-[#57BBB6]/50"
                          placeholder="What is this regarding?"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                        <Textarea
                          value={formData.message}
                          onChange={(e) => setFormData({...formData, message: e.target.value})}
                          className="border-gray-300 focus:border-[#57BBB6] focus:ring-[#57BBB6] min-h-[120px] transition-all duration-300 hover:border-[#57BBB6]/50"
                          placeholder="Tell us how we can help you..."
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="agreeToTerms"
                          checked={formData.agreeToTerms}
                          onCheckedChange={(checked) => setFormData({...formData, agreeToTerms: checked as boolean})}
                        />
                        <label htmlFor="agreeToTerms" className="text-sm text-gray-600">
                          I agree to the terms and conditions *
                        </label>
                      </div>

                                             <Button 
                         type="submit"
                         className="w-full bg-[#57BBB6] hover:bg-[#376F6B] text-white py-3 text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                         disabled={loading}
                       >
                        {loading ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Sending...
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <Send className="h-5 w-5 mr-2" />
                            Send Message
                          </div>
                        )}
                      </Button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>



        {/* Enhanced Business Hours Section */}
                 <section className="py-16 sm:py-20 bg-[#E8F4F3] relative overflow-hidden">
          {/* Background Static Elements */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-32 h-32 bg-[#57BBB6]/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-[#376F6B]/5 rounded-full blur-3xl"></div>
          </div>
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#57BBB6] mb-6">
                Business Hours
              </h2>
              <p className="text-lg sm:text-xl text-[#376F6B] max-w-3xl mx-auto">
                Visit us during our convenient hours or contact us for after-hours assistance.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                             <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 bg-white group">
                 <CardContent className="p-8 text-center">
                   <div className="w-16 h-16 bg-[#57BBB6] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                     <Building2 className="h-8 w-8 text-white" />
                   </div>
                   <h3 className="text-2xl font-bold text-[#376F6B] mb-4">Pharmacy Hours</h3>
                  <div className="space-y-2 text-gray-600">
                    <p className="font-semibold">Monday - Friday: 10:00 AM - 6:00 PM</p>
                    <p className="font-semibold">Saturday: 10:00 AM - 4:00 PM</p>
                    <p className="font-semibold">Sunday: Closed</p>
                  </div>
                </CardContent>
              </Card>

                             <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 bg-white group">
                 <CardContent className="p-8 text-center">
                   <div className="w-16 h-16 bg-[#57BBB6] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                     <Clock className="h-8 w-8 text-white" />
                   </div>
                   <h3 className="text-2xl font-bold text-[#376F6B] mb-4">Store Hours</h3>
                  <div className="space-y-2 text-gray-600">
                    <p className="font-semibold">Monday - Friday: 9:00 AM - 7:00 PM</p>
                    <p className="font-semibold">Saturday: 10:00 AM - 4:00 PM</p>
                    <p className="font-semibold">Sunday: Closed</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Enhanced Location Section */}
                 <section className="py-16 sm:py-20 bg-[#D5C6BC] relative overflow-hidden">
          {/* Background Images for Map Section */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: `url('/images/new/contactus.jpg')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            ></div>
            <div
              className="absolute inset-0 opacity-25"
              style={{
                backgroundImage: `url('/images/new/service.jpg')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            ></div>
          </div>
          
          {/* Enhanced Overlay for Text Readability */}
          <div className="absolute inset-0 bg-white/60 z-10"></div>
          
          {/* Background Static Elements */}
          <div className="absolute inset-0 pointer-events-none z-20">
          </div>
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-30">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#376F6B] mb-6">
                Find Our Location
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
                Visit us in person for personalized care and expert consultation. We're conveniently located in your area.
              </p>
            </div>
            <Map />
          </div>
        </section>
      </div>

      <Footer />
        </div>
      </>
    );
};

export default Contact;
