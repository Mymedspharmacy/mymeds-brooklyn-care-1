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
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  return (
    <>
      <SEOHead 
        title="Contact Us - My Meds Pharmacy | Brooklyn Pharmacy Location & Hours"
        description="Contact My Meds Pharmacy in Brooklyn. Visit us at 2242 65th St, call (347) 312-6458, or send us a message. We're here to help with all your pharmaceutical needs."
        keywords="contact pharmacy, Brooklyn pharmacy contact, pharmacy location, pharmacy hours, pharmacy phone number, pharmacy email, visit pharmacy, pharmacy address"
      />
      <div className="min-h-screen bg-[#D5C6BC]">
        <Header 
          onRefillClick={() => window.location.href = '/'}
          onAppointmentClick={() => window.location.href = '/'}
          onTransferClick={() => window.location.href = '/'}
        />
      
      <div className="pt-20">
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
             

          
          {/* Enhanced Animated Background Elements - All White */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Floating Medical Icons - White Colors */}
            <div className="absolute top-20 left-10 text-white/25 animate-bounce" style={{ animationDelay: '0s' }}>
              <MessageCircle className="w-8 h-8" />
            </div>
            <div className="absolute top-32 right-20 text-white/20 animate-bounce" style={{ animationDelay: '1s' }}>
              <Phone className="w-6 h-6" />
            </div>
            <div className="absolute bottom-32 left-1/4 text-white/30 animate-bounce" style={{ animationDelay: '2s' }}>
              <Mail className="w-7 h-7" />
            </div>
            <div className="absolute bottom-20 right-1/3 text-white/22 animate-bounce" style={{ animationDelay: '3s' }}>
              <MapPin className="w-8 h-8" />
            </div>
            
            {/* Additional Floating Icons */}
            <div className="absolute top-1/3 left-1/4 text-white/18 animate-bounce" style={{ animationDelay: '0.5s' }}>
              <Heart className="w-6 h-6" />
            </div>
            <div className="absolute top-1/2 right-1/3 text-white/24 animate-bounce" style={{ animationDelay: '1.5s' }}>
              <Shield className="w-5 h-5" />
            </div>
            <div className="absolute bottom-1/4 left-1/3 text-white/20 animate-bounce" style={{ animationDelay: '2.5s' }}>
              <Users className="w-7 h-7" />
            </div>
            <div className="absolute top-1/4 right-1/4 text-white/16 animate-bounce" style={{ animationDelay: '3.5s' }}>
              <Stethoscope className="w-6 h-6" />
            </div>
            
            {/* Animated Particles - White Colors */}
            <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-white/40 rounded-full animate-ping"></div>
            <div className="absolute top-1/2 right-1/4 w-1.5 h-1.5 bg-white/35 rounded-full animate-ping" style={{ animationDelay: '1.5s' }}></div>
            <div className="absolute bottom-1/3 left-1/2 w-1 h-1 bg-white/45 rounded-full animate-ping" style={{ animationDelay: '3s' }}></div>
            <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-white/30 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
            
            {/* Enhanced Pulse Waves - White Colors */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-48 h-48 border border-white/25 rounded-full animate-ping"></div>
              <div className="w-48 h-48 border border-white/25 rounded-full animate-ping absolute top-0 left-0" style={{ animationDelay: '1s' }}></div>
              <div className="w-48 h-48 border border-white/25 rounded-full animate-ping absolute top-0 left-0" style={{ animationDelay: '2s' }}></div>
            </div>
            
            {/* Geometric Shapes - White Colors */}
            <div className="absolute top-10 left-10 w-20 h-20 border-2 border-white/20 rounded-lg rotate-45 animate-pulse" style={{ animationDuration: '4s' }}></div>
            <div className="absolute top-32 right-16 w-16 h-16 bg-white/15 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
            <div className="absolute bottom-32 left-20 w-24 h-24 border border-white/20 rounded-full animate-spin" style={{ animationDuration: '8s' }}></div>
            
            {/* Corner Decorative Elements */}
            <div className="absolute top-0 left-0 w-16 h-16 border-l-4 border-t-4 border-white/20 rounded-tl-3xl"></div>
            <div className="absolute top-0 right-0 w-16 h-16 border-r-4 border-t-4 border-white/20 rounded-tr-3xl"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 border-l-4 border-b-4 border-white/20 rounded-bl-3xl"></div>
            <div className="absolute bottom-0 right-0 w-16 h-16 border-r-4 border-b-4 border-white/20 rounded-br-3xl"></div>
          </div>
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              {/* Enhanced Badge with Floating Elements */}
              <div className="relative mb-8">
                <div className="absolute -top-4 left-1/4 text-white/20 animate-bounce" style={{ animationDelay: '0s' }}>
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="absolute -top-2 right-1/4 text-white/20 animate-bounce" style={{ animationDelay: '0.5s' }}>
                  <Heart className="w-4 h-4" />
                </div>
                
                                 <div className="inline-flex items-center gap-2 bg-[#57BBB6] text-white px-6 py-3 rounded-full text-sm font-semibold shadow-xl hover:scale-105 transition-all duration-300 border-2 border-white/20">
                  <MessageCircle className="h-5 w-5 animate-pulse" />
                  Get In Touch
                </div>
              </div>
              
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-8">
                Contact 
                <span className="block text-white bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent animate-pulse">
                  Our Team
                </span>
              </h2>
              
              <p className="text-xl sm:text-2xl text-white/95 max-w-4xl mx-auto font-medium leading-relaxed">
                We're here to help with all your pharmaceutical needs. Reach out to us through any of the methods below, 
                and our knowledgeable team will get back to you promptly.
              </p>
              
              {/* Enhanced Decorative Underline */}
              <div className="w-32 h-1 bg-gradient-to-r from-transparent via-white/60 to-transparent mx-auto mt-8 rounded-full animate-pulse"></div>
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
                          <p className="text-gray-600 mb-3">J279+5V Brooklyn, NY</p>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(import.meta.env.VITE_GOOGLE_MAPS_URL || 'https://maps.google.com', '_blank')}
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
                {/* Form Background Decorative Elements */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-4 right-4 w-16 h-16 border border-[#57BBB6]/10 rounded-full animate-spin" style={{ animationDuration: '8s' }}></div>
                  <div className="absolute bottom-4 left-4 w-12 h-12 border border-[#376F6B]/10 rounded-lg rotate-45 animate-pulse"></div>
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
                    <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
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
          {/* Background Decorative Elements */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-32 h-32 bg-[#57BBB6]/5 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-[#376F6B]/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
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
          
          {/* Background Decorative Elements */}
          <div className="absolute inset-0 pointer-events-none z-20">
            <div className="absolute top-20 left-10 text-[#57BBB6]/15 animate-bounce" style={{ animationDelay: '0s' }}>
              <MapPin className="w-8 h-8" />
            </div>
            <div className="absolute bottom-20 right-20 text-[#376F6B]/12 animate-bounce" style={{ animationDelay: '1s' }}>
              <Building2 className="w-6 h-6" />
            </div>
            <div className="absolute top-1/2 left-1/4 text-[#57BBB6]/18 animate-bounce" style={{ animationDelay: '2s' }}>
              <Heart className="w-7 h-7" />
            </div>
          </div>
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-30">
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
      </>
    );
};

export default Contact;
