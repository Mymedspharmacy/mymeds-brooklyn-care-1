import { MapPin, Phone, Mail, Clock, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MapProps {
  showDetails?: boolean;
  className?: string;
}

export const Map = ({ showDetails = true, className = "" }: MapProps) => {
  const pharmacyAddress = "My Meds Pharmacy Inc, 2242 65th St, Brooklyn, NY 11204, United States";
  const pharmacyPhone = "347-312-6458";
  const pharmacyEmail = "mymedspharmacy@outlook.com";
  const pharmacyHours = "Mon-Fri: 9AM-7PM, Sat: 9AM-5PM, Sun: 10AM-4PM";

  const handleDirections = () => {
    // Use the exact Google Maps location provided
    window.open('https://maps.app.goo.gl/tHL4EmozjnnwQqF3A', '_blank');
  };

  const handleCall = () => {
    const telLink = `tel:${pharmacyPhone}`;
    if (navigator.userAgent.match(/iPhone|iPad|iPod|Android/i)) {
      window.location.href = telLink;
    } else {
      if (confirm(`Call ${pharmacyPhone}?`)) {
        window.open(telLink);
      }
    }
  };

  const handleEmail = () => {
    const mailtoLink = `mailto:${pharmacyEmail}`;
    window.open(mailtoLink);
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Map Container */}
      <div className="relative w-full h-96 rounded-2xl overflow-hidden shadow-lg">
        <iframe
          src="https://maps.google.com/maps?q=2242+65th+St,+Brooklyn,+NY+11204&hl=en&z=16&output=embed"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="My Meds Pharmacy Location"
        />
        
        {/* Map Overlay with Pharmacy Info */}
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-xs">
          <div className="flex items-start gap-3">
            <div className="bg-[#376F6B] rounded-full p-2">
              <MapPin className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-sm">My Meds Pharmacy</h3>
              <p className="text-gray-600 text-xs mt-1">{pharmacyAddress}</p>
              <Button 
                onClick={handleDirections}
                size="sm"
                className="mt-2 bg-[#376F6B] hover:bg-[#2A5A56] text-white text-xs px-3 py-1"
              >
                <Car className="h-3 w-3 mr-1" />
                Directions
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Pharmacy Details */}
      {showDetails && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Address */}
          <div className="bg-white rounded-lg p-4 shadow-md border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="bg-[#376F6B]/10 rounded-full p-2">
                <MapPin className="h-5 w-5 text-[#376F6B]" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 text-sm">Address</h4>
                <p className="text-gray-600 text-sm mt-1">{pharmacyAddress}</p>
              </div>
            </div>
          </div>

          {/* Phone */}
          <div className="bg-white rounded-lg p-4 shadow-md border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="bg-[#376F6B]/10 rounded-full p-2">
                <Phone className="h-5 w-5 text-[#376F6B]" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 text-sm">Phone</h4>
                <p className="text-gray-600 text-sm mt-1">{pharmacyPhone}</p>
                <Button 
                  onClick={handleCall}
                  variant="link"
                  className="text-[#376F6B] hover:text-[#2A5A56] p-0 h-auto text-sm"
                >
                  Call Now
                </Button>
              </div>
            </div>
          </div>

          {/* Email */}
          <div className="bg-white rounded-lg p-4 shadow-md border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="bg-[#376F6B]/10 rounded-full p-2">
                <Mail className="h-5 w-5 text-[#376F6B]" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 text-sm">Email</h4>
                <p className="text-gray-600 text-sm mt-1">{pharmacyEmail}</p>
                <Button 
                  onClick={handleEmail}
                  variant="link"
                  className="text-[#376F6B] hover:text-[#2A5A56] p-0 h-auto text-sm"
                >
                  Send Email
                </Button>
              </div>
            </div>
          </div>

          {/* Hours */}
          <div className="bg-white rounded-lg p-4 shadow-md border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="bg-[#376F6B]/10 rounded-full p-2">
                <Clock className="h-5 w-5 text-[#376F6B]" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 text-sm">Hours</h4>
                <p className="text-gray-600 text-sm mt-1">{pharmacyHours}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <div className="mt-8 text-center">
        <div className="bg-gradient-to-r from-[#376F6B] to-[#2A5A56] rounded-2xl p-6 text-white">
          <h3 className="text-xl font-bold mb-3">Visit Us Today</h3>
          <p className="text-white/90 mb-4">
            Stop by our pharmacy for personalized care and expert consultation
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={handleDirections}
              className="bg-white text-[#376F6B] hover:bg-gray-100 font-semibold"
            >
              <Car className="h-4 w-4 mr-2" />
              Get Directions
            </Button>
            <Button 
              onClick={handleCall}
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-[#376F6B]"
            >
              <Phone className="h-4 w-4 mr-2" />
              Call Us
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
