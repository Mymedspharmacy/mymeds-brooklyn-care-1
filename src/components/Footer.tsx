import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="relative bg-[#376f6b] text-white py-12 sm:py-16 lg:py-20 border-t-4 border-[#57bbb6] shadow-2xl">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Company Info */}
          <div className="space-y-4 lg:space-y-6 text-center sm:text-left lg:col-span-1">
            <div className="flex items-center justify-center sm:justify-start">
              <img src="/logo.png" alt="My Meds Pharmacy Logo" className="w-20 h-20 sm:w-24 sm:h-24 lg:w-40 lg:h-40 object-contain mr-2 lg:mr-4" />
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-white leading-none">My Meds</span>
                <span className="text-sm sm:text-lg lg:text-xl font-semibold text-white">Pharmacy</span>
              </div>
            </div>
            <p className="text-white leading-relaxed text-sm sm:text-base lg:text-base font-medium">
              Providing exceptional pharmaceutical care and personalized service to the Brooklyn community.
            </p>
          </div>

          {/* Quick Links */}
          <div className="text-center sm:text-left">
            <h4 className="text-lg sm:text-xl font-bold mb-4 lg:mb-6 text-white">Quick Links</h4>
            <ul className="space-y-2 lg:space-y-3">
              <li><a href="#home" className="text-white hover:text-[#57bbb6] font-semibold text-sm sm:text-base lg:text-lg transition-colors">Home</a></li>
              <li><a href="#about" className="text-white hover:text-[#57bbb6] font-semibold text-sm sm:text-base lg:text-lg transition-colors">About Us</a></li>
              <li><a href="#services" className="text-white hover:text-[#57bbb6] font-semibold text-sm sm:text-base lg:text-lg transition-colors">Services</a></li>
              <li><a href="#contact" className="text-white hover:text-[#57bbb6] font-semibold text-sm sm:text-base lg:text-lg transition-colors">Contact Us</a></li>
            </ul>
          </div>

          {/* Services */}
          <div className="text-center sm:text-left">
            <h4 className="text-lg sm:text-xl font-bold mb-4 lg:mb-6 text-white">Our Services</h4>
            <ul className="space-y-2 lg:space-y-3 text-white text-sm sm:text-base font-semibold">
              <li>Free Prescription Delivery</li>
              <li>Medication Synchronization</li>
              <li>Immunizations</li>
              <li>Private Consultations</li>
              <li>Medical Equipment</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="text-center sm:text-left">
            <h4 className="text-lg sm:text-xl font-bold mb-4 lg:mb-6 text-white">Contact Info</h4>
            <div className="space-y-3 lg:space-y-4">
              <div className="flex items-start space-x-3 lg:space-x-4 justify-center sm:justify-start">
                <MapPin className="h-5 w-5 lg:h-6 lg:w-6 text-[#57bbb6] mt-0.5 flex-shrink-0" />
                <p className="text-white text-sm sm:text-base lg:text-lg font-semibold">2242 65th St., Brooklyn, NY 11204</p>
              </div>
              <div className="flex items-center space-x-3 lg:space-x-4 justify-center sm:justify-start">
                <Phone className="h-5 w-5 lg:h-6 lg:w-6 text-[#57bbb6] flex-shrink-0" />
                <p className="text-white text-sm sm:text-base lg:text-lg font-semibold">(347) 312-6458</p>
              </div>
              <div className="flex items-center space-x-3 lg:space-x-4 justify-center sm:justify-start">
                <Mail className="h-5 w-5 lg:h-6 lg:w-6 text-[#57bbb6] flex-shrink-0" />
                <p className="text-white text-sm sm:text-base lg:text-lg font-semibold break-all">Mymedspharmacy@outlook.com</p>
              </div>
              <div className="flex items-start space-x-3 lg:space-x-4 justify-center sm:justify-start">
                <Clock className="h-5 w-5 lg:h-6 lg:w-6 text-[#57bbb6] mt-0.5 flex-shrink-0" />
                <div className="text-white text-xs sm:text-sm lg:text-base font-semibold">
                  <p><strong>Pharmacy:</strong> Mon-Fri 10AM-6PM</p>
                  <p><strong>Store:</strong> Mon-Fri 9AM-7PM</p>
                  <p>Saturday: 10AM-4PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-[#57bbb6]/30 mt-12 lg:mt-16 pt-6 lg:pt-8 text-center">
          <p className="text-white text-sm sm:text-base lg:text-lg font-semibold">
            © 2024 My Meds Pharmacy. All rights reserved. | Licensed Pharmacy serving Brooklyn, NY
          </p>
        </div>
        
        {/* Admin Portal button - responsive positioning */}
        <button
          onClick={() => window.location.href='/admin'}
          className="fixed right-4 bottom-4 sm:right-6 sm:bottom-6 z-50 bg-[#57bbb6] text-[#231f20] font-bold py-2 px-3 sm:py-2 sm:px-4 rounded-full shadow hover:bg-white hover:text-[#376f6b] border-2 border-[#231f20] text-xs sm:text-sm transition-colors"
        >
          <span className="hidden sm:inline">Admin Portal</span>
          <span className="sm:hidden">Admin</span>
        </button>
      </div>
    </footer>
  );
};