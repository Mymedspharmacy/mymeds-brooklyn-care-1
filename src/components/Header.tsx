import { useNavigate } from 'react-router-dom';
import { useState } from "react";
import { Menu, X, Phone } from "lucide-react";
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

  return (
    <>
      {/* Top Bar */}
      <div className="bg-[#57bbb6] text-white py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-sm">
          <div className="flex justify-center sm:justify-start">
            <span className="text-base sm:text-lg font-semibold text-center sm:text-left">
              Protect your health, book your consultation now
            </span>
          </div>
          <div className="flex justify-center sm:justify-end">
            <Button
              onClick={onAppointmentClick}
              className="bg-white text-[#376f6b] hover:bg-gray-100 font-semibold px-5 py-2 rounded-lg shadow transition-colors text-sm sm:text-base"
            >
              BOOK NOW
            </Button>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white shadow-lg sticky top-0 z-50 border-b-2 border-[#57bbb6]">
        <div className="container mx-auto px-4 flex items-center justify-between py-4">
          
          {/* Left (Hamburger for mobile) */}
          <div className="flex items-center w-1/3 lg:w-auto">
            <button
              className="lg:hidden flex items-center justify-center p-2 rounded-md text-[#57bbb6] hover:bg-[#f5fefd] focus:outline-none focus:ring-2 focus:ring-[#57bbb6]"
              onClick={() => setIsMenuOpen(v => !v)}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
            </button>
          </div>

          {/* Center (Logo) */}
          <div className="w-1/3 flex justify-center lg:justify-start cursor-pointer" onClick={() => navigate('/')}>
            <img
              src="/logo.png"
              alt="My Meds Pharmacy Logo"
              className="h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28 object-contain transition-all"
            />
          </div>

          {/* Right Spacer for mobile */}
          <div className="w-1/3 lg:w-auto" />

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex flex-1 justify-center">
            <ul className="flex gap-4 xl:gap-8 items-center">
              <li><a href="/" className="text-[#231f20] font-semibold hover:text-[#57bbb6] transition-colors">Home</a></li>
              <li><a href="#services" className="text-[#231f20] font-semibold hover:text-[#57bbb6] transition-colors">Services</a></li>
              <li><a href="/shop" className="text-[#231f20] font-semibold hover:text-[#57bbb6] transition-colors">Shop</a></li>
              <li><a href="/blog" className="text-[#231f20] font-semibold hover:text-[#57bbb6] transition-colors">Health Blog</a></li>
              <li><a href="#about" className="text-[#231f20] font-semibold hover:text-[#57bbb6] transition-colors">About</a></li>
              <li><a href="#contact" className="text-[#231f20] font-semibold hover:text-[#57bbb6] transition-colors">Contact</a></li>
            </ul>
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden sm:flex gap-2 md:gap-3">
            <button className="flex items-center gap-2 bg-[#376f6b] text-white font-semibold px-5 py-2 rounded-lg shadow hover:bg-[#5EABD6] transition-colors text-base border-2 border-[#376f6b]" onClick={onRefillClick}>
              Refill Rx
            </button>
            <button className="flex items-center gap-2 bg-[#376f6b] text-white font-semibold px-5 py-2 rounded-lg shadow hover:bg-[#5EABD6] transition-colors text-base border-2 border-[#376f6b]" onClick={onTransferClick}>
              Transfer Rx
            </button>
            <button className="flex items-center gap-2 bg-[#376f6b] text-white font-semibold px-5 py-2 rounded-lg shadow hover:bg-[#5EABD6] transition-colors text-base border-2 border-[#376f6b]" onClick={() => {
              const phoneNumber = '3473126458';
              const telLink = `tel:${phoneNumber}`;
              if (navigator.userAgent.match(/iPhone|iPad|iPod|Android/i)) {
                window.location.href = telLink;
              } else {
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

        {/* Mobile Overlay */}
        <div
          className={`lg:hidden fixed inset-0 z-40 bg-black bg-opacity-40 transition-opacity duration-300 ${isMenuOpen ? 'block' : 'hidden'}`}
          onClick={() => setIsMenuOpen(false)}
        />

        {/* Mobile Drawer Navigation */}
        <nav className={`lg:hidden fixed top-0 right-0 h-full w-4/5 max-w-xs bg-white shadow-2xl z-50 transform transition-transform duration-300 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'} overflow-y-auto`}>
          <div className="flex flex-col p-6 gap-4 h-full">
            <button onClick={() => setIsMenuOpen(false)} className="self-end mb-2 text-[#376f6b] hover:text-[#5EABD6]">
              <X className="h-7 w-7" />
            </button>
            <a href="/" onClick={() => setIsMenuOpen(false)} className="text-lg font-semibold text-[#231f20] hover:text-[#376f6b] py-2">Home</a>
            <a href="#services" onClick={() => setIsMenuOpen(false)} className="text-lg font-semibold text-[#231f20] hover:text-[#376f6b] py-2">Services</a>
            <a href="/shop" onClick={() => setIsMenuOpen(false)} className="text-lg font-semibold text-[#231f20] hover:text-[#376f6b] py-2">Shop</a>
            <a href="/blog" onClick={() => setIsMenuOpen(false)} className="text-lg font-semibold text-[#231f20] hover:text-[#376f6b] py-2">Health Blog</a>
            <a href="#about" onClick={() => setIsMenuOpen(false)} className="text-lg font-semibold text-[#231f20] hover:text-[#376f6b] py-2">About</a>
            <a href="#contact" onClick={() => setIsMenuOpen(false)} className="text-lg font-semibold text-[#231f20] hover:text-[#376f6b] py-2">Contact</a>
            <div className="flex flex-col gap-2 mt-4">
              <button className="bg-[#376f6b] text-white font-semibold px-5 py-2 rounded-lg shadow hover:bg-[#5EABD6] transition-colors border-2 border-[#376f6b]" onClick={onRefillClick}>
                Refill Rx
              </button>
              <button className="bg-[#376f6b] text-white font-semibold px-5 py-2 rounded-lg shadow hover:bg-[#5EABD6] transition-colors border-2 border-[#376f6b]" onClick={onTransferClick}>
                Transfer Rx
              </button>
              <button className="bg-[#376f6b] text-white font-semibold px-5 py-2 rounded-lg shadow hover:bg-[#5EABD6] transition-colors border-2 border-[#376f6b]" onClick={() => {
                const phoneNumber = '3473126458';
                const telLink = `tel:${phoneNumber}`;
                if (navigator.userAgent.match(/iPhone|iPad|iPod|Android/i)) {
                  window.location.href = telLink;
                } else {
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
        </nav>
      </header>
    </>
  );
};
