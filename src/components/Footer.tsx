import { MapPin, Phone, Mail, Clock } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-pharmacy-blue-dark text-primary-foreground py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center font-bold mr-3">
                MM
              </div>
              <div>
                <h3 className="text-xl font-bold">My Meds Pharmacy</h3>
                <p className="text-sm text-primary-foreground/70">Your Health, Our Priority</p>
              </div>
            </div>
            <p className="text-primary-foreground/70 leading-relaxed">
              Providing exceptional pharmaceutical care and personalized service to the Brooklyn community.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="#home" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Home</a></li>
              <li><a href="#about" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">About Us</a></li>
              <li><a href="#services" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Services</a></li>
              <li><a href="#contact" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Contact Us</a></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Our Services</h4>
            <ul className="space-y-2 text-primary-foreground/70">
              <li>Free Prescription Delivery</li>
              <li>Medication Synchronization</li>
              <li>Immunizations</li>
              <li>Private Consultations</li>
              <li>Medical Equipment</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                <p className="text-primary-foreground/70">2242 65th St., Brooklyn, NY 11204</p>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-primary" />
                <p className="text-primary-foreground/70">(347) 312-6458</p>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-primary" />
                <p className="text-primary-foreground/70">Mymedspharmacy@outlook.com</p>
              </div>
              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-primary mt-0.5" />
                <div className="text-primary-foreground/70 text-sm">
                  <p><strong>Pharmacy:</strong> Mon-Fri 10AM-6PM</p>
                  <p><strong>Store:</strong> Mon-Fri 9AM-7PM</p>
                  <p>Saturday: 10AM-4PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-12 pt-8 text-center">
          <p className="text-primary-foreground/70">
            © 2024 My Meds Pharmacy. All rights reserved. | Licensed Pharmacy serving Brooklyn, NY
          </p>
        </div>
      </div>
    </footer>
  );
};