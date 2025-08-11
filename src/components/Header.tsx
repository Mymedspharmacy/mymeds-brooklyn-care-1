import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from "react";
import { Menu, X, Phone, Pill, ArrowRight, ShoppingCart, User, Truck, Shield, Users, Stethoscope, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

interface HeaderProps {
  onRefillClick: () => void;
  onAppointmentClick: () => void;
  onTransferClick: () => void;
}

export const Header = ({ onRefillClick, onAppointmentClick, onTransferClick }: HeaderProps) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isMenuOpen && !target.closest('.mobile-menu') && !target.closest('.mobile-menu-button')) {
        setIsMenuOpen(false);
      }
    };

    // Close menu on escape key
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    // Close menu when scrolling
    const handleScroll = () => {
      if (isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

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

  return (
    <>
      {/* Top Bar - Simple CTA */}
      <div className="bg-[#376F6B] text-white py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <p className="text-sm font-semibold">
            Protect your health, book your consultation now
          </p>
          <Button 
            onClick={onAppointmentClick}
            className="bg-white text-[#376F6B] hover:bg-gray-100 font-semibold px-4 py-1 text-sm rounded transition-colors"
          >
            Book Now
          </Button>
        </div>
      </div>

      {/* Main Header - Simple Design with Glowing Border */}
      <header className={`bg-white sticky top-0 z-40 transition-all duration-300 ${
        isScrolled ? 'shadow-md' : 'shadow-sm'
      }`}>
        <div className="container mx-auto px-4 py-4 sm:py-5 md:py-6 flex items-center justify-between gap-4">
          
          {/* Left: Logo */}
          <div className="flex items-center">
            <div onClick={() => navigate('/')} className="cursor-pointer group">
              <img
                src={logo}
                alt="My Meds Pharmacy Logo"
                className="h-16 w-auto sm:h-20 md:h-24 lg:h-28 object-contain transition-all duration-300 group-hover:scale-105 drop-shadow-lg"
              />
            </div>
          </div>

          {/* Center: Navigation Links - Desktop Only */}
          <nav className="hidden lg:flex items-center space-x-8">
            <button onClick={() => navigate('/')} className="text-[#376F6B] hover:text-[#D5C6BC] font-medium transition-colors">
              Home
            </button>
            <div className="relative group">
              <button onClick={() => navigate('/services')} className="text-[#376F6B] hover:text-[#D5C6BC] font-medium transition-colors flex items-center gap-1">
                Services
                <ArrowRight className="h-3 w-3 transform group-hover:rotate-90 transition-transform duration-300" />
              </button>
              {/* Services Dropdown */}
              <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-50">
                <div className="p-4">
                  <div className="text-sm font-semibold text-[#57BBB6] mb-3 text-center">Our Services</div>
                  <div className="space-y-2">
                    <button onClick={() => navigate('/services?service=prescription-refills')} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#57BBB6]/10 transition-colors duration-200 w-full text-left">
                      <Pill className="h-4 w-4 text-[#376F6B]" />
                      <span className="text-sm text-[#57BBB6]">Prescription Refills</span>
                    </button>
                    <button onClick={() => navigate('/services?service=same-day-delivery')} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#57BBB6]/10 transition-colors duration-200 w-full text-left">
                      <Truck className="h-4 w-4 text-[#376F6B]" />
                      <span className="text-sm text-[#57BBB6]">Same-Day Delivery</span>
                    </button>
                    <button onClick={() => navigate('/services?service=medication-management')} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#57BBB6]/10 transition-colors duration-200 w-full text-left">
                      <Shield className="h-4 w-4 text-[#376F6B]" />
                      <span className="text-sm text-[#57BBB6]">Medication Reviews</span>
                    </button>
                    <button onClick={() => navigate('/services?service=health-consultations')} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#57BBB6]/10 transition-colors duration-200 w-full text-left">
                      <Users className="h-4 w-4 text-[#376F6B]" />
                      <span className="text-sm text-[#57BBB6]">Health Consultations</span>
                    </button>
                    <button onClick={() => navigate('/services?service=immunizations')} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#57BBB6]/10 transition-colors duration-200 w-full text-left">
                      <Stethoscope className="h-4 w-4 text-[#376F6B]" />
                      <span className="text-sm text-[#57BBB6]">Immunizations</span>
                    </button>
                    <button onClick={() => navigate('/services?service=24-7-support')} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#57BBB6]/10 transition-colors duration-200 w-full text-left">
                      <MessageCircle className="h-4 w-4 text-[#376F6B]" />
                      <span className="text-sm text-[#57BBB6]">24/7 Support</span>
                    </button>
                  </div>
                  <div className="mt-3 pt-3 border-t border-[#57BBB6]/20">
                    <button onClick={() => navigate('/services')} className="block text-center text-sm font-medium text-[#376F6B] hover:text-[#D5C6BC] transition-colors duration-200 w-full">
                      View All Services
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <button onClick={() => navigate('/blog')} className="text-[#376F6B] hover:text-[#D5C6BC] font-medium transition-colors">
              Blog
            </button>
            <button onClick={() => navigate('/special-offers')} className="text-[#376F6B] hover:text-[#D5C6BC] font-medium transition-colors">
              Special Offers
            </button>
            <button onClick={() => navigate('/about')} className="text-[#376F6B] hover:text-[#D5C6BC] font-medium transition-colors">
              About
            </button>
            <button onClick={() => navigate('/contact')} className="text-[#376F6B] hover:text-[#D5C6BC] font-medium transition-colors">
              Contact
            </button>
          </nav>

          {/* Right: CTA Buttons - Desktop Only */}
          <div className="hidden lg:flex items-center space-x-3">
            <Button 
              onClick={onRefillClick}
              className="bg-[#376F6B] text-white font-semibold px-4 py-2 rounded hover:bg-[#D5C6BC] hover:text-[#376F6B] transition-colors"
            >
              Refill Rx
            </Button>
            
            <Button 
              onClick={onTransferClick}
              className="bg-[#376F6B] text-white font-semibold px-4 py-2 rounded hover:bg-[#D5C6BC] hover:text-[#376F6B] transition-colors"
            >
              Transfer Rx
            </Button>
            
            <Button 
              onClick={() => navigate('/shop')}
              className="bg-[#376F6B] text-white font-semibold px-4 py-2 rounded hover:bg-[#D5C6BC] hover:text-[#376F6B] transition-colors"
            >
              Shop
            </Button>
            
            <Button 
              onClick={() => navigate('/patient-portal')}
              className="bg-[#376F6B] text-white font-semibold px-4 py-2 rounded hover:bg-[#D5C6BC] hover:text-[#376F6B] transition-colors"
            >
              Patient Portal
            </Button>
            
            <Button 
              onClick={handleCallClick}
              className="bg-[#376F6B] text-white font-semibold px-4 py-2 rounded hover:bg-[#D5C6BC] hover:text-[#376F6B] transition-colors flex items-center"
            >
              <Phone className="w-4 h-4 mr-2" />
              Call Now
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button
              className="mobile-menu-button p-2 text-[#376F6B] hover:bg-[#57BBB6]/10 rounded focus:outline-none"
              onClick={() => setIsMenuOpen(v => !v)}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Glowing Teal Border */}
        <div className="h-1 bg-gradient-to-r from-transparent via-[#376F6B] to-transparent shadow-[0_0_20px_rgba(55,111,107,0.6)]"></div>

        {/* Mobile Dropdown Menu */}
        <div className={`mobile-menu lg:hidden absolute top-full left-0 right-0 bg-white shadow-lg transform transition-all duration-300 ease-in-out z-50 ${
          isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}>
          <div className="container mx-auto px-4 py-4">
            {/* Navigation Links */}
            <div className="space-y-3 mb-6">
              <button onClick={() => { navigate('/'); setIsMenuOpen(false); }} className="block text-base font-medium text-[#376F6B] hover:text-[#D5C6BC] py-2 transition-colors text-left w-full">
                Home
              </button>
              <button onClick={() => { navigate('/services'); setIsMenuOpen(false); }} className="block text-base font-medium text-[#376F6B] hover:text-[#D5C6BC] py-2 transition-colors text-left w-full">
                Services
              </button>
              <button onClick={() => { navigate('/blog'); setIsMenuOpen(false); }} className="block text-base font-medium text-[#376F6B] hover:text-[#D5C6BC] py-2 transition-colors text-left w-full">
                Blog
              </button>
              <button onClick={() => { navigate('/special-offers'); setIsMenuOpen(false); }} className="block text-base font-medium text-[#376F6B] hover:text-[#D5C6BC] py-2 transition-colors text-left w-full">
                Special Offers
              </button>
              <button onClick={() => { navigate('/about'); setIsMenuOpen(false); }} className="block text-base font-medium text-[#376F6B] hover:text-[#D5C6BC] py-2 transition-colors text-left w-full">
                About
              </button>
              <button onClick={() => { navigate('/contact'); setIsMenuOpen(false); }} className="block text-base font-medium text-[#376F6B] hover:text-[#D5C6BC] py-2 transition-colors text-left w-full">
                Contact
              </button>
              
              {/* Additional Pages */}
              <div className="pt-2 border-t border-[#57BBB6]/20">
                <div className="text-xs font-medium text-[#57BBB6] mb-2 px-2">MORE PAGES</div>
                <button onClick={() => { navigate('/blog'); setIsMenuOpen(false); }} className="block text-sm text-[#376F6B] hover:text-[#D5C6BC] py-2 transition-colors text-left w-full">
                  Health Blog
                </button>
                <button onClick={() => { navigate('/patient-resources'); setIsMenuOpen(false); }} className="block text-sm text-[#376F6B] hover:text-[#D5C6BC] py-2 transition-colors text-left w-full">
                  Patient Resources
                </button>
              </div>
            </div>
            
            {/* Mobile CTA Buttons */}
            <div className="space-y-3">
              <Button 
                onClick={() => {
                  onRefillClick();
                  setIsMenuOpen(false);
                }}
                className="w-full bg-[#376F6B] text-white font-semibold py-3 rounded hover:bg-[#D5C6BC] hover:text-[#376F6B] transition-colors"
              >
                Refill Rx
              </Button>
              
              <Button 
                onClick={() => {
                  onTransferClick();
                  setIsMenuOpen(false);
                }}
                className="w-full bg-[#376F6B] text-white font-semibold py-3 rounded hover:bg-[#D5C6BC] hover:text-[#376F6B] transition-colors"
              >
                Transfer Rx
              </Button>
              
              <Button 
                onClick={() => {
                  navigate('/shop');
                  setIsMenuOpen(false);
                }}
                className="w-full bg-[#376F6B] text-white font-semibold py-3 rounded hover:bg-[#D5C6BC] hover:text-[#376F6B] transition-colors"
              >
                Shop
              </Button>
              
              <Button 
                onClick={() => {
                  navigate('/patient-portal');
                  setIsMenuOpen(false);
                }}
                className="w-full bg-[#376F6B] text-white font-semibold py-3 rounded hover:bg-[#D5C6BC] hover:text-[#376F6B] transition-colors"
              >
                Patient Portal
              </Button>
              
              <Button 
                onClick={() => {
                  handleCallClick();
                  setIsMenuOpen(false);
                }}
                className="w-full bg-[#376F6B] text-white font-semibold py-3 rounded hover:bg-[#D5C6BC] hover:text-[#376F6B] transition-colors flex items-center justify-center"
              >
                <Phone className="w-4 h-4 mr-2" />
                Call Now
              </Button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};
