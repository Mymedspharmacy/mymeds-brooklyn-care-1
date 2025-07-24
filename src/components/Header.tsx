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
      {/* Top Bar with Bootstrap Container */}
      <div className="bg-brand-dark text-brand-white py-2 px-4">
        <div className="container-fluid mx-auto">
          <div className="row g-2 align-items-start align-items-lg-center">
            <div className="col-12 col-lg-auto">
              <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-2 gap-sm-3">
                <div className="d-flex align-items-center">
                  <Phone className="h-4 w-4 mr-1 flex-shrink-0" />
                  <span className="text-nowrap small">(347) 312-6458</span>
                </div>
                <div className="d-flex align-items-center">
                  <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                  <span className="small">2242 65th St., Brooklyn, NY 11204</span>
                </div>
              </div>
            </div>
            <div className="col-12 col-lg-auto ms-lg-auto">
              <div className="d-flex align-items-center">
                <Clock className="h-4 w-4 mr-1 flex-shrink-0" />
                <span className="small">
                  <span className="d-none d-sm-inline">Pharmacy: Mon-Fri 10AM-6PM | Store: Mon-Fri 9AM-7PM</span>
                  <span className="d-sm-none">Mon-Fri 10AM-6PM</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header with Bootstrap Grid */}
      <header className="bg-white shadow-lg sticky-top border-bottom border-[#57bbb6]" style={{ borderBottomWidth: '2px' }}>
        <div className="container-fluid">
          <div className="row align-items-center py-2 py-lg-4">
            {/* Logo and Brand Name */}
            <div className="col-auto">
              <div className="d-flex align-items-center gap-2 gap-lg-4 cursor-pointer" onClick={() => navigate('/')}>
                <img 
                  src="/logo.png" 
                  alt="My Meds Pharmacy Logo" 
                  className="img-fluid"
                  style={{ height: '4rem', width: '4rem' }}
                  sizes="(max-width: 640px) 4rem, (max-width: 1024px) 5rem, 8rem"
                />
                <div className="d-flex flex-column">
                  <span className="h5 h4-sm h3-lg fw-bold text-[#376f6b] mb-0 lh-1">
                    <span className="d-none d-sm-inline">My Meds</span>
                    <span className="d-sm-none">My Meds</span>
                  </span>
                  <span className="small h6-sm h5-lg fw-semibold text-[#231f20] mb-0">Pharmacy</span>
                </div>
              </div>
            </div>

            {/* Desktop Navigation - Bootstrap Hidden Classes */}
            <div className="col d-none d-lg-flex justify-content-center">
              <nav className="navbar-nav flex-row gap-4">
                <a href="/" className="nav-link text-[#231f20] fw-semibold text-decoration-none hover:text-[#57bbb6]">Home</a>
                <button onClick={() => scrollToSection('services')} className="nav-link btn btn-link text-[#231f20] fw-semibold text-decoration-none hover:text-[#57bbb6] border-0 p-0">Services</button>
                <a href="/shop" className="nav-link text-[#231f20] fw-semibold text-decoration-none hover:text-[#57bbb6]">Shop</a>
                <a href="/blog" className="nav-link text-[#231f20] fw-semibold text-decoration-none hover:text-[#57bbb6]">Health Blog</a>
                <button onClick={() => scrollToSection('about')} className="nav-link btn btn-link text-[#231f20] fw-semibold text-decoration-none hover:text-[#57bbb6] border-0 p-0">About</button>
                <button onClick={() => scrollToSection('contact')} className="nav-link btn btn-link text-[#231f20] fw-semibold text-decoration-none hover:text-[#57bbb6] border-0 p-0">Contact</button>
              </nav>
            </div>

            {/* Desktop Action Buttons - Bootstrap Hidden Classes */}
            <div className="col-auto d-none d-lg-flex gap-3">
              <button 
                className="btn btn-primary bg-[#376f6b] border-[#376f6b] hover:bg-[#57bbb6] d-flex align-items-center gap-2" 
                onClick={onRefillClick}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 3.487A2.25 2.25 0 0 1 19.5 5.25v13.5A2.25 2.25 0 0 1 17.25 21H6.75A2.25 2.25 0 0 1 4.5 18.75V5.25a2.25 2.25 0 0 1 2.638-2.213l.112.026.112.026 6.75 1.5a2.25 2.25 0 0 1 1.5 2.138v.073a2.25 2.25 0 0 1-1.5 2.138l-6.75 1.5-.112.026-.112.026A2.25 2.25 0 0 1 4.5 10.5v8.25A2.25 2.25 0 0 0 6.75 21h10.5A2.25 2.25 0 0 0 19.5 18.75V5.25a2.25 2.25 0 0 0-2.638-2.213l-.112.026-.112.026-6.75 1.5a2.25 2.25 0 0 0-1.5 2.138v.073a2.25 2.25 0 0 0 1.5 2.138l6.75 1.5.112.026.112.026z" />
                </svg>
                Refill Rx
              </button>
              <button 
                className="btn bg-[#2e8f88] border-[#2e8f88] text-white hover:bg-[#376f6b] d-flex align-items-center gap-2" 
                onClick={onTransferClick}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                </svg>
                Transfer Rx
              </button>
              <button 
                className="btn bg-[#57bbb6] border-[#57bbb6] text-[#231f20] hover:bg-[#376f6b] hover:text-white d-flex align-items-center gap-2" 
                onClick={handleCallClick}
              >
                <Phone className="w-5 h-5" />
                Call Now
              </button>
            </div>

            {/* Mobile Menu Button and Call Button - Bootstrap Responsive */}
            <div className="col-auto d-lg-none ms-auto">
              <div className="d-flex align-items-center gap-2">
                <button 
                  className="btn btn-sm bg-[#57bbb6] text-[#231f20] rounded hover:bg-[#376f6b] hover:text-white d-flex align-items-center justify-content-center"
                  style={{ width: '2.5rem', height: '2.5rem' }}
                  onClick={handleCallClick}
                >
                  <Phone className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="btn btn-sm bg-[#376f6b] text-white rounded hover:bg-[#57bbb6] d-flex align-items-center justify-content-center"
                  style={{ width: '2.5rem', height: '2.5rem' }}
                  data-bs-toggle="collapse"
                  data-bs-target="#mobileNavCollapse"
                  aria-expanded={isMenuOpen}
                  aria-controls="mobileNavCollapse"
                >
                  {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu with Bootstrap Collapse */}
        <div className={`collapse navbar-collapse d-lg-none ${isMenuOpen ? 'show' : ''}`} id="mobileNavCollapse">
          <div className="container-fluid">
            <div className="row py-3 border-top">
              <div className="col-12">
                <nav className="d-flex flex-column gap-3">
                  <a href="/" className="text-[#231f20] fw-semibold text-decoration-none py-2 border-bottom border-light">Home</a>
                  <button onClick={() => scrollToSection('services')} className="btn btn-link text-start text-[#231f20] fw-semibold text-decoration-none py-2 border-bottom border-light p-0">Services</button>
                  <a href="/shop" className="text-[#231f20] fw-semibold text-decoration-none py-2 border-bottom border-light">Shop</a>
                  <a href="/blog" className="text-[#231f20] fw-semibold text-decoration-none py-2 border-bottom border-light">Health Blog</a>
                  <button onClick={() => scrollToSection('about')} className="btn btn-link text-start text-[#231f20] fw-semibold text-decoration-none py-2 border-bottom border-light p-0">About</button>
                  <button onClick={() => scrollToSection('contact')} className="btn btn-link text-start text-[#231f20] fw-semibold text-decoration-none py-2 border-bottom border-light p-0">Contact</button>
                  
                  {/* Mobile Action Buttons with Bootstrap */}
                  <div className="d-flex flex-column gap-2 pt-3">
                    <button 
                      className="btn btn-primary bg-[#376f6b] border-[#376f6b] hover:bg-[#57bbb6] d-flex align-items-center justify-content-center gap-2" 
                      onClick={() => {
                        onRefillClick();
                        setIsMenuOpen(false);
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 3.487A2.25 2.25 0 0 1 19.5 5.25v13.5A2.25 2.25 0 0 1 17.25 21H6.75A2.25 2.25 0 0 1 4.5 18.75V5.25a2.25 2.25 0 0 1 2.638-2.213l.112.026.112.026 6.75 1.5a2.25 2.25 0 0 1 1.5 2.138v.073a2.25 2.25 0 0 1-1.5 2.138l-6.75 1.5-.112.026-.112.026A2.25 2.25 0 0 1 4.5 10.5v8.25A2.25 2.25 0 0 0 6.75 21h10.5A2.25 2.25 0 0 0 19.5 18.75V5.25a2.25 2.25 0 0 0-2.638-2.213l-.112.026-.112.026-6.75 1.5a2.25 2.25 0 0 0-1.5 2.138v.073a2.25 2.25 0 0 0 1.5 2.138l6.75 1.5.112.026.112.026z" />
                      </svg>
                      Refill Prescription
                    </button>
                    <button 
                      className="btn bg-[#2e8f88] border-[#2e8f88] text-white hover:bg-[#376f6b] d-flex align-items-center justify-content-center gap-2" 
                      onClick={() => {
                        onTransferClick();
                        setIsMenuOpen(false);
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                      </svg>
                      Transfer Prescription
                    </button>
                    <button 
                      className="btn bg-[#57bbb6] border-[#57bbb6] text-[#231f20] hover:bg-[#376f6b] hover:text-white d-flex align-items-center justify-content-center gap-2" 
                      onClick={() => {
                        onAppointmentClick();
                        setIsMenuOpen(false);
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5a2.25 2.25 0 0 0 2.25-2.25m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5a2.25 2.25 0 0 0 2.25-2.25V18.75m-18 0h18" />
                      </svg>
                      Book Appointment
                    </button>
                  </div>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};