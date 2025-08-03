import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Services } from "@/components/Services";
import { About } from "@/components/About";
import { Testimonials } from "@/components/Testimonials";
import { Contact } from "@/components/Contact";
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
    <div className="min-h-screen bg-background">
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
      <About />
      <OTCSection />
      <Testimonials />
      <Contact />
      <Footer />
      <RefillForm isOpen={showRefillForm} onClose={() => setShowRefillForm(false)} />
      <AppointmentForm isOpen={showAppointmentForm} onClose={() => setShowAppointmentForm(false)} />
      <TransferForm isOpen={showTransferForm} onClose={() => setShowTransferForm(false)} />
      <Toaster />
    </div>
  );
};

export default Index;
