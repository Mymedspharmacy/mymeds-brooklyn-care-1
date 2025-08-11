import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#D5C6BC]">
      <Header 
        onRefillClick={() => navigate('/', { state: { openRefillForm: true } })}
        onAppointmentClick={() => navigate('/', { state: { openAppointmentForm: true } })}
        onTransferClick={() => navigate('/', { state: { openTransferForm: true } })}
      />
      
      <div className="pt-20 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h1 className="text-6xl sm:text-8xl font-bold mb-4 text-[#376F6B]">404</h1>
          <p className="text-xl sm:text-2xl text-[#376F6B] mb-6">Oops! Page not found</p>
          <p className="text-lg text-[#57BBB6] mb-8 max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <button 
            onClick={() => navigate('/')}
            className="bg-[#57BBB6] hover:bg-[#376F6B] text-white px-8 py-3 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Return to Home
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default NotFound;
