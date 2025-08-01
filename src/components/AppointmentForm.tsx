import { useState, useEffect } from "react";
import { 
  X, Calendar, Clock, User, Phone, Mail, MessageSquare, 
  Info, CheckCircle, AlertCircle, Star, Shield, Clock4,
  MapPin, PhoneCall, CalendarDays, ArrowRight, Building2, Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import api from '../lib/api';

interface AppointmentFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppointmentForm = ({ isOpen, onClose }: AppointmentFormProps) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    service: '',
    preferredDate: '',
    preferredTime: '',
    notes: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Simple time slots for easier booking
  const timeSlots = [
    '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
    '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM', '6:00 PM'
  ];

  const services = [
    {
      id: 'immunizations',
      name: 'Immunizations',
      description: 'Flu Shot, COVID-19, Shingles, and more',
      icon: Shield,
      duration: '15-20 minutes'
    },
    {
      id: 'medication-therapy',
      name: 'Medication Therapy Management',
      description: 'Comprehensive medication review and consultation',
      icon: Building2,
      duration: '30-45 minutes'
    },
    {
      id: 'private-consultation',
      name: 'Private Consultation',
      description: 'One-on-one health consultation with our pharmacists',
      icon: User,
      duration: '20-30 minutes'
    },
    {
      id: 'health-screening',
      name: 'Health Screening',
      description: 'Blood pressure, cholesterol, and diabetes screening',
      icon: CheckCircle,
      duration: '25-35 minutes'
    },
    {
      id: 'blood-pressure',
      name: 'Blood Pressure Check',
      description: 'Quick blood pressure monitoring',
      icon: Heart,
      duration: '10-15 minutes'
    },
    {
      id: 'diabetes-consultation',
      name: 'Diabetes Consultation',
      description: 'Specialized diabetes care and education',
      icon: Star,
      duration: '30-40 minutes'
    },
    {
      id: 'other',
      name: 'Other Services',
      description: 'Custom health services and consultations',
      icon: Info,
      duration: 'Varies'
    }
  ];

  // Check if date is valid (not weekend, not in past, not too far in future)
  const isValidDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);
    
    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
    const maxFutureDate = new Date();
    maxFutureDate.setDate(maxFutureDate.getDate() + 30); // 30 days in future
    
    return dayOfWeek !== 0 && dayOfWeek !== 6 && selectedDate >= today && selectedDate <= maxFutureDate;
  };

  const handleDateChange = (dateString: string) => {
    const date = new Date(dateString);
    if (isValidDate(date)) {
      setSelectedDate(date);
      setFormData(prev => ({ ...prev, preferredDate: dateString }));
      setFormData(prev => ({ ...prev, preferredTime: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    // Validate all required fields
    Object.keys(formData).forEach(key => {
      if (key !== 'notes') { // notes is optional
        const error = validateField(key, formData[key as keyof typeof formData]);
        if (error) {
          newErrors[key] = error;
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      toast({ 
        title: 'Validation Error', 
        description: 'Please fix the errors in the form before submitting.', 
        variant: 'destructive' 
      });
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess(false);
    
    try {
      await api.post('/appointments/request', formData);
      setSuccess(true);
      setFormData({ 
        firstName: '', lastName: '', phone: '', email: '', 
        service: '', preferredDate: '', preferredTime: '', notes: '' 
      });
      setErrors({});
      toast({ 
        title: 'Appointment Request Submitted!', 
        description: "We'll contact you within 24 hours to confirm your appointment." 
      });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit appointment request');
      toast({ 
        title: 'Error', 
        description: error, 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  const validateField = (name: string, value: string) => {
    switch (name) {
      case 'firstName':
        if (!value.trim()) return 'First name is required';
        if (value.trim().length < 2) return 'First name must be at least 2 characters';
        return '';
      case 'lastName':
        if (!value.trim()) return 'Last name is required';
        if (value.trim().length < 2) return 'Last name must be at least 2 characters';
        return '';
      case 'phone':
        if (!value.trim()) return 'Phone number is required';
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
          return 'Please enter a valid phone number';
        }
        return '';
      case 'email':
        if (!value.trim()) return 'Email address is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'Please enter a valid email address';
        return '';
      case 'service':
        if (!value) return 'Please select a service';
        return '';
      case 'preferredDate':
        if (!value) return 'Please select a preferred date';
        return '';
      case 'preferredTime':
        if (!value) return 'Please select a preferred time';
        return '';
      default:
        return '';
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const getSelectedService = () => {
    return services.find(service => service.id === formData.service);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <Card className="bg-white rounded-2xl shadow-2xl max-w-full sm:max-w-4xl w-full max-h-[95vh] overflow-y-auto border-0">
        {/* Enhanced Header */}
        <CardHeader className="relative rounded-t-2xl bg-gradient-to-r from-[#376f6b] to-[#57bbb6] text-white p-6 border-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full p-2"
          >
            <X className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl sm:text-3xl font-bold text-white">
                Book Your Appointment
              </CardTitle>
              <p className="text-white/90 text-sm sm:text-base">
                Schedule a consultation with our pharmacy professionals
              </p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  currentStep >= step 
                    ? 'bg-white text-[#376f6b]' 
                    : 'bg-white/30 text-white'
                }`}>
                  {currentStep > step ? <CheckCircle className="h-4 w-4" /> : step}
                </div>
                {step < 3 && (
                  <div className={`w-12 h-0.5 mx-2 ${
                    currentStep > step ? 'bg-white' : 'bg-white/30'
                  }`} />
                )}
              </div>
            ))}
          </div>
          
          <div className="flex justify-between text-xs text-white/80 mt-2">
            <span>Service Selection</span>
            <span>Date & Time</span>
            <span>Contact Info</span>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Service Selection */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Choose Your Service</h3>
                  <p className="text-gray-600">Select the service you'd like to schedule</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className={`group relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                        formData.service === service.id
                          ? 'border-[#57bbb6] bg-gradient-to-r from-[#57bbb6]/10 to-[#376f6b]/10 shadow-lg'
                          : 'border-gray-200 hover:border-[#57bbb6]/50 hover:shadow-md'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, service: service.id }))}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          formData.service === service.id
                            ? 'bg-gradient-to-r from-[#57bbb6] to-[#376f6b] text-white'
                            : 'bg-gray-100 text-gray-600 group-hover:bg-[#57bbb6]/10'
                        }`}>
                          <service.icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">{service.name}</h4>
                          <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock4 className="h-3 w-3" />
                            <span>{service.duration}</span>
                          </div>
                        </div>
                        {formData.service === service.id && (
                          <CheckCircle className="h-5 w-5 text-[#57bbb6] ml-2" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-1">What to Expect</h4>
                      <p className="text-sm text-blue-800">
                        Our consultations are personalized and comprehensive. We'll review your health history, 
                        current medications, and provide expert guidance tailored to your needs.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Date & Time Selection */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Select Date & Time</h3>
                  <p className="text-gray-600">Choose a convenient time during our business hours</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Date Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      <Calendar className="inline h-4 w-4 mr-2" />
                      Preferred Date
                    </label>
                    <Input
                      type="date"
                      name="preferredDate"
                      value={formData.preferredDate}
                      onChange={(e) => handleDateChange(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      max={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                      className="w-full border-2 border-gray-200 focus:border-[#57bbb6] focus:ring-[#57bbb6]"
                    />
                    
                                         {selectedDate && !isValidDate(selectedDate) && (
                       <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                         <AlertCircle className="h-4 w-4" />
                         <span>Please select a valid date (Monday-Friday, within 30 days)</span>
                       </div>
                     )}
                  </div>

                  {/* Time Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      <Clock className="inline h-4 w-4 mr-2" />
                      Preferred Time
                    </label>
                                         <select
                       name="preferredTime"
                       value={formData.preferredTime}
                       onChange={handleChange}
                       disabled={!selectedDate}
                       className="w-full px-3 py-2 border-2 border-gray-200 rounded-md focus:border-[#57bbb6] focus:ring-[#57bbb6] disabled:bg-gray-100"
                     >
                       <option value="">Select a time</option>
                       {timeSlots.map((time, index) => (
                         <option key={index} value={time}>{time}</option>
                       ))}
                     </select>
                  </div>
                </div>

                                 {/* Available Times Info */}
                 <div className="bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-lg p-4">
                   <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                     <Clock4 className="h-4 w-4" />
                     Available Appointment Times
                   </h4>
                   <div className="text-sm text-gray-600">
                     <p className="mb-2">We offer appointments Monday through Friday, 9:00 AM to 6:00 PM.</p>
                     <p>Weekends and holidays are not available for appointments.</p>
                   </div>
                 </div>

                                 {/* Selected Service Info */}
                 {getSelectedService() && (
                   <div className="bg-[#57bbb6]/10 border border-[#57bbb6]/20 rounded-lg p-4">
                     <div className="flex items-center gap-3">
                       <div className="w-8 h-8 bg-[#57bbb6] rounded-lg flex items-center justify-center">
                         {(() => {
                           const IconComponent = getSelectedService()!.icon;
                           return <IconComponent className="h-4 w-4 text-white" />;
                         })()}
                       </div>
                       <div>
                         <h4 className="font-semibold text-gray-900">{getSelectedService()!.name}</h4>
                         <p className="text-sm text-gray-600">{getSelectedService()!.description}</p>
                       </div>
                     </div>
                   </div>
                 )}
              </div>
            )}

            {/* Step 3: Contact Information */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Contact Information</h3>
                  <p className="text-gray-600">Please provide your details so we can confirm your appointment</p>
                </div>

                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                     <label className="block text-sm font-semibold text-gray-900 mb-2">
                       <User className="inline h-4 w-4 mr-2" />
                       First Name <span className="text-red-500">*</span>
                     </label>
                     <Input
                       name="firstName"
                       type="text"
                       required
                       value={formData.firstName}
                       onChange={handleChange}
                       onBlur={handleBlur}
                       className={`border-2 focus:border-[#57bbb6] focus:ring-[#57bbb6] ${
                         errors.firstName ? 'border-red-300' : 'border-gray-200'
                       }`}
                       placeholder="Enter your first name"
                     />
                     {errors.firstName && (
                       <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                         <AlertCircle className="h-3 w-3" />
                         {errors.firstName}
                       </p>
                     )}
                   </div>
                   <div>
                     <label className="block text-sm font-semibold text-gray-900 mb-2">
                       Last Name <span className="text-red-500">*</span>
                     </label>
                     <Input
                       name="lastName"
                       type="text"
                       required
                       value={formData.lastName}
                       onChange={handleChange}
                       onBlur={handleBlur}
                       className={`border-2 focus:border-[#57bbb6] focus:ring-[#57bbb6] ${
                         errors.lastName ? 'border-red-300' : 'border-gray-200'
                       }`}
                       placeholder="Enter your last name"
                     />
                     {errors.lastName && (
                       <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                         <AlertCircle className="h-3 w-3" />
                         {errors.lastName}
                       </p>
                     )}
                   </div>
                 </div>

                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                     <label className="block text-sm font-semibold text-gray-900 mb-2">
                       <Phone className="inline h-4 w-4 mr-2" />
                       Phone Number <span className="text-red-500">*</span>
                     </label>
                     <Input
                       name="phone"
                       type="tel"
                       required
                       value={formData.phone}
                       onChange={handleChange}
                       onBlur={handleBlur}
                       className={`border-2 focus:border-[#57bbb6] focus:ring-[#57bbb6] ${
                         errors.phone ? 'border-red-300' : 'border-gray-200'
                       }`}
                       placeholder="(555) 123-4567"
                     />
                     {errors.phone && (
                       <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                         <AlertCircle className="h-3 w-3" />
                         {errors.phone}
                       </p>
                     )}
                   </div>
                   <div>
                     <label className="block text-sm font-semibold text-gray-900 mb-2">
                       <Mail className="inline h-4 w-4 mr-2" />
                       Email Address <span className="text-red-500">*</span>
                     </label>
                     <Input
                       name="email"
                       type="email"
                       required
                       value={formData.email}
                       onChange={handleChange}
                       onBlur={handleBlur}
                       className={`border-2 focus:border-[#57bbb6] focus:ring-[#57bbb6] ${
                         errors.email ? 'border-red-300' : 'border-gray-200'
                       }`}
                       placeholder="your.email@example.com"
                     />
                     {errors.email && (
                       <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                         <AlertCircle className="h-3 w-3" />
                         {errors.email}
                       </p>
                     )}
                   </div>
                 </div>

                                 <div>
                   <label className="block text-sm font-semibold text-gray-900 mb-2">
                     <MessageSquare className="inline h-4 w-4 mr-2" />
                     Additional Notes <span className="text-gray-500 text-xs">(Optional)</span>
                   </label>
                   <Textarea
                     name="notes"
                     rows={4}
                     value={formData.notes}
                     onChange={handleChange}
                     className="border-2 border-gray-200 focus:border-[#57bbb6] focus:ring-[#57bbb6]"
                     placeholder="Any specific concerns, questions, or special requests..."
                   />
                 </div>

                {/* Appointment Summary */}
                <div className="bg-gradient-to-r from-[#57bbb6]/10 to-[#376f6b]/10 border border-[#57bbb6]/20 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Appointment Summary
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Service:</span>
                      <span className="font-medium">{getSelectedService()?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">
                        {formData.preferredDate ? new Date(formData.preferredDate).toLocaleDateString() : 'Not selected'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time:</span>
                      <span className="font-medium">{formData.preferredTime || 'Not selected'}</span>
                    </div>
                  </div>
                </div>

                {/* Important Notice */}
                                 <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                   <div className="flex items-start gap-3">
                     <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                     <div>
                       <h4 className="font-semibold text-blue-900 mb-1">Important Information</h4>
                       <ul className="text-sm text-blue-800 space-y-1">
                         <li>• This is an appointment request. We'll confirm within 24 hours.</li>
                         <li>• Please arrive 10 minutes before your scheduled time.</li>
                         <li>• Bring your ID and insurance card if applicable.</li>
                         <li>• Call us if you need to reschedule or cancel.</li>
                         <li>• All fields marked with <span className="text-red-500">*</span> are required.</li>
                       </ul>
                     </div>
                   </div>
                 </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 pt-4 border-t border-gray-200">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  className="flex-1 border-2 border-gray-200 hover:border-[#57bbb6] hover:text-[#57bbb6]"
                >
                  Previous
                </Button>
              )}
              
              {currentStep < 3 ? (
                                 <Button
                   type="button"
                   onClick={nextStep}
                   disabled={
                     (currentStep === 1 && !formData.service) ||
                     (currentStep === 2 && (!formData.preferredDate || !formData.preferredTime))
                   }
                   className="flex-1 bg-gradient-to-r from-[#376f6b] to-[#57bbb6] hover:shadow-lg text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
                 >
                  Next Step
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                                 <Button
                   type="submit"
                   disabled={loading}
                   className="flex-1 bg-gradient-to-r from-[#376f6b] to-[#57bbb6] hover:shadow-lg text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
                 >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Submitting...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Submit Appointment Request
                    </div>
                  )}
                </Button>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}
            
            {success && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
                <CheckCircle className="h-4 w-4" />
                <span>Appointment request sent successfully!</span>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};