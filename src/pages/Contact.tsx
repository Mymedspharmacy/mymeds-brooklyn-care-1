import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Checkbox } from '../components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useToast } from '../hooks/use-toast';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
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
  Clock
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
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  return (
    <div className="min-h-screen bg-[#D5C6BC]">
      <Header 
        onRefillClick={() => window.location.href = '/'}
        onAppointmentClick={() => window.location.href = '/'}
        onTransferClick={() => window.location.href = '/'}
      />
      
      <div className="pt-20">
        <section id="contact" className="py-16 sm:py-20 md:py-24 bg-[#57BBB6] relative overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-white text-[#57BBB6] px-6 py-3 rounded-full text-sm font-semibold mb-8 shadow-lg">
                <MessageCircle className="h-5 w-5" />
                Get In Touch
              </div>
              
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-8">
                Contact 
                <span className="block text-white">
                  Our Team
                </span>
              </h2>
              
              <p className="text-xl sm:text-2xl text-white/90 max-w-4xl mx-auto font-medium leading-relaxed">
                We're here to help with all your pharmaceutical needs. Reach out to us through any of the methods below, 
                and our knowledgeable team will get back to you promptly.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
              {/* Contact Information */}
              <div className="space-y-8">
                <div>
                  <h3 className="text-3xl font-bold text-white mb-6">Contact Information</h3>
                  <p className="text-lg text-white/90 leading-relaxed mb-8">
                    Visit us in person, call us directly, or send us an email. Our friendly staff is ready to assist you 
                    with all your pharmaceutical and health-related questions.
                  </p>
                </div>

                <div className="space-y-8">
                  {/* Address Card */}
                  <Card className="hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 border-0 bg-white/90 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-[#57BBB6] rounded-xl flex items-center justify-center flex-shrink-0">
                          <Building2 className="h-6 w-6 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-[#376F6B] text-lg mb-2">Visit Our Location</h4>
                          <p className="text-gray-600 mb-3">J279+5V Brooklyn, NY</p>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open('https://maps.app.goo.gl/gXSVqF25sAB7r6m76', '_blank')}
                            className="text-[#57BBB6] border-[#57BBB6] hover:bg-[#57BBB6] hover:text-white"
                          >
                            <MapPin className="h-4 w-4 mr-2" />
                            Get Directions
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Phone Card */}
                  <Card className="hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 border-0 bg-white/90 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-[#376F6B] rounded-xl flex items-center justify-center flex-shrink-0">
                          <Phone className="h-6 w-6 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-[#376F6B] text-lg mb-2">Call Us</h4>
                          <p className="text-gray-600 mb-3">(347) 312-6458</p>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open('tel:3473126458')}
                            className="text-[#376F6B] border-[#376F6B] hover:bg-[#376F6B] hover:text-white"
                          >
                            <Phone className="h-4 w-4 mr-2" />
                            Call Now
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Email Card */}
                  <Card className="hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 border-0 bg-white/90 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-[#57BBB6] rounded-xl flex items-center justify-center flex-shrink-0">
                          <Mail className="h-6 w-6 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-[#376F6B] text-lg mb-2">Email Us</h4>
                          <p className="text-gray-600 mb-3">mymedspharmacy@outlook.com</p>
                          <Button 
                            variant="outline" 
                            size="sm"
                                                          onClick={() => window.open('mailto:mymedspharmacy@outlook.com')}
                            className="text-[#57BBB6] border-[#57BBB6] hover:bg-[#57BBB6] hover:text-white"
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

              {/* Contact Form */}
              <div className="bg-white rounded-2xl p-8 shadow-2xl">
                <h3 className="text-2xl font-bold text-[#376F6B] mb-6">Send us a Message</h3>
                
                {success ? (
                  <div className="text-center py-12">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">Message Sent Successfully!</h4>
                    <p className="text-gray-600 mb-6">We'll get back to you within 24 hours.</p>
                    <Button 
                      onClick={() => setSuccess(false)}
                      className="bg-[#57BBB6] hover:bg-[#376F6B] text-white"
                    >
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                        <Input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                          className="border-gray-300 focus:border-[#57BBB6] focus:ring-[#57BBB6]"
                          placeholder="Enter your first name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                        <Input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                          className="border-gray-300 focus:border-[#57BBB6] focus:ring-[#57BBB6]"
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
                          className="border-gray-300 focus:border-[#57BBB6] focus:ring-[#57BBB6]"
                          placeholder="Enter your email"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                        <Input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          className="border-gray-300 focus:border-[#57BBB6] focus:ring-[#57BBB6]"
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
                        className="border-gray-300 focus:border-[#57BBB6] focus:ring-[#57BBB6]"
                        placeholder="What is this regarding?"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                      <Textarea
                        value={formData.message}
                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                        className="border-gray-300 focus:border-[#57BBB6] focus:ring-[#57BBB6] min-h-[120px]"
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
                      className="w-full bg-[#57BBB6] hover:bg-[#376F6B] text-white py-3 text-lg font-semibold"
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
        </section>

        {/* Business Hours Section */}
        <section className="py-16 sm:py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#57BBB6] mb-6">
                Business Hours
              </h2>
              <p className="text-lg sm:text-xl text-[#376F6B] max-w-3xl mx-auto">
                Visit us during our convenient hours or contact us for after-hours assistance.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-[#57BBB6] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
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

              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-[#376F6B] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
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

        {/* Location Section */}
        <section className="py-16 sm:py-20 bg-[#D5C6BC]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#376F6B] mb-6">
                Find Our Location
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
                Visit us in person for personalized care and expert consultation. We're conveniently located in Brooklyn.
              </p>
            </div>
            <Map />
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default Contact;
