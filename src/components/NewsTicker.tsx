import { useState, useEffect } from 'react';
import { Truck, Gift, Star } from 'lucide-react';

export const NewsTicker = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const announcements = [
    {
      icon: Truck,
      text: "Free Shipping over $50 purchase",
      color: "text-teal-600"
    },
    {
      icon: Gift,
      text: "New customers get 10% off first order",
      color: "text-teal-600"
    },
    {
      icon: Star,
      text: "Premium health products now available",
      color: "text-teal-600"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % announcements.length);
    }, 4000); // Change announcement every 4 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#D5C6BC] py-4 px-4 overflow-hidden">
      <div className="container mx-auto">
        <div className="flex items-center justify-center">
          {/* Moving Announcement */}
          <div className="flex-1 max-w-4xl mx-auto">
            <div className="relative h-8 overflow-hidden">
              <div 
                className="flex items-center gap-3 transition-transform duration-1000 ease-in-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                {announcements.map((announcement, index) => {
                  const IconComponent = announcement.icon;
                  return (
                    <div 
                      key={index}
                      className="flex items-center gap-3 h-8 flex-shrink-0 w-full justify-center"
                    >
                      <IconComponent className="h-5 w-5 text-teal-500" />
                      <span className="text-lg font-bold text-teal-600 tracking-wide uppercase">
                        {announcement.text}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
