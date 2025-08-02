import { useNavigate } from 'react-router-dom';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Youtube,
  Heart,
  Shield,
  Truck,
  Star,
  ArrowRight,
  ExternalLink,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const Footer = () => {
  const navigate = useNavigate();
  
  const handleCallClick = () => {
    const phoneNumber = '3473126458';
    const telLink = `tel:${phoneNumber}`;
    if (navigator.userAgent.match(/iPhone|iPad|iPod|Android/i)) {
      window.location.href = telLink;
    } else {
      if (confirm(`Call ${phoneNumber}?`)) {
        window.open(telLink);
      }
    }
  };

  const handleEmailClick = () => {
    window.open('mailto:info@mymedspharmacy.com');
  };

  const handleMapClick = () => {
    window.open('https://maps.app.goo.gl/gXSVqF25sAB7r6m76', '_blank');
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main Footer Content */}
        <div className="py-16 sm:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            
            {/* Company Info */}
            <div className="lg:col-span-1">
              <div className="mb-6">
                <div 
                  onClick={() => navigate('/')} 
                  className="cursor-pointer group"
                >
                  <img 
                    src="/logo.png" 
                    alt="My Meds Pharmacy Logo" 
                    className="h-16 w-auto mb-4 transition-all duration-300 ease-in-out group-hover:scale-105"
                  />
                </div>
                <p className="text-gray-300 leading-relaxed mb-6">
                  Your trusted partner in health and wellness. We provide exceptional pharmaceutical care with personalized attention and expert guidance.
                </p>
              </div>
              
              {/* Social Media */}
              <div className="flex space-x-4 mb-6">
                <a 
                  href="#" 
                  className="w-10 h-10 bg-gradient-to-r from-[#57bbb6] to-[#376f6b] rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300 group"
                  aria-label="Facebook"
                >
                  <Facebook className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                </a>
                <a 
                  href="#" 
                  className="w-10 h-10 bg-gradient-to-r from-[#57bbb6] to-[#376f6b] rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300 group"
                  aria-label="Twitter"
                >
                  <Twitter className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                </a>
                <a 
                  href="#" 
                  className="w-10 h-10 bg-gradient-to-r from-[#57bbb6] to-[#376f6b] rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300 group"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                </a>
                <a 
                  href="#" 
                  className="w-10 h-10 bg-gradient-to-r from-[#57bbb6] to-[#376f6b] rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300 group"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                </a>
              </div>

              {/* Trust Badges */}
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <Shield className="h-4 w-4 text-[#57bbb6]" />
                  <span>Licensed</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-[#57bbb6]" />
                  <span>5-Star Rated</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-xl font-bold mb-6 text-white">Quick Links</h3>
              <ul className="space-y-3">
                <li>
                  <a 
                    href="/" 
                    className="text-gray-300 hover:text-[#57bbb6] transition-colors duration-300 flex items-center group"
                  >
                    <ArrowRight className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                    Home
                  </a>
                </li>
                <li>
                  <a 
                    href="#services" 
                    className="text-gray-300 hover:text-[#57bbb6] transition-colors duration-300 flex items-center group"
                  >
                    <ArrowRight className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                    Services
                  </a>
                </li>
                <li>
                  <a 
                    href="/shop" 
                    className="text-gray-300 hover:text-[#57bbb6] transition-colors duration-300 flex items-center group"
                  >
                    <ArrowRight className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                    Shop
                  </a>
                </li>
                <li>
                  <a 
                    href="/blog" 
                    className="text-gray-300 hover:text-[#57bbb6] transition-colors duration-300 flex items-center group"
                  >
                    <ArrowRight className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                    Health Blog
                  </a>
                </li>
                <li>
                  <a 
                    href="#about" 
                    className="text-gray-300 hover:text-[#57bbb6] transition-colors duration-300 flex items-center group"
                  >
                    <ArrowRight className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                    About Us
                  </a>
                </li>
                <li>
                  <a 
                    href="#contact" 
                    className="text-gray-300 hover:text-[#57bbb6] transition-colors duration-300 flex items-center group"
                  >
                    <ArrowRight className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                    Contact
                  </a>
                </li>
                <li>
                  <a 
                    onClick={() => navigate('/admin')}
                    className="text-gray-300 hover:text-[#57bbb6] transition-colors duration-300 flex items-center group cursor-pointer"
                  >
                    <Settings className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                    Admin Panel
                  </a>
                </li>
              </ul>
            </div>

            {/* Services */}
            <div>
              <h3 className="text-xl font-bold mb-6 text-white">Our Services</h3>
              <ul className="space-y-3">
                <li>
                  <a 
                    href="#" 
                    className="text-gray-300 hover:text-[#57bbb6] transition-colors duration-300 flex items-center group"
                  >
                    <Heart className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                    Prescription Refills
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    className="text-gray-300 hover:text-[#57bbb6] transition-colors duration-300 flex items-center group"
                  >
                    <Truck className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                    Same-Day Delivery
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    className="text-gray-300 hover:text-[#57bbb6] transition-colors duration-300 flex items-center group"
                  >
                    <Shield className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                    Medication Management
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    className="text-gray-300 hover:text-[#57bbb6] transition-colors duration-300 flex items-center group"
                  >
                    <Clock className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                    24/7 Consultation
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    className="text-gray-300 hover:text-[#57bbb6] transition-colors duration-300 flex items-center group"
                  >
                    <Star className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                    Insurance Coordination
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    className="text-gray-300 hover:text-[#57bbb6] transition-colors duration-300 flex items-center group"
                  >
                    <Heart className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                    Immunizations
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-xl font-bold mb-6 text-white">Contact Info</h3>
              <div className="space-y-4">
                <div className="flex items-start group">
                  <div className="w-10 h-10 bg-gradient-to-r from-[#57bbb6] to-[#376f6b] rounded-full flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-gray-300 text-sm">Phone</p>
                    <button 
                      onClick={handleCallClick}
                      className="text-white font-semibold hover:text-[#57bbb6] transition-colors duration-300"
                    >
                      (347) 312-6458
                    </button>
                  </div>
                </div>

                <div className="flex items-start group">
                  <div className="w-10 h-10 bg-gradient-to-r from-[#57bbb6] to-[#376f6b] rounded-full flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-gray-300 text-sm">Email</p>
                    <button 
                      onClick={handleEmailClick}
                      className="text-white font-semibold hover:text-[#57bbb6] transition-colors duration-300"
                    >
                      info@mymedspharmacy.com
                    </button>
                  </div>
                </div>

                <div className="flex items-start group">
                  <div className="w-10 h-10 bg-gradient-to-r from-[#57bbb6] to-[#376f6b] rounded-full flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-gray-300 text-sm">Location</p>
                                         <button 
                       onClick={handleMapClick}
                       className="text-white font-semibold hover:text-[#57bbb6] transition-colors duration-300 flex items-center group"
                     >
                       J279+5V Brooklyn, NY
                       <ExternalLink className="h-3 w-3 ml-1 group-hover:translate-x-0.5 transition-transform duration-300" />
                     </button>
                  </div>
                </div>

                <div className="flex items-start group">
                  <div className="w-10 h-10 bg-gradient-to-r from-[#57bbb6] to-[#376f6b] rounded-full flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-gray-300 text-sm">Hours</p>
                    <p className="text-white font-semibold">Mon-Fri: 8AM-8PM</p>
                    <p className="text-white font-semibold">Sat-Sun: 9AM-6PM</p>
                  </div>
                </div>
              </div>

              {/* Newsletter Signup */}
              <div className="mt-8">
                <h4 className="text-lg font-semibold mb-3 text-white">Stay Updated</h4>
                <div className="flex">
                  <input 
                    type="email" 
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-2 rounded-l-lg border-0 focus:ring-2 focus:ring-[#57bbb6] focus:outline-none text-gray-900"
                  />
                  <Button className="bg-gradient-to-r from-[#57bbb6] to-[#376f6b] hover:shadow-lg text-white px-4 py-2 rounded-r-lg transition-all duration-300 transform hover:scale-105">
                    Subscribe
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-400 text-sm">
              © {currentYear} My Meds Pharmacy. All rights reserved.
            </div>
            <div className="flex items-center gap-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-[#57bbb6] transition-colors duration-300">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-[#57bbb6] transition-colors duration-300">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-[#57bbb6] transition-colors duration-300">
                HIPAA Notice
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
