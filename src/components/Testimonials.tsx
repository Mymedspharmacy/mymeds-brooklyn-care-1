import { useState, useEffect } from "react";
import { Star, Quote, Plus, X, User, ChevronLeft, ChevronRight, Heart, Shield, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const Testimonials = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    name: "",
    location: "",
    rating: 5,
    text: ""
  });
  const [hoveredRating, setHoveredRating] = useState(0);

  // Production testimonials - will be loaded from API
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load testimonials from API
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        // TODO: Replace with actual API call
        // const response = await fetch('/api/testimonials');
        // const data = await response.json();
        // setTestimonials(data);
        
        // For now, show empty state
        setTestimonials([]);
      } catch (error) {
        console.error('Error fetching testimonials:', error);
        setTestimonials([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  const handleAddReview = async () => {
    if (newReview.name && newReview.text) {
      try {
        // TODO: Replace with actual API call
        // const response = await fetch('/api/testimonials', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(newReview)
        // });
        // const data = await response.json();
        
        // For now, add to local state
        const review = {
          id: Date.now(),
          ...newReview,
          date: new Date().toISOString().split('T')[0],
          avatar: newReview.name.split(' ').map(n => n[0]).join('').toUpperCase()
        };
        setTestimonials(prev => [review, ...prev]);
        setNewReview({ name: "", location: "", rating: 5, text: "" });
        setShowReviewForm(false);
      } catch (error) {
        console.error('Error adding review:', error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const averageRating = testimonials.length > 0 
    ? (testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1)
    : "5.0";

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.ceil(testimonials.length / 3));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + Math.ceil(testimonials.length / 3)) % Math.ceil(testimonials.length / 3));
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Auto-play slider
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <section className="py-16 sm:py-20 md:py-24 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 relative overflow-hidden">
      {/* Healing Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-rose-200/20 to-pink-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-200/20 to-cyan-200/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Enhanced Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-100 to-pink-100 text-rose-600 px-4 py-2 rounded-full text-sm font-semibold mb-6 shadow-sm">
            <Heart className="h-4 w-4" />
            Patient Stories
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
            What Our Patients Say
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto font-semibold leading-relaxed mb-8">
            Don't just take our word for it - hear from our satisfied patients about their experience
          </p>
          
          {/* Overall Rating */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-6 w-6 ${i < Math.floor(Number(averageRating)) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                  />
                ))}
              </div>
              <span className="text-2xl font-bold text-gray-900">{averageRating}</span>
            </div>
            <span className="text-gray-600">({testimonials.length} reviews)</span>
          </div>

          {/* Add Review Button */}
          <Button 
            onClick={() => setShowReviewForm(true)}
            className="bg-gradient-to-r from-[#57bbb6] to-[#376f6b] hover:shadow-lg text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 group"
          >
            <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
            Write a Review
          </Button>
        </div>

        {/* Testimonials Slider */}
        <div className="relative">
          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm text-gray-700 hover:text-[#376f6b] p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm text-gray-700 hover:text-[#376f6b] p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Testimonials Grid */}
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {Array.from({ length: Math.ceil(testimonials.length / 3) }, (_, slideIndex) => (
                <div key={slideIndex} className="w-full flex-shrink-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {testimonials.slice(slideIndex * 3, slideIndex * 3 + 3).map((testimonial) => (
                      <Card 
                        key={testimonial.id} 
                        className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-white/90 backdrop-blur-sm hover:bg-white/95"
                      >
                        <CardContent className="p-6 sm:p-8">
                          {/* Quote Icon */}
                          <div className="flex items-center justify-between mb-4">
                            <Quote className="h-8 w-8 text-[#57bbb6] group-hover:scale-110 transition-transform duration-300" />
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`h-5 w-5 ${i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                                />
                              ))}
                            </div>
                          </div>
                          
                          {/* Testimonial Text */}
                          <p className="text-gray-700 mb-6 leading-relaxed italic text-base sm:text-lg group-hover:text-gray-900 transition-colors duration-300">
                            "{testimonial.text}"
                          </p>
                          
                          {/* Author Info */}
                          <div className="border-t border-gray-100 pt-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-gradient-to-br from-[#57bbb6] to-[#376f6b] rounded-full flex items-center justify-center text-white font-bold text-sm group-hover:scale-110 transition-transform duration-300">
                                {testimonial.avatar}
                              </div>
                              <div>
                                <h4 className="font-bold text-gray-900 group-hover:text-[#376f6b] transition-colors duration-300">
                                  {testimonial.name}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {testimonial.location}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatDate(testimonial.date)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Dots */}
          <div className="flex justify-center mt-8 gap-2">
            {Array.from({ length: Math.ceil(testimonials.length / 3) }, (_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide 
                    ? 'bg-[#57bbb6] scale-125' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Review Form Modal */}
        {showReviewForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl transform scale-100 transition-all duration-300">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-[#376f6b]">Write a Review</h3>
                <button 
                  onClick={() => setShowReviewForm(false)}
                  className="text-[#376f6b] hover:text-[#57bbb6] p-2 rounded-lg hover:bg-gray-100 transition-colors duration-300"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name *
                  </label>
                  <Input
                    value={newReview.name}
                    onChange={(e) => setNewReview(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your name"
                    className="w-full border-gray-200 focus:border-[#57bbb6] focus:ring-[#57bbb6]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <Input
                    value={newReview.location}
                    onChange={(e) => setNewReview(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="City, State"
                    className="w-full border-gray-200 focus:border-[#57bbb6] focus:ring-[#57bbb6]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating *
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        className="p-1 hover:scale-110 transition-transform duration-200"
                      >
                        <Star 
                          className={`h-6 w-6 transition-colors ${
                            star <= (hoveredRating || newReview.rating) 
                              ? 'text-yellow-400 fill-current' 
                              : 'text-gray-300'
                          }`} 
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Review *
                  </label>
                  <Textarea
                    value={newReview.text}
                    onChange={(e) => setNewReview(prev => ({ ...prev, text: e.target.value }))}
                    placeholder="Share your experience with My Meds Pharmacy..."
                    rows={4}
                    className="w-full border-gray-200 focus:border-[#57bbb6] focus:ring-[#57bbb6]"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button 
                    onClick={handleAddReview}
                    disabled={!newReview.name || !newReview.text}
                    className="flex-1 bg-gradient-to-r from-[#57bbb6] to-[#376f6b] hover:shadow-lg text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
                  >
                    Submit Review
                  </Button>
                  <Button 
                    onClick={() => setShowReviewForm(false)}
                    variant="outline"
                    className="flex-1 border-gray-200 hover:border-[#57bbb6] hover:text-[#57bbb6]"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};