import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Pill, Truck, Heart, Shield, Star, Clock, CheckCircle, Phone, Mail, MapPin, Calendar, DollarSign, Users, Award, Zap, Gift, Tag, ShoppingCart, ArrowRight, Package } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function SpecialOffers() {
  const navigate = useNavigate();
  const [selectedOffer, setSelectedOffer] = useState(null);

  const specialOffers = [
    {
      id: 'prescription-refills',
      icon: Pill,
      title: "Prescription Refills",
      description: "Fast & Easy Refills, Right When You Need Them",
      longDescription: "Our prescription refill program is designed to make managing your medications as affordable as possible. We believe that quality healthcare shouldn't come with unexpected costs.",
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
      description: "Special pricing and services for our senior community members",
      longDescription: "We honor and support our senior community with special pricing, priority service, and personalized care. Your health and comfort are our top priorities.",
      features: [
        "15% off all prescriptions",
        "Priority prescription processing",
        "Free medication delivery",
        "Personalized care consultations",
        "Family member benefits",
        "Special health screenings"
      ],
      benefits: [
        "Save 15% on all prescriptions",
        "Priority service and support",
        "Free delivery service",
        "Personalized care attention"
      ],
      terms: [
        "Must be 65 years or older",
        "Valid ID required",
        "Valid for all prescription medications",
        "Cannot be combined with other offers"
      ],
      savings: "15% off",
      duration: "Ongoing",
      popularity: "Community Favorite",
      actionButton: "Learn More",
      actionIcon: Heart,
      actionType: "info"
    },
    {
      id: 'new-patient',
      icon: Users,
      title: "New Patient Welcome Package",
      description: "Special benefits and savings for new patients joining our pharmacy family",
      longDescription: "Welcome to our pharmacy family! New patients receive exclusive benefits including free consultations, discounted services, and personalized care plans.",
      features: [
        "Free initial consultation",
        "20% off first prescription",
        "Free medication review",
        "Personalized care plan",
        "Family member discounts",
        "Priority appointment scheduling"
      ],
      benefits: [
        "Save on your first prescription",
        "Free professional consultation",
        "Personalized care from day one",
        "Family benefits included"
      ],
      terms: [
        "New patients only",
        "Valid for first 30 days",
        "One-time use per patient",
        "Cannot be combined with other offers"
      ],
      savings: "20% off first Rx",
      duration: "30 days",
      popularity: "New Patient",
      actionButton: "Get Started",
      actionIcon: Users,
      actionType: "appointment"
    },
    {
      id: 'bulk-discount',
      icon: Package,
      title: "Bulk Purchase Discounts",
      description: "Save more when you buy in larger quantities",
      longDescription: "Stock up and save! Our bulk purchase program offers significant discounts on larger quantities of medications and health products.",
      features: [
        "Up to 25% off bulk orders",
        "90-day supply options",
        "Automatic refill scheduling",
        "Free storage containers",
        "Priority processing",
        "Family member sharing options"
      ],
      benefits: [
        "Save up to 25% on medications",
        "Convenient 90-day supplies",
        "Reduced refill frequency",
        "Better cost management"
      ],
      terms: [
        "Minimum 90-day supply",
        "Valid for maintenance medications",
        "Some restrictions may apply",
        "Insurance coordination required"
      ],
      savings: "Up to 25% off",
      duration: "Ongoing",
      popularity: "Smart Savings",
      actionButton: "Order Bulk",
      actionIcon: Package,
      actionType: "refill"
    },
    {
      id: 'referral-rewards',
      icon: Gift,
      title: "Referral Rewards Program",
      description: "Earn rewards when you refer friends and family to our pharmacy",
      longDescription: "Share the care and earn rewards! Our referral program rewards you for helping others discover our exceptional pharmacy services.",
      features: [
        "$25 credit per referral",
        "Unlimited referrals",
        "Easy referral tracking",
        "Instant rewards",
        "Family member bonuses",
        "Special referral events"
      ],
      benefits: [
        "Earn $25 per successful referral",
        "Unlimited earning potential",
        "Help others discover quality care",
        "Build community connections"
      ],
      terms: [
        "Referral must be a new patient",
        "Referral must complete first prescription",
        "Credit applied to your account",
        "Valid for 12 months"
      ],
      savings: "$25 per referral",
      duration: "Ongoing",
      popularity: "Community Builder",
      actionButton: "Refer Friends",
      actionIcon: Gift,
      actionType: "referral"
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
    window.open('mailto:mymedspharmacy@outlook.com');
  };

  const handleMapClick = () => {
    window.open('https://maps.app.goo.gl/gXSVqF25sAB7r6m76', '_blank');
  };

  const handlePersonalizedRecommendations = () => {
    console.log('Opening personalized recommendations...');
    // Navigate to home page with appointment form open for personalized consultation
    navigate('/', { state: { openAppointmentForm: true, consultationType: 'personalized' } });
  };

  const handleContactTeam = () => {
    console.log('Opening contact options...');
    // Show contact options - can call or email
    const choice = confirm('How would you like to contact our team?\n\nClick OK to call us\nClick Cancel to send an email');
    if (choice) {
      handleCallClick();
    } else {
      handleEmailClick();
    }
  };

  const handleActionClick = (offer) => {
    try {
      console.log('Button clicked:', offer.actionButton, 'Action type:', offer.actionType);
      
      switch (offer.actionType) {
        case 'refill':
          console.log('Navigating to refill form...');
          navigate('/', { state: { openRefillForm: true } });
          break;
        case 'shop':
          console.log('Navigating to shop...');
          navigate('/shop');
          break;
        case 'appointment':
          console.log('Navigating to appointment form...');
          navigate('/', { state: { openAppointmentForm: true } });
          break;
        case 'referral':
          console.log('Opening email for referral...');
          handleEmailClick();
          break;
        case 'info':
          console.log('Opening info modal...');
          setSelectedOffer(offer);
          break;
        default:
          console.log('Unknown action type:', offer.actionType);
          setSelectedOffer(offer);
      }
    } catch (error) {
      console.error('Error handling button click:', error);
      // Fallback: open the modal for more information
      setSelectedOffer(offer);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header 
        onRefillClick={() => navigate('/', { state: { openRefillForm: true } })}
        onAppointmentClick={() => navigate('/', { state: { openAppointmentForm: true } })}
        onTransferClick={() => navigate('/', { state: { openTransferForm: true } })}
      />
      
      <div className="pt-20">
        {/* Hero Section */}
        <section className="py-16 sm:py-20 md:py-24 bg-[#57BBB6] text-white relative overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-white text-[#57BBB6] px-6 py-3 rounded-full text-sm font-semibold mb-8 shadow-lg">
                <Gift className="h-5 w-5" />
                Special Offers
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-8">
                Exclusive 
                <span className="block text-white">
                  Savings & Benefits
                </span>
              </h1>
              
              <p className="text-xl sm:text-2xl text-white/90 max-w-4xl mx-auto font-medium leading-relaxed">
                Discover our special offers designed to make quality healthcare more accessible and affordable. 
                From prescription refills to senior discounts, we have savings for everyone.
              </p>
            </div>
          </div>
        </section>

        {/* Offers Grid */}
        <section className="py-16 sm:py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#57BBB6] mb-6">
                Current Offers
              </h2>
              <p className="text-lg sm:text-xl text-[#376F6B] max-w-3xl mx-auto">
                Take advantage of these exclusive offers and start saving on your healthcare today.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {specialOffers.map((offer) => (
                <Card 
                  key={offer.id} 
                  className="group border-0 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer"
                  onClick={() => setSelectedOffer(offer)}
                >
                  <CardContent className="p-6 flex flex-col h-full">
                    {/* Offer Header */}
                    <div className="text-center mb-6 flex-shrink-0">
                      <div className="w-20 h-20 bg-[#57BBB6] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <offer.icon className="h-10 w-10 text-white" />
                      </div>
                      
                      <Badge className="bg-[#376F6B] text-white border-0 mb-3">
                        {offer.popularity}
                      </Badge>
                      
                      <CardTitle className="text-xl font-bold text-[#57BBB6] mb-2 group-hover:text-[#376F6B] transition-colors duration-300">
                        {offer.title}
                      </CardTitle>
                      
                      <CardDescription className="text-[#57BBB6] mb-4">
                        {offer.description}
                      </CardDescription>
                    </div>

                    {/* Offer Details */}
                    <div className="space-y-4 mb-6 flex-shrink-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[#57BBB6]">Duration:</span>
                        <span className="text-sm font-medium text-[#57BBB6]">{offer.duration}</span>
                      </div>
                    </div>

                    {/* Action Button - Spacer to push to bottom */}
                    <div className="mt-auto">
                      <Button 
                        className="w-full bg-[#57BBB6] hover:bg-[#376F6B] text-white font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
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
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 sm:py-20 bg-[#D5C6BC]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-[#57BBB6] rounded-3xl p-8 sm:p-12 text-center text-white relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
                  Questions About Our Offers?
                </h3>
                <p className="text-lg sm:text-xl mb-8 text-white/90">
                  Our team is here to help you understand and take advantage of these special offers
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    onClick={() => handlePersonalizedRecommendations()}
                    className="bg-white text-[#57BBB6] hover:bg-gray-100 font-bold px-8 py-4 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 shadow-lg border border-[#57BBB6]"
                  >
                    <Package className="w-5 h-5 mr-2" />
                    Get Personalized Recommendations
                  </Button>
                  
                  <Button 
                    onClick={() => handleContactTeam()}
                    variant="outline"
                    className="bg-[#57BBB6] text-white hover:bg-[#376F6B] font-bold px-8 py-4 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 border-white"
                  >
                    <ArrowRight className="w-5 h-5 mr-2" />
                    Contact Our Team
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Offer Detail Modal */}
      {selectedOffer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-[#57BBB6] rounded-2xl flex items-center justify-center shadow-lg">
                    <selectedOffer.icon className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-[#57BBB6]">{selectedOffer.title}</h3>
                    <p className="text-[#376F6B]">{selectedOffer.description}</p>
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
                  <h4 className="text-xl font-bold text-[#57BBB6] mb-4">What's Included</h4>
                  <ul className="space-y-2">
                    {selectedOffer.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-[#57BBB6]">
                        <CheckCircle className="h-5 w-5 mr-3 text-[#57BBB6] flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-xl font-bold text-[#57BBB6] mb-4">Benefits</h4>
                  <ul className="space-y-2">
                    {selectedOffer.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-center text-[#57BBB6]">
                        <CheckCircle className="h-5 w-5 mr-3 text-[#57BBB6] flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-8 p-6 bg-[#57BBB6]/5 rounded-2xl">
                <h4 className="text-lg font-bold text-[#57BBB6] mb-3">Terms & Conditions</h4>
                <ul className="space-y-1 text-sm text-[#57BBB6]">
                  {selectedOffer.terms.map((term, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-[#57BBB6] mr-2">•</span>
                      {term}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={() => {
                    setSelectedOffer(null);
                    handleActionClick(selectedOffer);
                  }}
                  className="bg-[#57BBB6] text-white hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex-1"
                >
                  <selectedOffer.actionIcon className="w-5 h-5 mr-2" />
                  {selectedOffer.actionButton}
                </Button>
                <Button 
                  onClick={handleCallClick}
                  variant="outline"
                  className="flex-1 border-[#57BBB6] text-[#57BBB6] hover:bg-[#57BBB6] hover:text-white"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Call for Details
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
} 