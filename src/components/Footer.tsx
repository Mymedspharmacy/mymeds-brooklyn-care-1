import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
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
  Settings,
  Users,
  Stethoscope,
  MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import logo from "@/assets/logo.png";

export const Footer = () => {
  const navigate = useNavigate();
  const [isSubscribed, setIsSubscribed] = useState(false);
  
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

  // Config-driven data (does not change behavior)
  const socialLinks = [
    { icon: Facebook, url: "https://facebook.com/mymedspharmacy", label: "Facebook" },
    { icon: Twitter, url: "https://twitter.com/mymedspharmacy", label: "Twitter" },
    { icon: Instagram, url: "https://instagram.com/mymedspharmacy", label: "Instagram" },
    { icon: Linkedin, url: "https://linkedin.com/company/mymedspharmacy", label: "LinkedIn" }
  ];

  const quickLinks = [
    { to: '/', label: 'Home', icon: ArrowRight },
    { to: '/services', label: 'Services', icon: ArrowRight },
    { to: '/shop', label: 'Shop', icon: ArrowRight },
    { to: '/special-offers', label: 'Special Offers', icon: Star },
    { to: '/blog', label: 'Health Blog', icon: ArrowRight },
  ];

  const servicesLinks = [
    { to: '/services?service=prescription-refills', label: 'Prescription Refills', icon: Heart },
    { to: '/services?service=same-day-delivery', label: 'Same-Day Delivery', icon: Truck },
    { to: '/services?service=medication-management', label: 'Medication Management', icon: Shield },
    { to: '/services?service=health-consultations', label: 'Health Consultations', icon: Users },
    { to: '/services?service=immunizations', label: 'Immunizations', icon: Stethoscope },
    { to: '/services?service=24-7-support', label: '24/7 Support', icon: MessageCircle },
  ];

  return (
    
    <footer className="bg-white text-gray-800 relative overflow-hidden border-t border-gray-200">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-3" aria-hidden="true">
        <div className="absolute inset-0" aria-hidden="true" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main Footer Content */}
        <div className="py-16 sm:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
            
            {/* Company Info */}
            <div className="lg:col-span-1">
              <div className="mb-6">
                <div 
                  onClick={() => navigate('/')} 
                  className="cursor-pointer group"
                >
                  <img 
                    src={logo} 
                    alt="My Meds Pharmacy Logo" 
                    className="h-16 w-auto sm:h-20 md:h-24 lg:h-auto transition-all duration-300 ease-in-out group-hover:scale-105"
                  />
                </div>
                <p className="text-[#57BBB6] leading-relaxed mb-6">
                  Your trusted partner in health and wellness. We're committed to providing exceptional pharmaceutical care and personalized service to our community.
                </p>
              </div>
              
              {/* Social Media */}
              <div className="flex space-x-4 mb-6">
                {socialLinks.map((s, idx) => (
                  <a
                    key={idx}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gradient-to-r from-[#57BBB6] to-[#376F6B] rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300 group"
                    aria-label={`Follow us on ${s.label}`}
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.click()}
                  >
                    <s.icon className="h-5 w-5 text-white group-hover:rotate-12 transition-transform duration-300" />
                  </a>
                ))}
              </div>

              {/* Trust Badges */}
              <div className="flex items-center gap-4 text-sm text-[#57BBB6]">
                <div className="flex items-center gap-1">
                  <Shield className="h-4 w-4 text-[#57BBB6]" />
                  <span>Licensed</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-[#57BBB6]" />
                  <span>5-Star Rated</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="lg:pl-8 lg:border-l lg:border-[#57BBB6]/20">
              <h3 className="text-sm font-bold uppercase tracking-wider mb-6 text-[#57BBB6]">Quick Links</h3>
              <ul className="space-y-3">
                {quickLinks.map((item, idx) => (
                  <li key={idx}>
                    <Link 
                      to={item.to}
                      className="text-gray-600 hover:text-[#57BBB6] transition-colors duration-300 flex items-center group"
                      aria-label={`Navigate to ${item.label.toLowerCase()}`}
                    >
                      <item.icon className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                      {item.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <a 
                    href="#about" 
                    className="text-gray-600 hover:text-[#57BBB6] transition-colors duration-300 flex items-center group"
                    aria-label="Scroll to about us section"
                  >
                    <ArrowRight className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                    About Us
                  </a>
                </li>
                <li>
                  <a 
                    href="#contact" 
                    className="text-gray-600 hover:text-[#57BBB6] transition-colors duration-300 flex items-center group"
                    aria-label="Scroll to contact section"
                  >
                    <ArrowRight className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                    Contact
                  </a>
                </li>
                <li>
                  <Link 
                    to="/admin"
                    className="text-gray-600 hover:text-[#57BBB6] transition-colors duration-300 flex items-center group"
                    aria-label="Access admin panel"
                  >
                    <Settings className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                    Admin Panel
                  </Link>
                </li>
              </ul>
            </div>

            {/* Services */}
            <div className="lg:pl-8 lg:border-l lg:border-[#57BBB6]/20">
              <h3 className="text-sm font-bold uppercase tracking-wider mb-6 text-[#57BBB6]">Our Services</h3>
              <ul className="space-y-3">
                {servicesLinks.map((s, idx) => (
                  <li key={idx}>
                    <Link
                      to={s.to}
                      className="text-gray-600 hover:text-[#57BBB6] transition-colors duration-300 flex items-center group"
                      aria-label={`Learn about ${s.label.toLowerCase()}`}
                    >
                      <s.icon className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                      {s.label}
                    </Link>
                  </li>
                ))}
              </ul>

            </div>

            {/* Contact Info */}
            <div className="lg:pl-8 lg:pr-8 lg:border-l lg:border-[#57BBB6]/20">
              <h3 className="text-sm font-bold uppercase tracking-wider mb-6 text-[#57BBB6]">Contact Info</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-[36px,1fr] gap-3 items-center group">
                  <div className="w-9 h-9 shrink-0 bg-gradient-to-r from-[#57BBB6] to-[#376F6B] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Phone className="h-5 w-5 text-white" />
                  </div>
                  <div className="leading-6 space-y-0.5">
                    <p className="text-[#57BBB6] text-sm">Phone</p>
                    <button 
                      onClick={handleCallClick}
                      className="text-gray-800 font-semibold hover:text-[#57BBB6] transition-colors duration-300 whitespace-nowrap"
                      aria-label="Call us at (347) 312-6458"
                    >
                      (347) 312-6458
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-[36px,1fr] gap-3 items-center group">
                  <div className="w-9 h-9 shrink-0 bg-gradient-to-r from-[#57BBB6] to-[#376F6B] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Mail className="h-5 w-5 text-white" />
                  </div>
                  <div className="leading-6 space-y-0.5">
                    <p className="text-[#57BBB6] text-sm">Email</p>
                    <button 
                      onClick={handleEmailClick}
                      className="text-gray-800 font-semibold hover:text-[#57BBB6] transition-colors duration-300 whitespace-nowrap no-underline"
                      aria-label="Send email to mymedspharmacy@outlook.com"
                    >
                      info@mymedspharmacy.com
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-[36px,1fr] gap-3 items-center group">
                  <div className="w-9 h-9 shrink-0 bg-gradient-to-r from-[#57BBB6] to-[#376F6B] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <div className="leading-6 space-y-0.5">
                    <p className="text-[#57BBB6] text-sm">Location</p>
                    <button 
                      onClick={handleMapClick}
                      className="text-gray-800 font-semibold hover:text-[#57BBB6] transition-colors duration-300 flex items-center group"
                      aria-label="Open location in maps"
                    >
                      J279+5V Brooklyn, NY
                      <ExternalLink className="h-3 w-3 ml-1 group-hover:translate-x-0.5 transition-transform duration-300" />
                    </button>
                  </div>
                </div>

                {/* Hours moved under Services column */}
              </div>
            </div>

            {/* Business Hours - Separate Column */}
            <div className="lg:pl-10 lg:border-l lg:border-[#57BBB6]/20 min-w-[320px]">
              <h3 className="text-sm font-bold uppercase tracking-wider mb-6 text-[#57BBB6]">Business Hours</h3>
              <div className="grid grid-cols-[88px,1fr] gap-x-4 text-[#57BBB6] font-semibold text-sm leading-6 mb-8">
                <span className="text-[#57BBB6] self-start">Pharmacy</span>
                <span className="md:whitespace-nowrap">Mon-Fri 10:00 AM - 6:00 PM</span>
                <span className="text-[#57BBB6]"></span>
                <span className="md:whitespace-nowrap">Saturday 10:00 AM - 4:00 PM</span>
                <span className="text-[#57BBB6] pt-2 self-start">Store</span>
                <span className="pt-2 md:whitespace-nowrap">Mon-Fri 9:00 AM - 7:00 PM</span>
                <span className="text-[#57BBB6]"></span>
                <span className="md:whitespace-nowrap">Saturday 10:00 AM - 4:00 PM</span>
                <span className="text-[#57BBB6]"></span>
                <span className="md:whitespace-nowrap">Sunday Closed</span>
              </div>

              {/* Newsletter Signup - Moved here */}
              <div className="pt-6 border-t border-[#57BBB6]/20">
                <h4 className="text-xs font-semibold uppercase tracking-wider mb-3 text-[#57BBB6]">Stay Updated</h4>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget as HTMLFormElement);
                    const email = String(formData.get('email') || '').trim();
                    if (!email || !email.includes('@')) return;
                    try {
                      await api.post('/newsletter/subscribe', { email });
                      (e.currentTarget as HTMLFormElement).reset();
                      setIsSubscribed(true);
                    } catch (_) {
                      // intentionally silent; backend may not be wired in all envs
                    }
                  }}
                  className="flex items-stretch"
                >
                  <input 
                    name="email"
                    type="email" 
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-2 rounded-l-lg border border-gray-300 focus:ring-2 focus:ring-[#57BBB6] focus:outline-none text-gray-900 bg-white placeholder-gray-500"
                    aria-label="Email address for newsletter subscription"
                  />
                  <Button 
                    type="submit"
                    className="bg-gradient-to-r from-[#57BBB6] to-[#376F6B] hover:from-[#376F6B] hover:to-[#57BBB6] hover:shadow-lg text-white px-6 py-2 rounded-r-lg transition-all duration-300 transform hover:scale-105 border-0 font-semibold"
                    aria-label="Subscribe to newsletter"
                  >
                    Subscribe
                  </Button>
                </form>
                <p role="status" aria-live="polite" className={`mt-2 text-sm ${isSubscribed ? 'text-green-600' : 'text-transparent'}`}>
                  You're subscribed! We'll be in touch.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#57BBB6]/20 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-[#57BBB6] text-sm">
              © {currentYear} My Meds Pharmacy. All rights reserved.
            </div>
            <div className="flex items-center gap-6 text-sm">
              <Link 
                to="/privacy-policy"
                className="text-[#57BBB6] hover:text-[#57BBB6] transition-colors duration-300"
                aria-label="Read our privacy policy"
              >
                Privacy Policy
              </Link>
              <Link 
                to="/terms-of-service"
                className="text-[#57BBB6] hover:text-[#57BBB6] transition-colors duration-300"
                aria-label="Read our terms of service"
              >
                Terms of Service
              </Link>
              <Link 
                to="/hipaa-notice"
                className="text-[#57BBB6] hover:text-[#57BBB6] transition-colors duration-300"
                aria-label="Read our HIPAA notice"
              >
                HIPAA Notice
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
