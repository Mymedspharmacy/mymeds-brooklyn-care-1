import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from "react";
import { Menu, X, Phone, Pill, ArrowRight, ShoppingCart, User } from "lucide-react";
import { Button } from "@/components/ui/button";

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
      {/* Top Bar - Compact CTA */}
      <div className="bg-brand text-white py-2 px-4 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
          <p className="text-xs sm:text-sm font-semibold whitespace-nowrap text-center">
            Protect your health, book your consultation now
          </p>
          <Button
            onClick={onAppointmentClick}
            variant="outline"
            className="bg-white text-brand hover:bg-white/90 border border-white/20 px-3 py-1 h-auto text-xs font-bold rounded-full shadow-sm"
          >
            BOOK NOW
          </Button>
        </div>
      </div>

      {/* Main Header - Enhanced Desktop Design */}
      <header className={`bg-white/95 backdrop-blur-md sticky top-0 z-40 border-b border-gray-100/50 transition-all duration-300 ${
        isScrolled ? 'shadow-xl bg-white/98' : 'shadow-lg'
      }`}>
        <div className="container mx-auto px-4 py-3 sm:py-2 flex items-center justify-between gap-4 relative">
          
          {/* Left: Logo - Mobile Responsive */}
          <div className="flex-1 flex justify-start lg:justify-start">
            <div onClick={() => navigate('/')} className="cursor-pointer group">
              <img
                src="/logo.png"
                alt="My Meds Pharmacy Logo"
                className="h-8 w-auto sm:h-12 md:h-16 lg:h-20 xl:h-24 2xl:h-28 object-contain transition-all duration-300 ease-in-out group-hover:scale-105 drop-shadow-sm"
              />
            </div>
          </div>

          {/* Right: Mobile Actions (Clickable phone number + Menu) */}
          <div className="lg:hidden relative z-[9999] flex items-center gap-3">
            <a
              href="tel:3473126458"
              className="flex items-center gap-2 text-brand font-bold whitespace-nowrap"
              aria-label="Call (347) 312-6458"
            >
              <Phone className="h-5 w-5" />
              <span className="text-sm">(347) 312-6458</span>
            </a>
            <button
              className="mobile-menu-button flex items-center justify-center p-3 rounded-lg text-brand hover:bg-brand-light/10 focus:outline-none focus:ring-2 focus:ring-brand-light transition-all duration-300 bg-white/90 backdrop-blur-sm shadow-md"
              onClick={() => setIsMenuOpen(v => !v)}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Enhanced Navigation - Desktop Only */}
          <nav className="hidden lg:flex items-center justify-center flex-1">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl px-6 py-3 shadow-lg border border-gray-100/50">
              <ul className="flex items-center gap-1">
                <li>
                  <a 
                    href="/" 
                    className="text-brand font-semibold text-sm xl:text-base hover:text-brand-light transition-all duration-300 relative group px-4 py-2.5 rounded-xl hover:bg-gradient-to-r hover:from-brand-light/10 hover:to-brand/10 whitespace-nowrap hover:shadow-md hover:scale-105 transform"
                  >
                    Home
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-brand-light to-brand transition-all duration-300 group-hover:w-full rounded-full opacity-0 group-hover:opacity-100"></span>
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-light/20 to-brand/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </a>
                </li>
                <li>
                  <a 
                    href="#services" 
                    className="text-brand font-semibold text-sm xl:text-base hover:text-brand-light transition-all duration-300 relative group px-4 py-2.5 rounded-xl hover:bg-gradient-to-r hover:from-brand-light/10 hover:to-brand/10 whitespace-nowrap hover:shadow-md hover:scale-105 transform"
                  >
                    Services
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-brand-light to-brand transition-all duration-300 group-hover:w-full rounded-full opacity-0 group-hover:opacity-100"></span>
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-light/20 to-brand/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </a>
                </li>
                
                <li>
                  <a 
                    href="/blog" 
                    className="text-brand font-semibold text-sm xl:text-base hover:text-brand-light transition-all duration-300 relative group px-4 py-2.5 rounded-xl hover:bg-gradient-to-r hover:from-brand-light/10 hover:to-brand/10 whitespace-nowrap hover:shadow-md hover:scale-105 transform"
                  >
                    Blogs
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-brand-light to-brand transition-all duration-300 group-hover:w-full rounded-full opacity-0 group-hover:opacity-100"></span>
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-light/20 to-brand/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </a>
                </li>
                
                <li>
                  <a 
                    href="#about" 
                    className="text-brand font-semibold text-sm xl:text-base hover:text-brand-light transition-all duration-300 relative group px-4 py-2.5 rounded-xl hover:bg-gradient-to-r hover:from-brand-light/10 hover:to-brand/10 whitespace-nowrap hover:shadow-md hover:scale-105 transform"
                  >
                    About
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-brand-light to-brand transition-all duration-300 group-hover:w-full rounded-full opacity-0 group-hover:opacity-100"></span>
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-light/20 to-brand/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </a>
                </li>
                <li>
                  <a 
                    href="#contact" 
                    className="text-brand font-semibold text-sm xl:text-base hover:text-brand-light transition-all duration-300 relative group px-4 py-2.5 rounded-xl hover:bg-gradient-to-r hover:from-brand-light/10 hover:to-brand/10 whitespace-nowrap hover:shadow-md hover:scale-105 transform"
                  >
                    Contact
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-brand-light to-brand transition-all duration-300 group-hover:w-full rounded-full opacity-0 group-hover:opacity-100"></span>
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-light/20 to-brand/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </a>
                </li>
              </ul>
            </div>
          </nav>

          {/* Enhanced CTA Buttons - Desktop Only */}
          <div className="hidden lg:flex items-center gap-2 xl:gap-3 flex-shrink-0">
            {/* Refill Button - Enhanced */}
            <Button 
              onClick={onRefillClick}
              className="bg-gradient-to-r from-brand-light to-brand-accent text-white font-bold px-3 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-brand-light/20 hover:border-brand-accent/30 group text-xs xl:text-sm"
            >
              <Pill className="w-3 h-3 xl:w-4 xl:h-4 mr-1.5 group-hover:rotate-12 transition-transform" />
              Refill Rx
              <ArrowRight className="w-3 h-3 xl:w-4 xl:h-4 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
            </Button>
            
            {/* Transfer Button - Enhanced */}
            <Button 
              onClick={onTransferClick}
              className="bg-gradient-to-r from-brand to-brand-dark text-white font-bold px-3 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-brand/20 hover:border-brand-dark/30 group text-xs xl:text-sm"
            >
              <ArrowRight className="w-3 h-3 xl:w-4 xl:h-4 mr-1.5 group-hover:rotate-12 transition-transform" />
              Transfer Rx
              <ArrowRight className="w-3 h-3 xl:w-4 xl:h-4 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
            </Button>
            
            {/* Shop Button - Enhanced */}
            <Button 
              onClick={() => window.location.href = '/shop'}
              className="bg-gradient-to-r from-brand-accent to-brand text-white font-bold px-3 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-brand-accent/20 hover:border-brand/30 group text-xs xl:text-sm"
            >
              <ShoppingCart className="w-3 h-3 xl:w-4 xl:h-4 mr-1.5 group-hover:rotate-12 transition-transform" />
              Shop
              <ArrowRight className="w-3 h-3 xl:w-4 xl:h-4 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
            </Button>
            
            {/* Patient Portal Button - Enhanced */}
            <Button 
              onClick={() => window.location.href = '/patient-portal'}
              className="bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold px-3 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-purple-500/20 hover:border-purple-600/30 group text-xs xl:text-sm"
            >
              <User className="w-3 h-3 xl:w-4 xl:h-4 mr-1.5 group-hover:rotate-12 transition-transform" />
              Patient Portal
              <ArrowRight className="w-3 h-3 xl:w-4 xl:h-4 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
            </Button>
            
            {/* Call Button - Enhanced */}
            <Button 
              onClick={handleCallClick}
              variant="outline"
              className="bg-white/80 backdrop-blur-sm text-brand font-semibold px-3 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-brand/30 hover:bg-brand hover:text-white group text-xs xl:text-sm"
            >
              <Phone className="w-3 h-3 xl:w-4 xl:h-4 mr-1.5 group-hover:animate-pulse" />
              Call Now
            </Button>
          </div>
        </div>

        {/* Mobile Dropdown Menu - Enhanced Responsive */}
        <div className={`mobile-menu lg:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-md shadow-2xl border-b border-gray-200/50 transform transition-all duration-300 ease-in-out z-50 max-h-[80vh] overflow-y-auto ${
          isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}>
          <div className="container mx-auto px-4 py-6">
            {/* Navigation Links - Enhanced Mobile Styling */}
            <div className="grid grid-cols-1 gap-3 mb-6">
              <a href="/" onClick={() => setIsMenuOpen(false)} className="flex items-center text-base font-semibold text-brand-black hover:text-brand py-4 px-4 rounded-xl hover:bg-gradient-to-r hover:from-brand-light/10 hover:to-brand/10 transition-all duration-300 border border-transparent hover:border-brand-light/20 shadow-sm hover:shadow-md">
                <span className="w-2 h-2 bg-brand rounded-full mr-3"></span>
                Home
              </a>
              <a href="#services" onClick={() => setIsMenuOpen(false)} className="flex items-center text-base font-semibold text-brand-black hover:text-brand py-4 px-4 rounded-xl hover:bg-gradient-to-r hover:from-brand-light/10 hover:to-brand/10 transition-all duration-300 border border-transparent hover:border-brand-light/20 shadow-sm hover:shadow-md">
                <span className="w-2 h-2 bg-brand rounded-full mr-3"></span>
                Services
              </a>
              <a href="/patient-resources" onClick={() => setIsMenuOpen(false)} className="flex items-center text-base font-semibold text-brand-black hover:text-brand py-4 px-4 rounded-xl hover:bg-gradient-to-r hover:from-brand-light/10 hover:to-brand/10 transition-all duration-300 border border-transparent hover:border-brand-light/20 shadow-sm hover:shadow-md">
                <span className="w-2 h-2 bg-brand rounded-full mr-3"></span>
                Patient Resources
              </a>
              
              <a href="/blog" onClick={() => setIsMenuOpen(false)} className="flex items-center text-base font-semibold text-brand-black hover:text-brand py-4 px-4 rounded-xl hover:bg-gradient-to-r hover:from-brand-light/10 hover:to-brand/10 transition-all duration-300 border border-transparent hover:border-brand-light/20 shadow-sm hover:shadow-md">
                <span className="w-2 h-2 bg-brand rounded-full mr-3"></span>
                Blogs
              </a>
              <a href="#about" onClick={() => setIsMenuOpen(false)} className="flex items-center text-base font-semibold text-brand-black hover:text-brand py-4 px-4 rounded-xl hover:bg-gradient-to-r hover:from-brand-light/10 hover:to-brand/10 transition-all duration-300 border border-transparent hover:border-brand-light/20 shadow-sm hover:shadow-md">
                <span className="w-2 h-2 bg-brand rounded-full mr-3"></span>
                About
              </a>
              <a href="#contact" onClick={() => setIsMenuOpen(false)} className="flex items-center text-base font-semibold text-brand-black hover:text-brand py-4 px-4 rounded-xl hover:bg-gradient-to-r hover:from-brand-light/10 hover:to-brand/10 transition-all duration-300 border border-transparent hover:border-brand-light/20 shadow-sm hover:shadow-md">
                <span className="w-2 h-2 bg-brand rounded-full mr-3"></span>
                Contact
              </a>
            </div>
            
            {/* Mobile CTA Buttons - Enhanced */}
            <div className="grid grid-cols-1 gap-4">
              <Button 
                onClick={() => {
                  onRefillClick();
                  setIsMenuOpen(false);
                }}
                className="bg-gradient-to-r from-brand-light to-brand-accent text-white font-bold px-6 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-brand-light/20 hover:border-brand-accent/30 group text-base"
              >
                <Pill className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform" />
                Refill Prescription
                <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-0.5 transition-transform" />
              </Button>
              
              <Button 
                onClick={() => {
                  onTransferClick();
                  setIsMenuOpen(false);
                }}
                className="bg-gradient-to-r from-brand to-brand-dark text-white font-bold px-6 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-brand/20 hover:border-brand-dark/30 group text-base"
              >
                <ArrowRight className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform" />
                Transfer Prescription
                <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-0.5 transition-transform" />
              </Button>
              
              <Button 
                onClick={() => {
                  window.location.href = '/shop';
                  setIsMenuOpen(false);
                }}
                className="bg-gradient-to-r from-brand-accent to-brand text-white font-bold px-6 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-brand-accent/20 hover:border-brand/30 group text-base"
              >
                <ShoppingCart className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform" />
                Shop Products
                <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-0.5 transition-transform" />
              </Button>
              
              <Button 
                onClick={() => {
                  window.location.href = '/patient-portal';
                  setIsMenuOpen(false);
                }}
                className="bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold px-6 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-purple-500/20 hover:border-purple-600/30 group text-base"
              >
                <User className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform" />
                Patient Portal
                <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-0.5 transition-transform" />
              </Button>
              
              <Button 
                onClick={() => {
                  handleCallClick();
                  setIsMenuOpen(false);
                }}
                variant="outline"
                className="bg-white/90 backdrop-blur-sm text-brand font-semibold px-6 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-brand/30 hover:bg-brand hover:text-white group text-base"
              >
                <Phone className="w-5 h-5 mr-3 group-hover:animate-pulse" />
                Call Now
              </Button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};
