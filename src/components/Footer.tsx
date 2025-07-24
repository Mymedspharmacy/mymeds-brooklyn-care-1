import { Phone, MapPin, Clock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Footer = () => {
  return (
    <>
      <footer className="relative bg-brand-dark text-brand-white py-12 sm:py-16 lg:py-20 border-t-4 border-brand shadow-2xl">
        <div className="container mx-auto px-4">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-8 lg:mb-12">
            {/* Company Info */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 lg:gap-4 mb-4 lg:mb-6">
                <img 
                  src="/logo.png" 
                  alt="My Meds Pharmacy Logo" 
                  className="h-12 w-12 sm:h-16 sm:w-16 object-contain" 
                />
                <div>
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold">My Meds</h3>
                  <p className="text-sm sm:text-base text-brand-light">Pharmacy</p>
                </div>
              </div>
              <p className="text-sm sm:text-base text-brand-light leading-relaxed">
                Your trusted neighborhood pharmacy providing exceptional pharmaceutical care and personalized service to the Brooklyn community.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-base sm:text-lg font-bold mb-3 lg:mb-4">Quick Links</h4>
              <ul className="space-y-2 lg:space-y-3">
                <li><a href="/" className="text-sm sm:text-base text-brand-light hover:text-brand-white transition-colors">Home</a></li>
                <li><a href="/shop" className="text-sm sm:text-base text-brand-light hover:text-brand-white transition-colors">Shop</a></li>
                <li><a href="/blog" className="text-sm sm:text-base text-brand-light hover:text-brand-white transition-colors">Health Blog</a></li>
                <li><a href="#services" className="text-sm sm:text-base text-brand-light hover:text-brand-white transition-colors">Services</a></li>
                <li><a href="#about" className="text-sm sm:text-base text-brand-light hover:text-brand-white transition-colors">About Us</a></li>
                <li><a href="#contact" className="text-sm sm:text-base text-brand-light hover:text-brand-white transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-base sm:text-lg font-bold mb-3 lg:mb-4">Our Services</h4>
              <ul className="space-y-2 lg:space-y-3">
                <li><span className="text-sm sm:text-base text-brand-light">Prescription Filling</span></li>
                <li><span className="text-sm sm:text-base text-brand-light">Free Delivery</span></li>
                <li><span className="text-sm sm:text-base text-brand-light">Immunizations</span></li>
                <li><span className="text-sm sm:text-base text-brand-light">Health Consultations</span></li>
                <li><span className="text-sm sm:text-base text-brand-light">Medical Equipment</span></li>
                <li><span className="text-sm sm:text-base text-brand-light">Insurance Processing</span></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-base sm:text-lg font-bold mb-3 lg:mb-4">Contact Info</h4>
              <div className="space-y-3 lg:space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 lg:h-5 lg:w-5 text-brand mt-1 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-brand-light">2242 65th St., Brooklyn, NY 11204</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 lg:h-5 lg:w-5 text-brand flex-shrink-0" />
                  <span className="text-sm sm:text-base text-brand-light">(347) 312-6458</span>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-4 w-4 lg:h-5 lg:w-5 text-brand mt-1 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-brand-light">Mymedspharmacy@outlook.com</span>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-4 w-4 lg:h-5 lg:w-5 text-brand mt-1 flex-shrink-0" />
                  <div className="text-sm sm:text-base text-brand-light">
                    <p><strong>Pharmacy:</strong> Mon-Fri 10AM-6PM</p>
                    <p><strong>Store:</strong> Mon-Fri 9AM-7PM, Sat 10AM-4PM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-brand-light/30 pt-6 lg:pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-xs sm:text-sm text-brand-light text-center md:text-left">
                © 2024 My Meds Pharmacy. All rights reserved. | Licensed Pharmacy in Brooklyn, NY
              </p>
              <div className="flex gap-4 text-xs sm:text-sm">
                <a href="#" className="text-brand-light hover:text-brand-white transition-colors">Privacy Policy</a>
                <a href="#" className="text-brand-light hover:text-brand-white transition-colors">Terms of Service</a>
                <a href="#" className="text-brand-light hover:text-brand-white transition-colors">Accessibility</a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Back to Top Button */}
      <Button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        variant="secondary"
        size="sm"
        className="fixed right-4 bottom-4 sm:right-6 sm:bottom-6 z-50 shadow-lg"
      >
        ↑ Top
      </Button>
    </>
  );
};