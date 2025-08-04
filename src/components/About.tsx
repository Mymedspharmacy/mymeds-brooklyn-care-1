import { Award, Heart, Users, Clock, Star, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const About = () => {
  const stats = [
    {
      icon: Award,
      number: "Licensed",
      label: "Certified Pharmacists",
      color: "from-brand-accent to-brand"
    },
    {
      icon: Heart,
      number: "Caring",
      label: "Personalized Service",
      color: "from-brand-light to-brand-accent"
    },
    {
      icon: Users,
      number: "Community",
      label: "Local Focus",
      color: "from-brand to-brand-light"
    },
    {
      icon: Clock,
      number: "Available",
      label: "Extended Hours",
      color: "from-brand to-brand-dark"
    }
  ];

  const benefits = [
    "Experienced, licensed pharmacists",
    "Convenient location and extended hours",
    "Comprehensive health services",
    "Free prescription delivery service",
    "Insurance accepted and affordable pricing"
  ];

  return (
    <section id="about" className="py-16 sm:py-20 md:py-24 bg-gradient-to-br from-gray-50 via-white to-brand-light/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          
          {/* Left Column - Enhanced Content */}
          <div className="space-y-8">
            {/* Enhanced Header */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-light to-brand text-white px-4 py-2 rounded-full text-sm font-semibold">
                <Star className="h-4 w-4" />
                About Our Pharmacy
              </div>
              
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                About 
                <span className="block bg-gradient-to-r from-brand-light to-brand bg-clip-text text-transparent">
                  My Meds Pharmacy
                </span>
              </h2>
              
              <div className="space-y-6 text-lg leading-relaxed text-gray-600">
                <p>
                  Welcome to <span className="font-semibold text-brand">My Meds Pharmacy</span>, your trusted healthcare partner in Brooklyn, NY. 
                  We are a locally-owned, full-service pharmacy committed to providing exceptional pharmaceutical care 
                  and personalized service to our community.
                </p>
                <p>
                  Our experienced team of licensed pharmacists and healthcare professionals is dedicated to ensuring 
                  you receive the highest quality medications, expert consultation, and compassionate care. 
                  We understand that your health is personal, and we treat every patient like family.
                </p>
                <p>
                  From prescription medications to over-the-counter products, health screenings, immunizations, 
                  and medication therapy management, we offer comprehensive pharmaceutical services to support 
                  your wellness journey.
                </p>
              </div>
            </div>

            {/* Enhanced Stats Grid - Aligned with text */}
            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              {stats.map((stat, index) => (
                <div 
                  key={index} 
                  className="group text-center p-4 sm:p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 border border-gray-100"
                >
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                    <stat.icon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg sm:text-2xl text-gray-900 mb-1 sm:mb-2 group-hover:text-brand transition-colors duration-300">
                    {stat.number}
                  </h3>
                  <p className="text-gray-600 font-medium text-sm sm:text-base leading-relaxed">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Enhanced Cards - Perfectly Aligned */}
          <div className="space-y-8 mt-16">
            {/* Mission Card - Aligned with left text */}
            <div className="bg-gradient-to-br from-brand to-brand-light rounded-2xl p-6 sm:p-8 shadow-2xl transform hover:scale-105 transition-transform duration-500">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Star className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white">Our Mission</h3>
              </div>
              <p className="text-white/95 text-base sm:text-lg leading-relaxed">
                 To provide exceptional pharmaceutical care while building lasting relationships with 
                 our patients through <span className="font-semibold">trust, expertise, and personalized attention</span> 
                 to their health needs. We strive to be more than just a pharmacy – we aim to be your 
                 trusted healthcare partner, offering comprehensive medication management, expert consultation, 
                 and compassionate support throughout your wellness journey. Our commitment extends beyond 
                 dispensing medications to empowering our community with knowledge, accessibility, and 
                 innovative healthcare solutions that enhance quality of life.
              </p>
            </div>

            {/* Why Choose Us Card - Aligned with left feature boxes */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl border border-gray-100 transform hover:scale-105 transition-transform duration-500">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-brand-light to-brand rounded-xl flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Why Choose Us?</h3>
              </div>
              
              <ul className="space-y-3 sm:space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start group">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-brand-light to-brand rounded-full mr-3 sm:mr-4 mt-1 flex-shrink-0 group-hover:scale-110 transition-transform duration-300"></div>
                    <span className="text-gray-700 text-base sm:text-lg leading-relaxed group-hover:text-gray-900 transition-colors duration-300">
                      {benefit}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};