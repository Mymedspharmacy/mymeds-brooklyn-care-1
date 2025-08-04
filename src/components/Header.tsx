import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from "react";
import { Menu, X, Phone, Pill, ArrowRight, Calendar, ShoppingCart } from "lucide-react";
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
      {/* Top Bar - Premium Design */}
      <div className="bg-gradient-to-r from-brand via-brand-accent to-brand-light text-white py-2.5 px-4 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <div className="flex justify-center sm:justify-start items-center gap-2.5">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-1.5">
              <Calendar className="h-4 w-4 text-white" />
            </div>
            <span className="text-xs sm:text-sm font-medium text-center sm:text-left">
              Book your consultation today for personalized care
            </span>
          </div>
          <div className="flex justify-center sm:justify-end">
            <Button
              onClick={onAppointmentClick}
              className="bg-white/95 backdrop-blur-sm text-brand hover:bg-white font-semibold px-4 py-1.5 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105 text-xs sm:text-sm border border-white/20"
            >
              <Calendar className="w-3 h-3 mr-1.5" />
              BOOK CONSULTATION
            </Button>
          </div>
        </div>
      </div>

      {/* Main Header - Enhanced Desktop Design */}
      <header className={`bg-white/95 backdrop-blur-md sticky top-0 z-40 border-b border-gray-100/50 transition-all duration-300 ${
        isScrolled ? 'shadow-xl bg-white/98' : 'shadow-lg'
      }`}>
        <div className="container mx-auto px-4 py-3 sm:py-2 flex items-center justify-between gap-4 relative">
          
          {/* Left: Mobile Menu Icon */}
          <div className="lg:hidden relative z-[9999]">
            <button
              className="mobile-menu-button flex items-center justify-center p-3 rounded-lg text-brand hover:bg-brand-light/10 focus:outline-none focus:ring-2 focus:ring-brand-light transition-all duration-300 bg-white/90 backdrop-blur-sm shadow-md"
              onClick={() => setIsMenuOpen(v => !v)}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Center: Logo - Perfectly centered on mobile */}
          <div className="flex-1 flex justify-center lg:justify-start">
            <div onClick={() => navigate('/')} className="cursor-pointer group">
              <img
                src="/logo.png"
                alt="My Meds Pharmacy Logo"
                className="h-auto w-auto sm:h-20 md:h-24 lg:h-28 xl:h-32 2xl:h-36 object-contain transition-all duration-300 ease-in-out group-hover:scale-105 drop-shadow-sm"
              />
            </div>
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
                    href="/shop" 
                    className="text-brand font-semibold text-sm xl:text-base hover:text-brand-light transition-all duration-300 relative group px-4 py-2.5 rounded-xl hover:bg-gradient-to-r hover:from-brand-light/10 hover:to-brand/10 whitespace-nowrap hover:shadow-md hover:scale-105 transform"
                  >
                    Shop
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

        {/* Mobile Dropdown Menu */}
        <div className={`mobile-menu lg:hidden absolute top-full left-0 right-0 bg-white shadow-xl border-b border-gray-200 transform transition-all duration-300 ease-in-out z-50 ${
          isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}>
          <div className="container mx-auto px-4 py-6">
            {/* Navigation Links */}
            <div className="grid grid-cols-1 gap-2 mb-6">
              <a href="/" onClick={() => setIsMenuOpen(false)} className="flex items-center text-base font-semibold text-brand-black hover:text-brand py-3 px-4 rounded-lg hover:bg-brand-light/10 transition-all duration-300 border border-transparent hover:border-brand-light/20">
                Home
              </a>
              <a href="#services" onClick={() => setIsMenuOpen(false)} className="flex items-center text-base font-semibold text-brand-black hover:text-brand py-3 px-4 rounded-lg hover:bg-brand-light/10 transition-all duration-300 border border-transparent hover:border-brand-light/20">
                Services
              </a>
              <a href="/shop" onClick={() => setIsMenuOpen(false)} className="flex items-center text-base font-semibold text-brand-black hover:text-brand py-3 px-4 rounded-lg hover:bg-brand-light/10 transition-all duration-300 border border-transparent hover:border-brand-light/20">
                Shop
              </a>
              <a href="/blog" onClick={() => setIsMenuOpen(false)} className="flex items-center text-base font-semibold text-brand-black hover:text-brand py-3 px-4 rounded-lg hover:bg-brand-light/10 transition-all duration-300 border border-transparent hover:border-brand-light/20">
                Blogs
              </a>
              <a href="#about" onClick={() => setIsMenuOpen(false)} className="flex items-center text-base font-semibold text-brand-black hover:text-brand py-3 px-4 rounded-lg hover:bg-brand-light/10 transition-all duration-300 border border-transparent hover:border-brand-light/20">
                About
              </a>
              <a href="#contact" onClick={() => setIsMenuOpen(false)} className="flex items-center text-base font-semibold text-brand-black hover:text-brand py-3 px-4 rounded-lg hover:bg-brand-light/10 transition-all duration-300 border border-transparent hover:border-brand-light/20">
                Contact
              </a>
            </div>
            
            {/* Mobile CTA Buttons */}
            <div className="grid grid-cols-1 gap-3">
              <Button 
                onClick={() => {
                  onRefillClick();
                  setIsMenuOpen(false);
                }}
                className="bg-gradient-to-r from-brand-light to-brand-accent text-white font-bold px-5 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 border border-brand-light/20 hover:border-brand-accent/30 group text-sm"
              >
                <Pill className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
                Refill Prescription
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
              </Button>
              
              <Button 
                onClick={() => {
                  onTransferClick();
                  setIsMenuOpen(false);
                }}
                className="bg-gradient-to-r from-brand to-brand-dark text-white font-bold px-5 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 border border-brand/20 hover:border-brand-dark/30 group text-sm"
              >
                <ArrowRight className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
                Transfer Prescription
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
              </Button>
              
              <Button 
                onClick={() => {
                  window.location.href = '/shop';
                  setIsMenuOpen(false);
                }}
                className="bg-gradient-to-r from-brand-accent to-brand text-white font-bold px-5 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 border border-brand-accent/20 hover:border-brand/30 group text-sm"
              >
                <ShoppingCart className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
                Shop Products
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
              </Button>
              
              <Button 
                onClick={() => {
                  handleCallClick();
                  setIsMenuOpen(false);
                }}
                variant="outline"
                className="bg-white text-brand font-semibold px-5 py-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105 border border-brand/30 hover:bg-brand hover:text-white group text-sm"
              >
                <Phone className="w-4 h-4 mr-2 group-hover:animate-pulse" />
                Call Now
              </Button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};
