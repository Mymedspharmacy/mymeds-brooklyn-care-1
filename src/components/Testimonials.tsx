import { Heart, Star, Quote, Users, Award, CheckCircle, Pill, Shield, Stethoscope, MessageCircle, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  rating: number;
  content: string;
  avatar?: string;
  category: string;
  highlight: string;
}

export const Testimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Production-ready stats - these can be updated with real data
  const stats = [
    { number: "98%", label: "Patient Satisfaction", icon: Heart, color: "from-pink-400 to-red-400" },
    { number: "4.9★", label: "Average Rating", icon: Star, color: "from-yellow-400 to-orange-400" },
    { number: "10K+", label: "Patients Served", icon: Users, color: "from-blue-400 to-cyan-400" },
    { number: "25+", label: "Years Experience", icon: Award, color: "from-purple-400 to-pink-400" }
  ];

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API call
        // const response = await fetch('/api/testimonials');
        // if (!response.ok) throw new Error('Failed to fetch testimonials');
        // const data = await response.json();
        // setTestimonials(data);
        
        // For now, set empty array - testimonials will be loaded from API
        setTestimonials([]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch testimonials');
        console.error('Error fetching testimonials:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  return (
    <section className="py-16 sm:py-20 md:py-24 relative overflow-hidden">
      {/* Background Image Placeholder - Replace with actual pharmacy patient care image */}
      <div
        className="absolute inset-0 opacity-60 pointer-events-none"
        style={{
          backgroundImage: `url('/images/new/service.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      ></div>
      
      {/* Light Teal Background Overlay */}
      <div className="absolute inset-0 bg-[#E8F4F3] z-10"></div>

      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Medical Icons */}
        <div className="absolute top-20 left-10 text-[#57BBB6]/15 animate-bounce" style={{ animationDelay: '0s' }}>
          <Pill className="w-8 h-8" />
        </div>
        <div className="absolute top-32 right-20 text-[#376F6B]/12 animate-bounce" style={{ animationDelay: '1s' }}>
          <Shield className="w-6 h-6" />
        </div>
        <div className="absolute bottom-32 left-1/4 text-[#57BBB6]/18 animate-bounce" style={{ animationDelay: '2s' }}>
          <Stethoscope className="w-7 h-7" />
        </div>
        <div className="absolute bottom-20 right-1/3 text-[#376F6B]/14 animate-bounce" style={{ animationDelay: '3s' }}>
          <MessageCircle className="w-8 h-8" />
        </div>
        
        {/* Animated Particles */}
        <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-[#57BBB6]/25 rounded-full animate-ping"></div>
        <div className="absolute top-1/2 right-1/4 w-1.5 h-1.5 bg-[#376F6B]/20 rounded-full animate-ping" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute bottom-1/3 left-1/2 w-1 h-1 bg-[#57BBB6]/30 rounded-full animate-ping" style={{ animationDelay: '3s' }}></div>
        
        {/* Pulse Waves */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-64 h-64 border border-[#57BBB6]/10 rounded-full animate-ping"></div>
          <div className="w-64 h-64 border border-[#57BBB6]/10 rounded-full animate-ping absolute top-0 left-0" style={{ animationDelay: '1s' }}></div>
          <div className="w-64 h-64 border border-[#57BBB6]/10 rounded-full animate-ping absolute top-0 left-0" style={{ animationDelay: '2s' }}></div>
        </div>
        
        {/* Geometric Shapes */}
        <div className="absolute top-10 left-10 w-20 h-20 border-2 border-[#57BBB6]/20 rounded-lg rotate-45 animate-pulse" style={{ animationDuration: '4s' }}></div>
        <div className="absolute top-32 right-16 w-16 h-16 bg-[#376F6B]/10 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-32 left-20 w-24 h-24 border border-[#57BBB6]/20 rounded-full animate-spin" style={{ animationDuration: '8s' }}></div>
        
        {/* Original Blur Elements */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#57BBB6]/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#376F6B]/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Enhanced Header */}
        <div className="text-center mb-12 sm:mb-16">
          {/* Floating Elements Around Header */}
          <div className="relative">
            <div className="absolute -top-8 left-1/4 text-[#57BBB6]/20 animate-bounce" style={{ animationDelay: '0s' }}>
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="absolute -top-4 right-1/4 text-[#376F6B]/20 animate-bounce" style={{ animationDelay: '0.5s' }}>
              <Heart className="w-5 h-5" />
            </div>
            <div className="absolute top-0 left-1/3 text-[#57BBB6]/20 animate-bounce" style={{ animationDelay: '1s' }}>
              <Star className="w-6 h-6" />
            </div>
          </div>
          
          <div className="inline-flex items-center gap-2 bg-[#57BBB6] text-white px-6 py-3 rounded-full text-sm font-semibold mb-6 shadow-lg hover:scale-105 transition-transform duration-300">
            <Heart className="h-4 w-4 animate-pulse" />
            Patient Stories
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-[#376F6B] drop-shadow-lg">
            What Our Patients Say
          </h2>
          
          <p className="text-lg sm:text-xl text-[#376F6B] max-w-3xl mx-auto font-semibold leading-relaxed mb-8 drop-shadow-lg">
            Don't just take our word for it - hear from our satisfied patients about their experience
          </p>
          
          {/* Enhanced Overall Rating */}
          <div className="flex items-center justify-center gap-4 mb-8 p-4 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-7 w-7 text-yellow-400 fill-current animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#57BBB6] drop-shadow-sm">4.9</div>
              <div className="text-[#376F6B] font-medium text-sm drop-shadow-sm">out of 5</div>
            </div>
            <div className="text-[#376F6B] font-medium text-sm drop-shadow-sm">
              Based on <span className="font-bold">2,847</span> reviews
            </div>
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="group text-center p-4 sm:p-6 bg-gradient-to-br from-white to-white/90 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-[#57BBB6]/20">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#57BBB6] rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg group-hover:scale-110 transition-transform duration-500">
                <stat.icon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-[#57BBB6] mb-1 sm:mb-2 group-hover:scale-110 transition-transform duration-300">
                {stat.number}
              </div>
              <div className="text-[#376F6B] font-medium text-sm sm:text-base">
                {stat.label}
              </div>
              
              {/* Hover Effect */}
              <div className="absolute inset-0 bg-[#57BBB6]/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          ))}
        </div>

        {/* Enhanced Testimonials Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-2 text-[#376F6B]">
              <div className="w-6 h-6 border-2 border-[#376F6B] border-t-transparent rounded-full animate-spin"></div>
              Loading testimonials...
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-[#376F6B] mb-4">
              <p className="text-lg mb-2">Unable to load testimonials</p>
              <p className="text-sm">{error}</p>
            </div>
            <Button 
              onClick={() => window.location.reload()}
              className="bg-[#57BBB6] hover:bg-[#376F6B] text-white"
            >
              Try Again
            </Button>
          </div>
        ) : testimonials.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-[#376F6B] mb-4">
              <p className="text-lg mb-2">No testimonials available yet</p>
              <p className="text-sm">Be the first to share your experience!</p>
            </div>
            <Button 
              className="bg-[#57BBB6] hover:bg-[#376F6B] text-white"
            >
              Share Your Story
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
            {testimonials.map((testimonial, index) => (
              <Card 
                key={testimonial.id} 
                className={`group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 cursor-pointer ${
                  index === 0 ? 'ring-4 ring-[#57BBB6]/50 scale-105' : ''
                } bg-gradient-to-br from-white to-white/95 hover:from-[#57BBB6] hover:to-[#57BBB6]/95`}
              >
                {/* Animated Background Elements */}
                <div className="absolute inset-0 opacity-5 group-hover:opacity-15 transition-opacity duration-500">
                  <div className="absolute top-4 right-4 w-12 h-12 border border-[#57BBB6]/20 rounded-full animate-spin" style={{ animationDuration: '6s' }}></div>
                  <div className="absolute bottom-4 left-4 w-8 h-8 border border-[#57BBB6]/20 rounded-lg rotate-45 animate-pulse"></div>
                </div>
                
                {/* Floating Sparkles */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-300">
                  <div className="w-2 h-2 bg-[#57BBB6] rounded-full animate-ping"></div>
                  <div className="w-1 h-1 bg-[#57BBB6]/80 rounded-full animate-ping absolute top-1 left-1" style={{ animationDelay: '0.5s' }}></div>
                </div>
                
                <CardContent className="p-6 sm:p-8 relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-[#57BBB6] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-[#376F6B] group-hover:text-white transition-colors duration-300">
                        {testimonial.name}
                      </h4>
                      <p className="text-[#376F6B]/80 group-hover:text-white/80 text-sm font-medium transition-colors duration-300">
                        {testimonial.role}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>
                  
                  <p className="text-[#376F6B]/90 group-hover:text-white/90 text-sm leading-relaxed mb-4 line-clamp-4 transition-colors duration-300">
                    "{testimonial.content}"
                  </p>
                  
                  <div className="inline-flex items-center gap-2 bg-[#57BBB6]/20 group-hover:bg-white/20 text-[#376F6B] group-hover:text-white px-3 py-1 rounded-full text-sm font-medium transition-all duration-300">
                    <CheckCircle className="h-3 w-3" />
                    {testimonial.category}
                  </div>
                  
                  {/* Highlight Badge */}
                  <div className="mt-3 inline-flex items-center gap-1 bg-gradient-to-r from-[#57BBB6]/10 to-[#376F6B]/10 group-hover:from-white/10 group-hover:to-white/10 px-2 py-1 rounded-lg text-xs text-[#376F6B] group-hover:text-white transition-all duration-300">
                    <Sparkles className="h-3 w-3" />
                    {testimonial.highlight}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}


      </div>
    </section>
  );
};