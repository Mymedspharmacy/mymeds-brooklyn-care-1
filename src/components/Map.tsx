import { MapPin, Phone, Mail, Clock, Car, Navigation, Star, Heart, Shield, Users, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface MapProps {
  showDetails?: boolean;
  className?: string;
}

export const Map = ({ showDetails = true, className = "" }: MapProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [activeTab, setActiveTab] = useState<'map' | 'street' | 'satellite'>('map');
  
  const pharmacyAddress = "My Meds Pharmacy Inc, 2242 65th St, Brooklyn, NY 11204, United States";
  const pharmacyPhone = "347-312-6458";
  const pharmacyEmail = "mymedspharmacy@outlook.com";
  const pharmacyHours = "Mon-Fri: 9AM-7PM, Sat: 9AM-5PM, Sun: 10AM-4PM";

  const handleDirections = () => {
    // Use the exact Google Maps location provided
    window.open(import.meta.env.VITE_GOOGLE_MAPS_URL || 'https://maps.google.com', '_blank');
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

  const getMapUrl = (type: string) => {
    const baseUrl = "https://maps.google.com/maps";
    const query = "2242+65th+St,+Brooklyn,+NY+11204";
    
    switch (type) {
      case 'street':
        return `${baseUrl}?q=${query}&hl=en&z=16&t=m&output=embed`;
      case 'satellite':
        return `${baseUrl}?q=${query}&hl=en&z=16&t=k&output=embed`;
      default:
        return `${baseUrl}?q=${query}&hl=en&z=16&output=embed`;
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Enhanced Map Container with Extended Sides */}
      <div className="relative w-full h-[500px] rounded-3xl overflow-hidden shadow-2xl group"
           onMouseEnter={() => setIsHovered(true)}
           onMouseLeave={() => setIsHovered(false)}>
        
        {/* Background Images Behind Map */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `url('/images/new/contactus.jpg')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          ></div>
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url('/images/new/service.jpg')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          ></div>
        </div>
        
        {/* Enhanced Overlay for Map Readability */}
        <div className="absolute inset-0 bg-black/50 z-10"></div>
        
        {/* Map Type Selector Tabs */}
        <div className="absolute top-4 right-4 z-30 flex gap-2">
          {[
            { id: 'map', label: 'Map', icon: MapPin },
            { id: 'street', label: 'Street', icon: Navigation },
            { id: 'satellite', label: 'Satellite', icon: Star }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-[#376F6B] text-white shadow-lg'
                  : 'bg-white/90 text-gray-700 hover:bg-white hover:shadow-md'
              }`}
            >
              <tab.icon className="h-3 w-3 inline mr-1" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Interactive Map iframe */}
        <iframe
          src={getMapUrl(activeTab)}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="My Meds Pharmacy Location"
          className="transition-all duration-500 group-hover:scale-[1.02] relative z-20"
        />
        
        {/* Enhanced Map Overlay with Pharmacy Info */}
        <div className={`absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl p-5 max-w-sm transition-all duration-500 z-30 ${
          isHovered ? 'scale-105 shadow-2xl' : 'scale-100'
        }`}>
          <div className="flex items-start gap-4">
                         <div className="bg-[#57BBB6] rounded-full p-3 shadow-lg">
               <MapPin className="h-6 w-6 text-white" />
             </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-lg mb-2">My Meds Pharmacy</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-3">{pharmacyAddress}</p>
              
              {/* Enhanced Action Buttons */}
              <div className="flex flex-col gap-2">
                                 <Button 
                   onClick={handleDirections}
                   size="sm"
                   className="bg-[#57BBB6] hover:bg-[#376F6B] text-white text-sm px-4 py-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                 >
                  <Car className="h-4 w-4 mr-2" />
                  Get Directions
                </Button>
                
                <Button 
                  onClick={handleCall}
                  variant="outline"
                  size="sm"
                  className="border-[#376F6B] text-[#376F6B] hover:bg-[#376F6B] hover:text-white text-sm px-4 py-2 transition-all duration-300 transform hover:scale-105"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call Now
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Interactive Elements */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Floating Medical Icons */}
          <div className="absolute top-20 right-20 text-[#57BBB6]/20 animate-bounce" style={{ animationDelay: '0s' }}>
            <Heart className="w-6 h-6" />
          </div>
          <div className="absolute bottom-20 left-20 text-[#376F6B]/20 animate-bounce" style={{ animationDelay: '1s' }}>
            <Shield className="w-5 h-5" />
          </div>
          <div className="absolute top-1/2 right-10 text-[#57BBB6]/15 animate-bounce" style={{ animationDelay: '2s' }}>
            <Users className="w-7 h-7" />
          </div>
          <div className="absolute bottom-1/3 right-1/3 text-[#376F6B]/18 animate-bounce" style={{ animationDelay: '3s' }}>
            <Stethoscope className="w-6 h-6" />
          </div>
          
          {/* Animated Particles */}
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-[#57BBB6]/30 rounded-full animate-ping"></div>
          <div className="absolute top-1/2 right-1/4 w-1.5 h-1.5 bg-[#376F6B]/25 rounded-full animate-ping" style={{ animationDelay: '1.5s' }}></div>
          <div className="absolute bottom-1/3 left-1/2 w-1 h-1 bg-[#57BBB6]/35 rounded-full animate-ping" style={{ animationDelay: '3s' }}></div>
        </div>

        {/* Corner Decorative Elements */}
        <div className="absolute top-0 left-0 w-16 h-16 border-l-4 border-t-4 border-[#57BBB6]/30 rounded-tl-3xl"></div>
        <div className="absolute top-0 right-0 w-16 h-16 border-r-4 border-t-4 border-[#376F6B]/30 rounded-tr-3xl"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 border-l-4 border-b-4 border-[#57BBB6]/30 rounded-bl-3xl"></div>
        <div className="absolute bottom-0 right-0 w-16 h-16 border-r-4 border-b-4 border-[#376F6B]/30 rounded-br-3xl"></div>
      </div>

      {/* Enhanced Pharmacy Details with Extended Layout */}
      {showDetails && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                     {/* Address */}
           <div className="bg-white rounded-xl p-5 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
             <div className="flex items-center gap-4">
               <div className="bg-[#57BBB6] rounded-full p-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
                 <MapPin className="h-6 w-6 text-white" />
               </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 text-base mb-2">Address</h4>
                <p className="text-gray-600 text-sm leading-relaxed">{pharmacyAddress}</p>
              </div>
            </div>
          </div>

                     {/* Phone */}
           <div className="bg-white rounded-xl p-5 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
             <div className="flex items-center gap-4">
               <div className="bg-[#57BBB6] rounded-full p-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
                 <Phone className="h-6 w-6 text-white" />
               </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 text-base mb-2">Phone</h4>
                <p className="text-gray-600 text-sm mb-2">{pharmacyPhone}</p>
                <Button 
                  onClick={handleCall}
                  variant="link"
                  className="text-[#376F6B] hover:text-[#57BBB6] p-0 h-auto text-sm font-medium hover:underline transition-colors duration-300"
                >
                  Call Now
                </Button>
              </div>
            </div>
          </div>

                     {/* Email */}
           <div className="bg-white rounded-xl p-5 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
             <div className="flex items-center gap-4">
               <div className="bg-[#57BBB6] rounded-full p-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
                 <Mail className="h-6 w-6 text-white" />
               </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 text-base mb-2">Email</h4>
                <p className="text-gray-600 text-sm mb-2">{pharmacyEmail}</p>
                <Button 
                  onClick={handleEmail}
                  variant="link"
                  className="text-[#376F6B] hover:text-[#57BBB6] p-0 h-auto text-sm font-medium hover:underline transition-colors duration-300"
                >
                  Send Email
                </Button>
              </div>
            </div>
          </div>

                     {/* Hours */}
           <div className="bg-white rounded-xl p-5 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
             <div className="flex items-center gap-4">
               <div className="bg-[#57BBB6] rounded-full p-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
                 <Clock className="h-6 w-6 text-white" />
               </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 text-base mb-2">Hours</h4>
                <p className="text-gray-600 text-sm leading-relaxed">{pharmacyHours}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced CTA Section with Extended Layout */}
      <div className="mt-10 text-center">
                 <div className="bg-[#57BBB6] rounded-3xl p-8 text-white relative overflow-hidden">
          {/* Background Decorative Elements */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-32 h-32 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          </div>
          
          <div className="relative z-10">
            <h3 className="text-2xl font-bold mb-4">Visit Us Today</h3>
            <p className="text-white/90 mb-6 text-lg max-w-2xl mx-auto leading-relaxed">
              Stop by our pharmacy for personalized care and expert consultation. We're here to serve the Brooklyn community with compassion and expertise.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={handleDirections}
                className="bg-[#57BBB6] text-white hover:bg-[#376F6B] font-semibold px-6 py-3 text-base shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Car className="h-5 w-5 mr-2" />
                Get Directions
              </Button>
              <Button 
                onClick={handleCall}
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-[#376F6B] font-semibold px-6 py-3 text-base shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Phone className="h-5 w-5 mr-2" />
                Call Us
              </Button>
            </div>
            
            {/* Decorative Dots */}
            <div className="flex justify-center space-x-2 mt-6">
              <div className="w-2 h-2 bg-[#57BBB6] rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
              <div className="w-2 h-2 bg-[#57BBB6] rounded-full animate-pulse" style={{ animationDelay: '0.6s' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
