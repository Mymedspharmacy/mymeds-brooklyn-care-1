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
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isPrescriptionOpen, setIsPrescriptionOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Top Bar */}
      <div className="bg-brand-dark text-brand-white py-2 px-4">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center text-sm">
          <div className="flex items-center space-x-4 mb-2 md:mb-0">
            <div className="flex items-center">
              <Phone className="h-4 w-4 mr-1" />
              <span>(347) 312-6458</span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              <span>2242 65th St., Brooklyn, NY 11204</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>Pharmacy: Mon-Fri 10AM-6PM | Store: Mon-Fri 9AM-7PM</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white shadow-lg sticky top-0 z-50 border-b-2 border-[#57bbb6]">
        <div className="container mx-auto px-4 flex items-center justify-between py-4">
          {/* Logo and Brand Name */}
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate('/') }>
            <img src="/logo.png" alt="My Meds Pharmacy Logo" className="h-32 w-32 object-contain" />
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-[#376f6b] leading-none">My Meds</span>
              <span className="text-xl font-semibold text-[#231f20]">Pharmacy</span>
            </div>
          </div>
          {/* Navigation */}
          <nav className="flex-1 flex justify-center">
            <ul className="flex gap-8 items-center">
              <li><a href="/" className="text-[#231f20] font-semibold hover:text-[#57bbb6] transition-colors">Home</a></li>
              <li><a href="#services" className="text-[#231f20] font-semibold hover:text-[#57bbb6] transition-colors">Services</a></li>
              <li><a href="/shop" className="text-[#231f20] font-semibold hover:text-[#57bbb6] transition-colors">Shop</a></li>
              <li><a href="/blog" className="text-[#231f20] font-semibold hover:text-[#57bbb6] transition-colors">Health Blog</a></li>
              <li><a href="#about" className="text-[#231f20] font-semibold hover:text-[#57bbb6] transition-colors">About</a></li>
              <li><a href="#contact" className="text-[#231f20] font-semibold hover:text-[#57bbb6] transition-colors">Contact</a></li>
            </ul>
          </nav>
          {/* Action Buttons */}
          <div className="flex gap-3">
            <button className="flex items-center gap-2 bg-[#376f6b] text-white font-semibold px-5 py-2 rounded-lg shadow hover:bg-[#57bbb6] transition-colors text-base border-2 border-[#376f6b]" onClick={onRefillClick}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 3.487A2.25 2.25 0 0 1 19.5 5.25v13.5A2.25 2.25 0 0 1 17.25 21H6.75A2.25 2.25 0 0 1 4.5 18.75V5.25a2.25 2.25 0 0 1 2.638-2.213l.112.026.112.026 6.75 1.5a2.25 2.25 0 0 1 1.5 2.138v.073a2.25 2.25 0 0 1-1.5 2.138l-6.75 1.5-.112.026-.112.026A2.25 2.25 0 0 1 4.5 10.5v8.25A2.25 2.25 0 0 0 6.75 21h10.5A2.25 2.25 0 0 0 19.5 18.75V5.25a2.25 2.25 0 0 0-2.638-2.213l-.112.026-.112.026-6.75 1.5a2.25 2.25 0 0 0-1.5 2.138v.073a2.25 2.25 0 0 0 1.5 2.138l6.75 1.5.112.026.112.026z" />
              </svg>
              Refill Rx
            </button>
            <button className="flex items-center gap-2 bg-[#2e8f88] text-white font-semibold px-5 py-2 rounded-lg shadow hover:bg-[#376f6b] transition-colors text-base border-2 border-[#2e8f88]" onClick={onTransferClick}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
              </svg>
              Transfer Rx
            </button>
            <button className="flex items-center gap-2 bg-[#57bbb6] text-[#231f20] font-semibold px-5 py-2 rounded-lg shadow hover:bg-[#376f6b] hover:text-white transition-colors text-base border-2 border-[#57bbb6]" onClick={() => {
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
            }}>
              <Phone className="w-5 h-5" />
              Call Now
            </button>
          </div>
        </div>
      </header>



      {/* Mobile Navigation */}
      {isMenuOpen && (
        <nav className="lg:hidden pb-4">
          <div className="flex flex-col space-y-4">
            <button onClick={() => scrollToSection('home')} className="text-left text-muted-foreground hover:text-primary">
              Home
            </button>
            <button onClick={() => scrollToSection('about')} className="text-left text-muted-foreground hover:text-primary">
              About Us
            </button>
            <button onClick={() => scrollToSection('services')} className="text-left text-muted-foreground hover:text-primary">
              Services
            </button>
            <button onClick={onAppointmentClick} className="text-left text-muted-foreground hover:text-primary">
              Book Appointment
            </button>
            <button onClick={onRefillClick} className="text-left text-muted-foreground hover:text-primary">
              Refill Prescription
            </button>
            <button onClick={onTransferClick} className="text-left text-muted-foreground hover:text-primary">
              Transfer Prescription
            </button>
            <button onClick={() => scrollToSection('otc')} className="text-left text-muted-foreground hover:text-primary">
              Over-the-Counter
            </button>
            <button onClick={() => scrollToSection('contact')} className="text-left text-muted-foreground hover:text-primary">
              Contact Us
            </button>
          </div>
        </nav>
      )}
    </>
  );
};