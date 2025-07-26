import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="relative bg-[#376f6b] text-white py-20 border-t-4 border-[#57bbb6] shadow-2xl">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {/* Company Info */}
          <div className="space-y-6">
            <div className="flex items-center">
              {/* 🔗 Clickable Logo */}
              <a href="/admin"> {/* ← added link */}
                <img src="/logo.png" alt="My Meds Pharmacy Logo" className="w-40 h-40 object-contain mr-4 cursor-pointer" />
              </a> {/* ← added link */}
              <div className="flex flex-col">
                <span className="text-3xl font-bold text-white leading-none">My Meds</span>
                <span className="text-xl font-semibold text-white">Pharmacy</span>
              </div>
            </div>
            <p className="text-white leading-relaxed text-base font-medium">
              Providing exceptional pharmaceutical care and personalized service to the Brooklyn community.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xl font-bold mb-6 text-white">Quick Links</h4>
            <ul className="space-y-3">
              <li><a href="#home" className="text-white hover:text-[#57bbb6] font-semibold text-lg transition-colors">Home</a></li>
              <li><a href="#about" className="text-white hover:text-[#57bbb6] font-semibold text-lg transition-colors">About Us</a></li>
              <li><a href="#services" className="text-white hover:text-[#57bbb6] font-semibold text-lg transition-colors">Services</a></li>
              <li><a href="#contact" className="text-white hover:text-[#57bbb6] font-semibold text-lg transition-colors">Contact Us</a></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-xl font-bold mb-6 text-white">Our Services</h4>
            <ul className="space-y-3 text-white text-base font-semibold">
              <li>Free Prescription Delivery</li>
              <li>Medication Synchronization</li>
              <li>Immunizations</li>
              <li>Private Consultations</li>
              <li>Medical Equipment</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-xl font-bold mb-6 text-white">Contact Info</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <MapPin className="h-6 w-6 text-[#57bbb6]" />
                <p className="text-white text-lg font-semibold">2242 65th St., Brooklyn, NY 11204</p>
              </div>
              <div className="flex items-center space-x-4">
                <Phone className="h-6 w-6 text-[#57bbb6]" />
                <p className="text-white text-lg font-semibold">(347) 312-6458</p>
              </div>
              <div className="flex items-center space-x-4">
                <Mail className="h-6 w-6 text-[#57bbb6]" />
                <p className="text-white text-lg font-semibold">Mymedspharmacy@outlook.com</p>
              </div>
              <div className="flex items-start space-x-4">
                <Clock className="h-6 w-6 text-[#57bbb6]" />
                <div className="text-white text-base font-semibold">
                  <p><strong>Pharmacy:</strong> Mon-Fri 10AM-6PM</p>
                  <p><strong>Store:</strong> Mon-Fri 9AM-7PM</p>
                  <p>Saturday: 10AM-4PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[#57bbb6]/30 mt-16 pt-8 text-center">
          <p className="text-white text-lg font-semibold">© 2024 My Meds Pharmacy. All rights reserved. | Licensed Pharmacy serving Brooklyn, NY</p>
        </div>
      </div>
    </footer>
  );
};
