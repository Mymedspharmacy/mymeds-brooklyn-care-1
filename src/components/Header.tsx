import { useState } from "react";
import { Menu, X, Phone, Clock, MapPin, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onRefillClick: () => void;
  onAppointmentClick: () => void;
  onTransferClick: () => void;
}

export const Header = ({ onRefillClick, onAppointmentClick, onTransferClick }: HeaderProps) => {
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
      <div className="bg-pharmacy-blue-dark text-primary-foreground py-2 px-4">
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
      <header className="bg-background shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center">
              <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl mr-3">
                MM
              </div>
              <div>
                <h1 className="text-2xl font-bold text-pharmacy-blue-dark">My Meds Pharmacy</h1>
                <p className="text-sm text-pharmacy-gray">Your Health, Our Priority</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-6">
              <button onClick={() => scrollToSection('home')} className="text-muted-foreground hover:text-primary transition-colors">
                Home
              </button>
              <button onClick={() => scrollToSection('about')} className="text-muted-foreground hover:text-primary transition-colors">
                About Us
              </button>
              
              {/* Services Dropdown */}
              <div className="relative group">
                <button 
                  className="flex items-center text-muted-foreground hover:text-primary transition-colors"
                  onMouseEnter={() => setIsServicesOpen(true)}
                  onMouseLeave={() => setIsServicesOpen(false)}
                >
                  Services <ChevronDown className="ml-1 h-4 w-4" />
                </button>
                <div 
                  className={`absolute top-full left-0 bg-background shadow-lg rounded-md py-2 w-64 transition-all duration-200 z-50 ${
                    isServicesOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
                  }`}
                  onMouseEnter={() => setIsServicesOpen(true)}
                  onMouseLeave={() => setIsServicesOpen(false)}
                >
                  <button onClick={() => scrollToSection('services')} className="block px-4 py-2 text-muted-foreground hover:bg-secondary hover:text-primary w-full text-left">
                    Free Prescription Delivery
                  </button>
                  <button onClick={() => scrollToSection('services')} className="block px-4 py-2 text-muted-foreground hover:bg-secondary hover:text-primary w-full text-left">
                    Medication Synchronization
                  </button>
                  <button onClick={() => scrollToSection('services')} className="block px-4 py-2 text-muted-foreground hover:bg-secondary hover:text-primary w-full text-left">
                    Immunizations
                  </button>
                  <button onClick={() => scrollToSection('services')} className="block px-4 py-2 text-muted-foreground hover:bg-secondary hover:text-primary w-full text-left">
                    Medication Therapy Management
                  </button>
                  <button onClick={() => scrollToSection('services')} className="block px-4 py-2 text-muted-foreground hover:bg-secondary hover:text-primary w-full text-left">
                    Durable Medical Equipment
                  </button>
                  <button onClick={() => scrollToSection('services')} className="block px-4 py-2 text-muted-foreground hover:bg-secondary hover:text-primary w-full text-left">
                    Private Consultation
                  </button>
                  <button onClick={onAppointmentClick} className="block px-4 py-2 text-muted-foreground hover:bg-secondary hover:text-primary w-full text-left">
                    Book Appointment
                  </button>
                </div>
              </div>

              {/* Prescription Services Dropdown */}
              <div className="relative group">
                <button 
                  className="flex items-center text-muted-foreground hover:text-primary transition-colors"
                  onMouseEnter={() => setIsPrescriptionOpen(true)}
                  onMouseLeave={() => setIsPrescriptionOpen(false)}
                >
                  Prescriptions <ChevronDown className="ml-1 h-4 w-4" />
                </button>
                <div 
                  className={`absolute top-full left-0 bg-background shadow-lg rounded-md py-2 w-56 transition-all duration-200 z-50 ${
                    isPrescriptionOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
                  }`}
                  onMouseEnter={() => setIsPrescriptionOpen(true)}
                  onMouseLeave={() => setIsPrescriptionOpen(false)}
                >
                  <button onClick={onRefillClick} className="block px-4 py-2 text-muted-foreground hover:bg-secondary hover:text-primary w-full text-left">
                    Refill Prescription
                  </button>
                  <button onClick={onTransferClick} className="block px-4 py-2 text-muted-foreground hover:bg-secondary hover:text-primary w-full text-left">
                    Transfer Prescription
                  </button>
                  <button onClick={() => scrollToSection('otc')} className="block px-4 py-2 text-muted-foreground hover:bg-secondary hover:text-primary w-full text-left">
                    Over-the-Counter
                  </button>
                </div>
              </div>

              <button onClick={() => scrollToSection('contact')} className="text-muted-foreground hover:text-primary transition-colors">
                Contact Us
              </button>
              
              <Button onClick={onRefillClick}>
                Refill Now
              </Button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

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
        </div>
      </header>
    </>
  );
};