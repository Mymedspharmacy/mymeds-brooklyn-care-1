import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
// WooCommerce checkout replaces Stripe
import ErrorBoundary from "@/components/ErrorBoundary";
import { ScrollToTop } from "@/components/ScrollToTop";
import { setupGlobalErrorHandling } from "@/utils/errorHandling";
import { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load components for better performance
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Shop = lazy(() => import("./pages/Shop"));
const Services = lazy(() => import("./pages/Services"));
const SpecialOffers = lazy(() => import("./pages/SpecialOffers"));
const Blog = lazy(() => import("./pages/Blog"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Admin = lazy(() => import("./pages/Admin"));
const AdminSignIn = lazy(() => import("./pages/AdminSignIn"));
const AdminReset = lazy(() => import("./pages/AdminReset"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const HIPAANotice = lazy(() => import("./pages/HIPAANotice"));
const PatientResources = lazy(() => import("./pages/PatientResources"));
const PatientPortal = lazy(() => import("./pages/PatientPortal"));
const PatientAccountCreation = lazy(() => import("./pages/PatientAccountCreation"));
const ProductView = lazy(() => import("./pages/ProductView"));
const MedicationInteractionChecker = lazy(() => import("./components/MedicationInteractionChecker"));

// Loading component
const PageLoader = () => (
  <div className="min-h-screen bg-[#D5C6BC] flex items-center justify-center">
    <div className="space-y-4 w-full max-w-md">
      <Skeleton className="h-8 w-3/4 mx-auto" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-4/6" />
    </div>
  </div>
);

// Setup global error handling
setupGlobalErrorHandling();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
    mutations: {
      retry: 1,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      {/* WooCommerce checkout replaces Stripe */}
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/product/:productId" element={<ProductView />} />
                <Route path="/services" element={<Services />} />
                <Route path="/special-offers" element={<SpecialOffers />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/admin-signin" element={<AdminSignIn />} />
                <Route path="/admin-reset" element={<AdminReset />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route path="/hipaa-notice" element={<HIPAANotice />} />
                <Route path="/patient-resources" element={<PatientResources />} />
                <Route path="/patient-portal" element={<PatientPortal />} />
                <Route path="/patient-account-creation" element={<PatientAccountCreation />} />
                <Route path="/medication-interaction-checker" element={<MedicationInteractionChecker />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
              {/* WooCommerce checkout replaces Stripe */}
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
