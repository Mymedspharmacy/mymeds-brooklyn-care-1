import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Pill, Truck, Heart, Shield, Star, Clock, CheckCircle, Phone, Mail, MapPin, Calendar, DollarSign, Users, Award, Zap, Gift, Tag, ShoppingCart, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function SpecialOffers() {
  const navigate = useNavigate();
  const [selectedOffer, setSelectedOffer] = useState(null);

  const specialOffers = [
    {
      id: 'free-refills',
      icon: Pill,
      title: "Prescription Refills",
      description: "Fast & Easy Refills, Right When You Need Them",
      longDescription: "Our  prescription refill program is designed to make managing your medications as affordable as possible. We believe that quality healthcare shouldn't come with unexpected costs.",
      features: [
        "All prescription medications included",
        "Automatic refill reminders",
        "Priority processing",
        "Insurance coordination included",
        "90-day supply options available"
      ],
      benefits: [
        "Save up to $50 per refill",
        "Never worry about refill costs",
        "Convenient automatic reminders",
        "Priority customer service"
      ],
      terms: [
        "Valid for all prescription medications",
        "Must be a registered customer",
        "Insurance copays still apply",
        "Some controlled substances may have restrictions"
      ],
      accent: "from-brand-light to-brand",
      bgGradient: "from-brand-light/10 to-brand/10",
      savings: "$50+ per refill",
      duration: "Ongoing",
      popularity: "Most Popular",
      actionButton: "Refill Prescription",
      actionIcon: Pill,
      actionType: "refill"
    },
    {
      id: 'free-shipping',
      icon: Truck,
      title: "Free Shipping on Orders $50+",
      description: "Fast, reliable delivery right to your doorstep on qualifying orders",
      longDescription: "Shop with confidence knowing that orders over $50 ship completely free. Our delivery service ensures your medications and health products arrive safely and on time.",
      features: [
        "Free shipping on orders $50+",
        "Fast 2-3 business day delivery",
        "Secure packaging & tracking",
        "Signature required for controlled substances",
        "Temperature-controlled delivery",
        "Real-time tracking updates"
      ],
      benefits: [
        "Save up to $15 on shipping",
        "Fast and reliable delivery",
        "Secure handling of medications",
        "Convenient doorstep delivery"
      ],
      terms: [
        "Minimum order value of $50",
        "Valid for Brooklyn and surrounding areas",
        "Excludes controlled substances",
        "Delivery times may vary"
      ],
      accent: "from-brand-accent to-brand",
      bgGradient: "from-brand-accent/10 to-brand/10",
      savings: "$15 per order",
      duration: "Ongoing",
      popularity: "Limited Time",
      actionButton: "Shop Products",
      actionIcon: ShoppingCart,
      actionType: "shop"
    },
    {
      id: 'senior-discount',
      icon: Heart,
      title: "Senior Citizen Discount",
      description: "Special pricing and services for our valued senior customers",
      longDescription: "We honor our senior community with exclusive discounts and personalized services. Our senior program includes special pricing, priority service, and dedicated support.",
      features: [
        "10% discount on all prescriptions",
        "Priority prescription processing",
        "Free medication reviews",
        "Dedicated senior care specialist",
        "Home delivery available",
        "Family consultation services"
      ],
      benefits: [
        "Save 10% on all medications",
        "Priority customer service",
        "Personalized care attention",
        "Family support services"
      ],
      terms: [
        "Must be 65 years or older",
        "Valid ID required",
        "Cannot be combined with other offers",
        "Some restrictions may apply"
      ],
      accent: "from-brand-light to-brand-accent",
      bgGradient: "from-brand-light/10 to-brand-accent/10",
      savings: "10% off",
      duration: "Ongoing",
      popularity: "Exclusive",
      actionButton: "Book Consultation",
      actionIcon: Calendar,
      actionType: "appointment"
    },
    {
      id: 'new-customer',
      icon: Star,
      title: "New Customer Welcome Package",
      description: "Special offers and services for first-time customers",
      longDescription: "Welcome to our pharmacy family! New customers receive exclusive benefits including free consultation, special pricing, and personalized care from day one.",
      features: [
        "Free initial consultation",
        "10% off first prescription",
        "Free health screening",
        "Personalized care plan",
        "Priority customer service",
        "Family member discounts"
      ],
      benefits: [
        "Save 10% on first prescription",
        "Personalized care plan",
        "Family member benefits"
      ],
      terms: [
        "First-time customers only",
        "Valid for 30 days from registration",
        "One-time use per customer",
        "Cannot be combined with other offers"
      ],
      accent: "from-brand-accent to-brand-light",
      bgGradient: "from-brand-accent/10 to-brand-light/10",
      savings: "20% off first order",
      duration: "30 days",
      popularity: "New",
      actionButton: "Book Consultation",
      actionIcon: Calendar,
      actionType: "appointment"
    },
    {
      id: 'bulk-discount',
      icon: ShoppingCart,
      title: "Bulk Purchase Discount",
      description: "Save more when you buy more with our volume pricing",
      longDescription: "Stock up and save! Our bulk purchase program offers significant discounts when you buy multiple months of medication or larger quantities of health products.",
      features: [
        "Up to 25% off bulk orders",
        "90-day supply options",
        "Free storage containers",
        "Automatic refill scheduling",
        "Priority processing",
        "Family package options"
      ],
      benefits: [
        "Save up to 20% on bulk orders",
        "Convenient 90-day supplies",
        "Free storage solutions",
        "Automatic refill management"
      ],
      terms: [
        "Minimum 3-month supply required",
        "Valid for maintenance medications",
        "Some medications excluded",
        "Insurance approval required"
      ],
      accent: "from-brand to-brand-dark",
      bgGradient: "from-brand/10 to-brand-dark/10",
      savings: "Up to 20% off",
      duration: "Ongoing",
      popularity: "Value",
      actionButton: "Refill Prescription",
      actionIcon: Pill,
      actionType: "refill"
    },
    {
      id: 'referral-rewards',
      icon: Gift,
      title: "Referral Rewards Program",
      description: "Earn rewards when you refer friends and family to our pharmacy",
      longDescription: "Share the care and earn rewards! Our referral program rewards you for helping others discover quality healthcare. Both you and your referral receive special benefits.",
      features: [
        "$25 credit for each referral",
        "Referral gets 15% off first order",
        "Unlimited referral rewards",
        "Easy referral tracking",
        "Instant credit application",
        "Family referral bonuses"
      ],
      benefits: [
        "Earn $25 per successful referral",
        "Help others save money",
        "Unlimited earning potential",
        "Easy tracking system"
      ],
      terms: [
        "Referral must be new customer",
        "Referral must make first purchase",
        "Credit applied after first order",
        "Valid for 6 months"
      ],
      accent: "from-brand to-brand-light",
      bgGradient: "from-brand/10 to-brand-light/10",
      savings: "$25 per referral",
      duration: "Ongoing",
      popularity: "Rewarding",
      actionButton: "Transfer Prescription",
      actionIcon: ArrowRight,
      actionType: "transfer"
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

  const handleEmailClick = () => {
    window.location.href = 'mailto:info@mymedspharmacyinc.com';
  };

  const handleMapClick = () => {
    window.open('https://maps.app.goo.gl/gXSVqF25sAB7r6m76', '_blank');
  };

  const handleActionClick = (offer) => {
    switch (offer.actionType) {
      case 'refill':
        // Navigate to home page and trigger refill form
        navigate('/', { state: { openRefillForm: true } });
        break;
      case 'transfer':
        // Navigate to home page and trigger transfer form
        navigate('/', { state: { openTransferForm: true } });
        break;
      case 'appointment':
        // Navigate to home page and trigger appointment form
        navigate('/', { state: { openAppointmentForm: true } });
        break;
      case 'shop':
        // Navigate to shop page
        navigate('/shop');
        break;
      default:
        // Default to opening modal
        setSelectedOffer(offer);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-brand-light/30">
      {/* Header */}
              <div className="bg-white shadow-sm border-b border-brand-light/20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
                              className="flex items-center gap-2 text-brand hover:text-brand-light transition-colors duration-300"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
                            <h1 className="text-4xl font-normal text-brand">SPECIAL OFFERS</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-light to-brand text-white px-6 py-3 rounded-full text-sm font-semibold mb-8 shadow-lg">
            <Gift className="h-5 w-5" />
            Exclusive Offers
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-8">
            Special Offers & Savings
          </h2>
          
          <p className="text-xl sm:text-2xl text-gray-600 max-w-4xl mx-auto font-medium leading-relaxed mb-12">
            Discover our exclusive offers designed to make your healthcare journey more affordable and convenient. 
            From free refills to senior discounts, we have something for everyone.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
            <Card className="text-center p-6 hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 bg-white/80 backdrop-blur-sm border-0">
              <div className="w-16 h-16 bg-gradient-to-r from-brand-light to-brand rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Users className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-brand mb-2">5,000+</div>
              <div className="text-gray-600 font-medium">Happy Customers</div>
            </Card>
            
            <Card className="text-center p-6 hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 bg-white/80 backdrop-blur-sm border-0">
              <div className="w-16 h-16 bg-gradient-to-r from-brand-light to-brand rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <DollarSign className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-brand mb-2">$250K+</div>
              <div className="text-gray-600 font-medium">Total Savings</div>
            </Card>
            
            <Card className="text-center p-6 hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 bg-white/80 backdrop-blur-sm border-0">
              <div className="w-16 h-16 bg-gradient-to-r from-brand-light to-brand rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Award className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-brand mb-2">6</div>
              <div className="text-gray-600 font-medium">Active Offers</div>
            </Card>

            <Card className="text-center p-6 hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 bg-white/80 backdrop-blur-sm border-0">
              <div className="w-16 h-16 bg-gradient-to-r from-brand-light to-brand rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Star className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-brand mb-2">4.9★</div>
              <div className="text-gray-600 font-medium">Customer Rating</div>
            </Card>
          </div>
        </div>

        {/* Offers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {specialOffers.map((offer) => (
            <Card 
              key={offer.id}
              className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer"
              onClick={() => setSelectedOffer(offer)}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${offer.bgGradient} opacity-50`}></div>
              <CardContent className="p-8 relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className={`w-16 h-16 bg-gradient-to-br ${offer.accent} rounded-2xl flex items-center justify-center shadow-lg`}>
                    <offer.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge className={`bg-gradient-to-r ${offer.accent} text-white border-0`}>
                      {offer.popularity}
                    </Badge>
                    <div className={`bg-gradient-to-r ${offer.accent} text-white px-3 py-1 rounded-full text-sm font-bold`}>
                      {offer.savings}
                    </div>
                  </div>
                </div>
                
                <h4 className="text-2xl font-bold text-gray-900 mb-3">
                  {offer.title}
                </h4>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {offer.description}
                </p>
                
                <div className="space-y-2 mb-6">
                  {offer.features.slice(0, 3).map((feature, index) => (
                    <div key={index} className="flex items-center text-sm text-gray-600">
                      <CheckCircle className={`h-4 w-4 mr-2 flex-shrink-0 bg-gradient-to-r ${offer.accent} text-white rounded-full`} />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{offer.duration}</span>
                  </div>
                  <Button 
                    className={`bg-gradient-to-r ${offer.accent} text-white hover:shadow-lg transition-all duration-300 transform hover:scale-105`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleActionClick(offer);
                    }}
                  >
                    <offer.actionIcon className="w-4 h-4 mr-2" />
                    {offer.actionButton}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
                  <div className="bg-gradient-to-r from-brand to-brand-light rounded-3xl p-8 sm:p-12 text-center text-white relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
              Ready to Start Saving?
            </h3>
            <p className="text-lg sm:text-xl mb-8 opacity-90">
              Contact us today to learn more about our special offers and start saving on your healthcare
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={handleCallClick}
                className="bg-white text-brand hover:bg-gray-100 font-bold px-8 py-4 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <Phone className="w-5 h-5 mr-2" />
                Call (347) 312-6458
              </Button>
              
              <Button 
                onClick={handleEmailClick}
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-brand font-bold px-8 py-4 rounded-xl text-lg transition-all duration-300 transform hover:scale-105"
              >
                <Mail className="w-5 h-5 mr-2" />
                Email Us
              </Button>
              
              <Button 
                onClick={handleMapClick}
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-brand font-bold px-8 py-4 rounded-xl text-lg transition-all duration-300 transform hover:scale-105"
              >
                <MapPin className="w-5 h-5 mr-2" />
                Visit Us
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Offer Modal */}
      {selectedOffer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 bg-gradient-to-br ${selectedOffer.accent} rounded-2xl flex items-center justify-center shadow-lg`}>
                    <selectedOffer.icon className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900">{selectedOffer.title}</h3>
                    <p className="text-gray-600">{selectedOffer.description}</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  onClick={() => setSelectedOffer(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-4">What's Included</h4>
                  <div className="space-y-3">
                    {selectedOffer.features.map((feature, index) => (
                      <div key={index} className="flex items-start">
                        <CheckCircle className={`h-5 w-5 mr-3 mt-0.5 flex-shrink-0 bg-gradient-to-r ${selectedOffer.accent} text-white rounded-full`} />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-4">Benefits</h4>
                  <div className="space-y-3">
                    {selectedOffer.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-start">
                        <Zap className={`h-5 w-5 mr-3 mt-0.5 flex-shrink-0 bg-gradient-to-r ${selectedOffer.accent} text-white rounded-full`} />
                        <span className="text-gray-700">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 p-6 bg-gray-50 rounded-2xl">
                <h4 className="text-xl font-bold text-gray-900 mb-4">Terms & Conditions</h4>
                <div className="space-y-2">
                  {selectedOffer.terms.map((term, index) => (
                    <div key={index} className="flex items-start">
                      <Shield className="h-4 w-4 mr-3 mt-0.5 flex-shrink-0 text-gray-500" />
                      <span className="text-gray-600 text-sm">{term}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={() => {
                    setSelectedOffer(null);
                    handleActionClick(selectedOffer);
                  }}
                  className={`bg-gradient-to-r ${selectedOffer.accent} text-white hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex-1`}
                >
                  <selectedOffer.actionIcon className="w-5 h-5 mr-2" />
                  {selectedOffer.actionButton}
                </Button>
                <Button 
                  onClick={handleCallClick}
                  variant="outline"
                  className="flex-1"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Call for Details
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 