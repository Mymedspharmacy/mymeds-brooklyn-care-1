import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Services } from "@/components/Services";
import { Testimonials } from "@/components/Testimonials";
import { Map } from "@/components/Map";
import { Footer } from "@/components/Footer";
import { RefillForm } from "@/components/RefillForm";
import { AppointmentForm } from "@/components/AppointmentForm";
import { TransferForm } from "@/components/TransferForm";
import { OTCSection } from "@/components/OTCSection";
import { Toaster } from "@/components/ui/toaster";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Index = () => {
  const [showRefillForm, setShowRefillForm] = useState(false);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [showTransferForm, setShowTransferForm] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Handle navigation state from special offers page
  useEffect(() => {
    if (location.state) {
      if (location.state.openRefillForm) {
        setShowRefillForm(true);
        // Clear the state to prevent reopening on refresh
        navigate(location.pathname, { replace: true, state: {} });
      } else if (location.state.openTransferForm) {
        setShowTransferForm(true);
        navigate(location.pathname, { replace: true, state: {} });
      } else if (location.state.openAppointmentForm) {
        setShowAppointmentForm(true);
        navigate(location.pathname, { replace: true, state: {} });
      }
    }
  }, [location.state, navigate, location.pathname]);

  return (
    <div className="min-h-screen bg-[#D5C6BC]">
      <Header 
        onRefillClick={() => setShowRefillForm(true)} 
        onAppointmentClick={() => setShowAppointmentForm(true)}
        onTransferClick={() => setShowTransferForm(true)}
      />
      <Hero 
        onRefillClick={() => setShowRefillForm(true)}
      />
      <Services 
        onRefillClick={() => setShowRefillForm(true)}
        onTransferClick={() => setShowTransferForm(true)}
        onAppointmentClick={() => setShowAppointmentForm(true)} 
      />
      <OTCSection />
      <Testimonials />
      
      {/* Location Section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#376F6B] mb-6">
              Find Us
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Visit our pharmacy for personalized care and expert consultation. We're conveniently located in Brooklyn.
            </p>
          </div>
          <Map />
        </div>
      </section>
      
      <Footer />
      <RefillForm isOpen={showRefillForm} onClose={() => setShowRefillForm(false)} />
      <AppointmentForm isOpen={showAppointmentForm} onClose={() => setShowAppointmentForm(false)} />
      <TransferForm isOpen={showTransferForm} onClose={() => setShowTransferForm(false)} />
      <Toaster />
    </div>
  );
};

export default Index;
