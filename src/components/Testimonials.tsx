import { useState } from "react";
import { Star, Quote, Plus, X, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const Testimonials = () => {
  // TODO: Load real testimonials from the database or CMS in production
  const [testimonials, setTestimonials] = useState([]);

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    name: "",
    location: "",
    rating: 5,
    text: ""
  });

  const [hoveredRating, setHoveredRating] = useState(0);

  const handleAddReview = () => {
    if (newReview.name && newReview.text) {
      const review = {
        id: Date.now(),
        ...newReview,
        date: new Date().toISOString().split('T')[0]
      };
      setTestimonials(prev => [review, ...prev]);
      setNewReview({ name: "", location: "", rating: 5, text: "" });
      setShowReviewForm(false);
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
    : "0.0";

  return (
    <section className="py-20 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">What Our Patients Say</h2>
          <p className="text-xl text-pharmacy-gray mb-6">
            Don't just take our word for it - hear from our satisfied patients
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
              <span className="text-2xl font-bold text-foreground">{averageRating}</span>
            </div>
            <span className="text-pharmacy-gray">({testimonials.length} reviews)</span>
          </div>

          {/* Add Review Button */}
          <Button 
            onClick={() => setShowReviewForm(true)}
            className="bg-[#376f6b] hover:bg-[#57bbb6] text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Write a Review
          </Button>
        </div>

        {/* Review Form Modal */}
        {showReviewForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-[#376f6b]">Write a Review</h3>
                <button 
                  onClick={() => setShowReviewForm(false)}
                  className="text-[#376f6b] hover:text-[#57bbb6]"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#231f20] mb-2">
                    Your Name *
                  </label>
                  <Input
                    value={newReview.name}
                    onChange={(e) => setNewReview(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your name"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#231f20] mb-2">
                    Location
                  </label>
                  <Input
                    value={newReview.location}
                    onChange={(e) => setNewReview(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="City, State"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#231f20] mb-2">
                    Rating *
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        className="p-1"
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
                  <label className="block text-sm font-medium text-[#231f20] mb-2">
                    Your Review *
                  </label>
                  <Textarea
                    value={newReview.text}
                    onChange={(e) => setNewReview(prev => ({ ...prev, text: e.target.value }))}
                    placeholder="Share your experience with My Meds Pharmacy..."
                    rows={4}
                    className="w-full"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button 
                    onClick={handleAddReview}
                    disabled={!newReview.name || !newReview.text}
                    className="flex-1 bg-[#376f6b] hover:bg-[#57bbb6] text-white disabled:opacity-50"
                  >
                    Submit Review
                  </Button>
                  <Button 
                    onClick={() => setShowReviewForm(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reviews Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Quote className="h-8 w-8 text-primary mr-2" />
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-5 w-5 ${i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-pharmacy-gray">
                    {formatDate(testimonial.date)}
                  </span>
                </div>
                
                <p className="text-muted-foreground mb-6 leading-relaxed italic">
                  "{testimonial.text}"
                </p>
                
                <div className="border-t pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#376f6b] rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground">{testimonial.name}</h4>
                      <p className="text-sm text-pharmacy-gray">
                        {testimonial.location}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {testimonials.length === 0 && (
          <div className="text-center py-12">
            <Quote size={48} className="mx-auto text-[#57bbb6] mb-4" />
            <p className="text-[#231f20] text-lg">No reviews yet</p>
            <p className="text-[#376f6b]">Be the first to share your experience!</p>
          </div>
        )}
      </div>
    </section>
  );
};