import { useNavigate } from 'react-router-dom';
import { useState } from "react";
import { Menu, X, Phone, Clock, MapPin, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onRefillClick: () => void;
  onAppointmentClick: () => void;
  onTransferClick: () => void;
}

export const Header = ({ onRefillClick, onAppointmentClick, onTransferClick }: HeaderProps) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
      {/* Top Bar */}
      <div className="bg-brand-dark text-brand-white py-2 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center text-sm space-y-2 lg:space-y-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full lg:w-auto">
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-1 flex-shrink-0" />
                <span className="whitespace-nowrap">(347) 312-6458</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                <span className="text-xs sm:text-sm">2242 65th St., Brooklyn, NY 11204</span>
              </div>
            </div>
            <div className="flex items-center w-full lg:w-auto">
              <Clock className="h-4 w-4 mr-1 flex-shrink-0" />
              <span className="text-xs sm:text-sm">
                <span className="hidden sm:inline">Pharmacy: Mon-Fri 10AM-6PM | Store: Mon-Fri 9AM-7PM</span>
                <span className="sm:hidden">Mon-Fri 10AM-6PM</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white shadow-lg sticky top-0 z-50 border-b-2 border-brand">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-2 lg:py-4">
            {/* Logo and Brand Name */}
            <div className="flex items-center gap-2 lg:gap-4 cursor-pointer" onClick={() => navigate('/')}>
              <img 
                src="/logo.png" 
                alt="My Meds Pharmacy Logo" 
                className="h-16 w-16 sm:h-20 sm:w-20 lg:h-32 lg:w-32 object-contain" 
              />
              <div className="flex flex-col">
                <span className="text-lg sm:text-2xl lg:text-3xl font-bold text-brand-dark leading-none">My Meds</span>
                <span className="text-sm sm:text-lg lg:text-xl font-semibold text-brand-black">Pharmacy</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex flex-1 justify-center">
              <ul className="flex gap-8 items-center">
                <li><a href="/" className="text-brand-black font-semibold hover:text-brand transition-colors">Home</a></li>
                <li><button onClick={() => scrollToSection('services')} className="text-brand-black font-semibold hover:text-brand transition-colors">Services</button></li>
                <li><a href="/shop" className="text-brand-black font-semibold hover:text-brand transition-colors">Shop</a></li>
                <li><a href="/blog" className="text-brand-black font-semibold hover:text-brand transition-colors">Health Blog</a></li>
                <li><button onClick={() => scrollToSection('about')} className="text-brand-black font-semibold hover:text-brand transition-colors">About</button></li>
                <li><button onClick={() => scrollToSection('contact')} className="text-brand-black font-semibold hover:text-brand transition-colors">Contact</button></li>
              </ul>
            </nav>

            {/* Desktop Action Buttons */}
            <div className="hidden lg:flex gap-3">
              <Button 
                onClick={onRefillClick}
                size="lg"
                className="text-base"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 3.487A2.25 2.25 0 0 1 19.5 5.25v13.5A2.25 2.25 0 0 1 17.25 21H6.75A2.25 2.25 0 0 1 4.5 18.75V5.25a2.25 2.25 0 0 1 2.638-2.213l.112.026.112.026 6.75 1.5a2.25 2.25 0 0 1 1.5 2.138v.073a2.25 2.25 0 0 1-1.5 2.138l-6.75 1.5-.112.026-.112.026A2.25 2.25 0 0 1 4.5 10.5v8.25A2.25 2.25 0 0 0 6.75 21h10.5A2.25 2.25 0 0 0 19.5 18.75V5.25a2.25 2.25 0 0 0-2.638-2.213l-.112.026-.112.026-6.75 1.5a2.25 2.25 0 0 0-1.5 2.138v.073a2.25 2.25 0 0 0 1.5 2.138l6.75 1.5.112.026.112.026z" />
                </svg>
                Refill Rx
              </Button>
              <Button 
                onClick={onTransferClick}
                variant="secondary"
                size="lg"
                className="text-base"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                </svg>
                Transfer Rx
              </Button>
              <Button 
                onClick={handleCallClick}
                variant="outline"
                size="lg"
                className="text-base"
              >
                <Phone className="w-5 h-5" />
                Call Now
              </Button>
            </div>

            {/* Mobile Menu Button and Call Button */}
            <div className="flex lg:hidden items-center gap-2">
              <Button 
                onClick={handleCallClick}
                variant="outline"
                size="icon"
                className="w-10 h-10"
              >
                <Phone className="w-5 h-5" />
              </Button>
              <Button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                size="icon"
                className="w-10 h-10"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-200 shadow-lg">
            <div className="container mx-auto px-4 py-4">
              <nav className="flex flex-col space-y-4">
                <a href="/" className="text-brand-black font-semibold hover:text-brand py-2 border-b border-gray-100 transition-colors">Home</a>
                <button onClick={() => scrollToSection('services')} className="text-left text-brand-black font-semibold hover:text-brand py-2 border-b border-gray-100 transition-colors">Services</button>
                <a href="/shop" className="text-brand-black font-semibold hover:text-brand py-2 border-b border-gray-100 transition-colors">Shop</a>
                <a href="/blog" className="text-brand-black font-semibold hover:text-brand py-2 border-b border-gray-100 transition-colors">Health Blog</a>
                <button onClick={() => scrollToSection('about')} className="text-left text-brand-black font-semibold hover:text-brand py-2 border-b border-gray-100 transition-colors">About</button>
                <button onClick={() => scrollToSection('contact')} className="text-left text-brand-black font-semibold hover:text-brand py-2 border-b border-gray-100 transition-colors">Contact</button>
                
                {/* Mobile Action Buttons */}
                <div className="flex flex-col space-y-3 pt-4">
                  <Button 
                    onClick={() => {
                      onRefillClick();
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-base"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 3.487A2.25 2.25 0 0 1 19.5 5.25v13.5A2.25 2.25 0 0 1 17.25 21H6.75A2.25 2.25 0 0 1 4.5 18.75V5.25a2.25 2.25 0 0 1 2.638-2.213l.112.026.112.026 6.75 1.5a2.25 2.25 0 0 1 1.5 2.138v.073a2.25 2.25 0 0 1-1.5 2.138l-6.75 1.5-.112.026-.112.026A2.25 2.25 0 0 1 4.5 10.5v8.25A2.25 2.25 0 0 0 6.75 21h10.5A2.25 2.25 0 0 0 19.5 18.75V5.25a2.25 2.25 0 0 0-2.638-2.213l-.112.026-.112.026-6.75 1.5a2.25 2.25 0 0 0-1.5 2.138v.073a2.25 2.25 0 0 0 1.5 2.138l6.75 1.5.112.026.112.026z" />
                    </svg>
                    Refill Prescription
                  </Button>
                  <Button 
                    onClick={() => {
                      onTransferClick();
                      setIsMenuOpen(false);
                    }}
                    variant="secondary"
                    className="w-full text-base"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                    </svg>
                    Transfer Prescription
                  </Button>
                  <Button 
                    onClick={() => {
                      onAppointmentClick();
                      setIsMenuOpen(false);
                    }}
                    variant="outline"
                    className="w-full text-base"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5a2.25 2.25 0 0 0 2.25-2.25m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5a2.25 2.25 0 0 0 2.25-2.25V18.75m-18 0h18" />
                    </svg>
                    Book Appointment
                  </Button>
                </div>
              </nav>
            </div>
          </div>
        )}
      </header>
    </>
  );
};