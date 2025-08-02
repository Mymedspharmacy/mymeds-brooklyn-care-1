import { ShoppingCart, Heart, Zap, Thermometer, Bandage, Pill, ArrowRight, Star, Phone, Eye, Brain, Baby, Shield, Leaf, Activity } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const OTCSection = () => {
  const navigate = useNavigate();
  const otcCategories = [
    {
      icon: Heart,
      title: "Heart Health",
      description: "Comprehensive cardiovascular wellness products and monitoring solutions",
      items: ["Blood pressure monitors", "Heart-healthy supplements", "Cholesterol management", "Omega-3 supplements"],
      accent: "from-red-500 to-pink-500",
      bgGradient: "from-red-50 to-pink-50",
      image: "/images/otc/heart-health.jpg"
    },
    {
      icon: Thermometer,
      title: "Cold & Flu Relief",
      description: "Effective relief from common cold and flu symptoms for all ages",
      items: ["Pain relievers", "Cough suppressants", "Throat lozenges", "Decongestants"],
      accent: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-50",
      image: "/images/otc/cold-flu.jpg"
    },
    {
      icon: Bandage,
      title: "First Aid & Wound Care",
      description: "Essential supplies for minor injuries and emergency preparedness",
      items: ["Bandages & gauze", "Antiseptic wipes", "Pain relief gels", "Thermometers"],
      accent: "from-green-500 to-emerald-500",
      bgGradient: "from-green-50 to-emerald-50",
      image: "/images/otc/first-aid.jpg"
    },
    {
      icon: Zap,
      title: "Vitamins & Supplements",
      description: "Premium nutritional support for daily wellness and vitality",
      items: ["Multivitamins", "Vitamin D", "Calcium supplements", "Probiotics"],
      accent: "from-yellow-500 to-orange-500",
      bgGradient: "from-yellow-50 to-orange-50",
      image: "/images/otc/vitamins.jpg"
    },
    {
      icon: Pill,
      title: "Digestive Health",
      description: "Gentle solutions for digestive comfort and gut wellness",
      items: ["Antacids", "Anti-diarrheal", "Fiber supplements", "Probiotics"],
      accent: "from-purple-500 to-indigo-500",
      bgGradient: "from-purple-50 to-indigo-50",
      image: "/images/otc/digestive.jpg"
    },
    {
      icon: ShoppingCart,
      title: "Personal Care",
      description: "Complete personal hygiene and wellness products",
      items: ["Oral care", "Skin care", "Hair care", "Feminine hygiene"],
      accent: "from-teal-500 to-cyan-500",
      bgGradient: "from-teal-50 to-cyan-50",
      image: "/images/otc/personal-care.jpg"
    },
    {
      icon: Eye,
      title: "Eye Care",
      description: "Professional eye care products and vision support",
      items: ["Contact lens solutions", "Eye drops", "Reading glasses", "Eye vitamins"],
      accent: "from-indigo-500 to-purple-500",
      bgGradient: "from-indigo-50 to-purple-50",
      image: "/images/otc/eye-care.jpg"
    },
    {
      icon: Brain,
      title: "Mental Wellness",
      description: "Natural supplements for cognitive health and stress relief",
      items: ["Stress relief", "Sleep aids", "Memory support", "Mood enhancers"],
      accent: "from-violet-500 to-purple-500",
      bgGradient: "from-violet-50 to-purple-50",
      image: "/images/otc/mental-wellness.jpg"
    }
  ];

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
    <section className="py-16 sm:py-20 md:py-24 bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Header Section */}
        <div className="text-center mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#57bbb6] to-[#376f6b] text-white px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Star className="h-4 w-4" />
            Health & Wellness
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6">
            Over-the-Counter
            <span className="block bg-gradient-to-r from-[#57bbb6] to-[#376f6b] bg-clip-text text-transparent">
              Health Solutions
            </span>
          </h2>
          
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto font-semibold">
            Discover our comprehensive selection of health and wellness products, carefully curated 
            to support your daily health needs with quality you can trust.
          </p>
        </div>

        {/* Enhanced Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 lg:gap-10 mb-12 sm:mb-16">
          {otcCategories.map((category, index) => (
            <Card key={index} className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-white/80 backdrop-blur-sm hover:bg-white/95">
              {/* Category Image Background */}
              <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                <img 
                  src={category.image} 
                  alt={category.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              
              {/* Gradient Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${category.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
              
              {/* Floating Elements */}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-200">
                <div className={`w-3 h-3 bg-gradient-to-r ${category.accent} rounded-full animate-pulse`}></div>
              </div>

              <CardContent className="relative p-6">
                {/* Enhanced Icon */}
                <div className={`w-16 h-16 bg-gradient-to-br ${category.accent} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-500 group-hover:rotate-3`}>
                  <category.icon className="h-8 w-8 text-white group-hover:scale-110 transition-transform duration-300" />
                </div>

                {/* Category Title & Description */}
                <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-[#376f6b] transition-colors duration-300 mb-4 text-center">
                  {category.title}
                </CardTitle>
                
                <CardDescription className="text-gray-600 mb-6 text-sm leading-relaxed font-medium group-hover:text-gray-700 transition-colors duration-300 text-center">
                  {category.description}
                </CardDescription>

                {/* Enhanced Items List */}
                <div className="space-y-2 mb-6">
                  {category.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-start group/item">
                      <div className={`w-1.5 h-1.5 bg-gradient-to-r ${category.accent} rounded-full mr-3 mt-2 flex-shrink-0 group-hover/item:scale-125 transition-transform duration-300`}></div>
                      <span className="text-xs text-gray-600 group-hover:text-gray-700 font-medium leading-relaxed">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Enhanced Button */}
                <Button 
                  onClick={() => navigate('/shop')}
                  className={`w-full bg-gradient-to-r ${category.accent} hover:shadow-lg text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 group-hover:shadow-xl text-sm`}
                >
                  <span className="flex items-center justify-center gap-2">
                    View Products
                    <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                </Button>

                {/* Healing Border Effect */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${category.accent} opacity-0 group-hover:opacity-20 transition-opacity duration-500`}></div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Enhanced CTA Section */}
        <div className="bg-gradient-to-r from-[#376f6b] to-[#57bbb6] rounded-3xl p-8 sm:p-12 text-center text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
          </div>
          
          <div className="relative z-10">
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
              Need Help Finding the Right Product?
            </h3>
            <p className="text-lg sm:text-xl mb-8 opacity-90">
              Our pharmacists are here to help you choose the best products for your health needs
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => navigate('/shop')}
                className="bg-white text-[#376f6b] hover:bg-gray-100 font-bold px-8 py-4 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Shop All Products
              </Button>
              
              <Button 
                onClick={handleCallClick}
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-[#376f6b] font-bold px-8 py-4 rounded-xl text-lg transition-all duration-300 transform hover:scale-105"
              >
                <Phone className="w-5 h-5 mr-2" />
                Call for Availability
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};