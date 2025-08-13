import { useState } from 'react';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Pill, Heart, Shield, Brain, Leaf, Eye, Phone, ArrowRight, Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const OTCSection = () => {
  const navigate = useNavigate();
  const otcCategories = [
    {
      icon: Pill,
      title: "Pain Relief",
      description: "Fast-acting pain relief for headaches, muscle aches, and joint discomfort",
      items: ["Acetaminophen", "Ibuprofen", "Aspirin", "Topical pain relievers"],
      image: "/images/otc/pain-relief.jpg"
    },
    {
      icon: Heart,
      title: "Heart Health",
      description: "Supplements and medications to support cardiovascular wellness",
      items: ["Blood pressure support", "Cholesterol management", "Heart rhythm support", "Circulation boosters"],
      image: "/images/otc/heart-health.jpg"
    },
    {
      icon: Shield,
      title: "Cold & Flu Relief",
      description: "Effective relief from common cold and flu symptoms for all ages",
      items: ["Decongestants", "Cough suppressants", "Fever reducers", "Immune boosters"],
      image: "/images/otc/cold-flu.jpg"
    },
    {
      icon: Brain,
      title: "First Aid & Wound Care",
      description: "Essential supplies for minor injuries and emergency preparedness",
      items: ["Bandages", "Antiseptics", "Gauze", "Medical tape"],
      image: "/images/otc/first-aid.jpg"
    },
    {
      icon: Leaf,
      title: "Digestive Health",
      description: "Natural solutions for digestive comfort and gut health support",
      items: ["Probiotics", "Digestive enzymes", "Fiber supplements", "Stomach soothers"],
      image: "/images/otc/digestive-health.jpg"
    },
    {
      icon: Shield,
      title: "Pediatric Care",
      description: "Safe and effective products specifically formulated for children",
      items: ["Children's pain relief", "Kids' vitamins", "Pediatric supplements", "Child-safe remedies"],
      image: "/images/otc/pediatric-care.jpg"
    },
    {
      icon: Heart,
      title: "Sleep & Relaxation",
      description: "Natural sleep aids and relaxation support for better rest",
      items: ["Melatonin", "Herbal sleep aids", "Relaxation supplements", "Stress relief"],
      image: "/images/otc/sleep-relaxation.jpg"
    },
    {
      icon: Leaf,
      title: "Natural & Organic",
      description: "Eco-friendly and natural alternatives for health and wellness",
      items: ["Organic supplements", "Herbal remedies", "Natural pain relief", "Plant-based products"],
      image: "/images/otc/natural-organic.jpg"
    }
  ];

  return (
    <section className="py-16 sm:py-20 md:py-24 bg-[#D5C6BC] relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-[#D5C6BC]/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#D5C6BC]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#D5C6BC]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Enhanced Header Section */}
        <div className="text-center mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 bg-[#57BBB6] text-white px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Pill className="h-4 w-4" />
            Over-the-Counter
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#57BBB6] leading-tight mb-6">
            Complete 
            <span className="block text-[#57BBB6]">
              Health & Wellness
            </span>
          </h2>
          
          <p className="text-lg sm:text-xl text-[#376F6B] max-w-3xl mx-auto font-semibold">
            Discover our comprehensive selection of over-the-counter medications, supplements, and health products 
            carefully curated to support your daily wellness journey.
          </p>
        </div>

        {/* Enhanced Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 lg:gap-10 mb-12 sm:mb-16">
          {otcCategories.map((category, index) => (
            <Card key={index} className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-[#57BBB6] hover:bg-[#57BBB6]/95">
              {/* Category Image Background */}
              <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none">
                <img 
                  src={category.image} 
                  alt={category.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              
              {/* Floating Elements */}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-200 pointer-events-none">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              </div>

              <CardContent className="relative p-6 sm:p-8">
                {/* Enhanced Icon */}
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-500 group-hover:rotate-3">
                  <category.icon className="h-8 w-8 text-white group-hover:scale-110 transition-transform duration-300" />
                </div>

                {/* Category Title & Description */}
                <CardTitle className="text-xl font-bold text-white group-hover:text-white transition-colors duration-300 mb-4 text-center">
                  {category.title}
                </CardTitle>
                
                <CardDescription className="text-white/90 mb-6 text-sm leading-relaxed font-medium group-hover:text-white transition-colors duration-300 text-center">
                  {category.description}
                </CardDescription>

                {/* Enhanced Items List */}
                <div className="space-y-2 mb-6">
                  {category.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-start group/item">
                      <div className="w-1.5 h-1.5 bg-white rounded-full mr-3 mt-2 flex-shrink-0 group-hover/item:scale-125 transition-transform duration-300"></div>
                      <span className="text-xs text-white/90 group-hover:text-white font-medium leading-relaxed">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Enhanced Button */}
                <Button 
                  className="w-full bg-white text-[#57BBB6] hover:bg-gray-100 font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                  onClick={() => navigate('/shop', { state: { category: category.title.toLowerCase() } })}
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Shop Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Enhanced CTA Section */}
        <div className="bg-[#57BBB6] rounded-3xl p-8 sm:p-12 text-center text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
          </div>
          
          <div className="relative z-10">
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 text-white">
              Need Help Choosing?
            </h3>
            <p className="text-lg sm:text-xl mb-8 text-white/90">
              Our licensed pharmacists are here to help you find the right products for your health needs
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => navigate('/contact')}
                className="bg-white text-[#57BBB6] hover:bg-gray-100 font-bold px-8 py-4 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <Phone className="w-5 h-5 mr-2" />
                Consult Pharmacist
              </Button>
              
              <Button 
                onClick={() => navigate('/shop')}
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-[#57BBB6] font-bold px-8 py-4 rounded-xl text-lg transition-all duration-300 transform hover:scale-105"
              >
                <Eye className="w-5 h-5 mr-2" />
                Browse All Products
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};