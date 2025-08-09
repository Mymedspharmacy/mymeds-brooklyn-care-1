import { useState } from "react";
import { MapPin, Phone, Mail, Clock, User, MessageCircle, Calendar, AlertCircle, CheckCircle, Send, Building2, Heart, Shield, Truck, Users, Stethoscope, MessageSquare, FileText, Star, ArrowRight, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import api from '../lib/api';
import { safeClipboard } from "@/utils/errorHandling";

export const Contact = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    preferredContact: 'email',
    urgency: 'normal',
    serviceType: '',
    bestTimeToContact: '',
    agreeToTerms: false,
    allowMarketing: false
  });
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const serviceTypes = [
    { value: 'prescription-refill', label: 'Prescription Refill', icon: Heart },
    { value: 'medication-consultation', label: 'Medication Consultation', icon: Shield },
    { value: 'delivery-service', label: 'Delivery Service', icon: Truck },
    { value: 'health-screening', label: 'Health Screening', icon: Stethoscope },
    { value: 'immunization', label: 'Immunization', icon: Users },
    { value: 'general-inquiry', label: 'General Inquiry', icon: MessageSquare },
    { value: 'complaint', label: 'Complaint', icon: AlertCircle },
    { value: 'feedback', label: 'Feedback', icon: Star },
    { value: 'other', label: 'Other', icon: FileText }
  ];

  const urgencyLevels = [
    { value: 'low', label: 'Low Priority', description: 'General questions or feedback' },
    { value: 'normal', label: 'Normal Priority', description: 'Standard inquiries or requests' },
    { value: 'high', label: 'High Priority', description: 'Urgent medication or health concerns' },
    { value: 'emergency', label: 'Emergency', description: 'Critical health situations' }
  ];

  const contactMethods = [
    { value: 'email', label: 'Email', icon: Mail },
    { value: 'phone', label: 'Phone Call', icon: Phone },
    { value: 'text', label: 'Text Message', icon: MessageCircle },
    { value: 'any', label: 'Any Method', icon: MessageSquare }
  ];

  const timeSlots = [
    'Morning (9 AM - 12 PM)',
    'Afternoon (12 PM - 3 PM)',
    'Late Afternoon (3 PM - 6 PM)',
    'Evening (6 PM - 8 PM)',
    'No Preference'
  ];

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) errors.firstName = 'First name is required';
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!formData.phone.trim()) errors.phone = 'Phone number is required';
    if (!formData.subject.trim()) errors.subject = 'Subject is required';
    if (!formData.message.trim()) errors.message = 'Message is required';
    if (!formData.agreeToTerms) errors.agreeToTerms = 'You must agree to our terms and conditions';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({ 
        title: 'Form Validation Error', 
        description: 'Please correct the errors in the form.', 
        variant: 'destructive' 
      });
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);
    
    try {
      const submitData = {
        ...formData,
        fullName: `${formData.firstName} ${formData.lastName}`,
        timestamp: new Date().toISOString()
      };
      
      await api.post('/contact', submitData);
      setSuccess(true);
      setFormData({
        firstName: '', lastName: '', email: '', phone: '', subject: '', message: '',
        preferredContact: 'email', urgency: 'normal', serviceType: '', bestTimeToContact: '',
        agreeToTerms: false, allowMarketing: false
      });
      setCurrentStep(1);
      
      toast({ 
        title: 'Message Sent Successfully!', 
        description: "Thank you for contacting us. We'll get back to you within 24 hours." 
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to send message. Please try again.';
      setError(errorMessage);
      toast({ 
        title: 'Error Sending Message', 
        description: errorMessage, 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const nextStep = () => {
    if (currentStep === 1) {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
        toast({ 
          title: 'Please Complete Required Fields', 
          description: 'Please fill in all required fields before proceeding.', 
          variant: 'destructive' 
        });
        return;
      }
    }
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

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
    const emailAddress = 'Mymedspharmacy@outlook.com';
    const subject = 'Inquiry from My Meds Pharmacy Website';
    const body = `Dear My Meds Pharmacy Team,

I hope this email finds you well. I am reaching out regarding:

[Please describe your inquiry, question, or concern here]

Best regards,
[Your Name]

---
Sent from My Meds Pharmacy website
Location: 2242 65th St., Brooklyn, NY 11204
Phone: (347) 312-6458`;

    const mailtoLink = `mailto:${emailAddress}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    const userChoice = confirm(
      `Click OK to open your email client and compose a message to:\n\n${emailAddress}\n\nSubject: ${subject}\n\nIf your email client doesn't open, click Cancel to copy the email address to your clipboard.`
    );
    
    if (userChoice) {
      window.location.href = mailtoLink;
    } else {
      safeClipboard.writeText(emailAddress).then(() => {
        toast({ 
          title: 'Email Copied!', 
          description: `Email address copied to clipboard: ${emailAddress}` 
        });
      }).catch(() => {
        toast({ 
          title: 'Email Address', 
          description: `Please email us at: ${emailAddress}` 
        });
      });
    }
  };

  const handleMapClick = () => {
    window.open('https://maps.app.goo.gl/gXSVqF25sAB7r6m76', '_blank');
  };

  return (
    <section id="contact" className="py-16 sm:py-20 md:py-24 bg-gradient-to-br from-slate-50 via-white to-brand-light/30 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-brand-light/20 to-brand/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-brand-accent/20 to-brand-dark/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Enhanced Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-light to-brand text-white px-6 py-3 rounded-full text-sm font-semibold mb-8 shadow-lg">
            <MessageCircle className="h-5 w-5" />
            Get In Touch
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-8">
            Contact 
            <span className="block bg-gradient-to-r from-brand-light to-brand bg-clip-text text-transparent">
              Our Team
            </span>
          </h2>
          
          <p className="text-xl sm:text-2xl text-gray-600 max-w-4xl mx-auto font-medium leading-relaxed">
            We're here to help with all your pharmaceutical needs. Reach out to us through any of the methods below, 
            and our knowledgeable team will get back to you promptly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Enhanced Contact Information */}
          <div className="space-y-8">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">Contact Information</h3>
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                Visit us in person, call us directly, or send us an email. Our friendly staff is ready to assist you 
                with all your pharmaceutical and health-related questions.
              </p>
            </div>

            <div className="space-y-8">
              {/* Address Card */}
              <Card className="hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-brand-light to-brand rounded-xl flex items-center justify-center flex-shrink-0">
                      <Building2 className="h-6 w-6 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-gray-900 text-lg mb-2">Visit Our Location</h4>
                      <p className="text-gray-600 mb-3">2242 65th St., Brooklyn, NY 11204</p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleMapClick}
                        className="text-brand-light border-brand-light hover:bg-brand-light hover:text-white"
                      >
                        <MapPin className="h-4 w-4 mr-2" />
                        Get Directions
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Phone Card */}
              <Card className="hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-brand-light to-brand rounded-xl flex items-center justify-center flex-shrink-0">
                      <Phone className="h-6 w-6 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-gray-900 text-lg mb-2">Call Us Directly</h4>
                      <p className="text-gray-600 mb-3">(347) 312-6458</p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleCallClick}
                        className="text-brand-light border-brand-light hover:bg-brand-light hover:text-white"
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Call Now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Email Card */}
              <Card className="hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-brand-accent to-brand rounded-xl flex items-center justify-center flex-shrink-0">
                      <Mail className="h-6 w-6 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-gray-900 text-lg mb-2">Send Us an Email</h4>
                      <p className="text-gray-600 mb-3">Mymedspharmacy@outlook.com</p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleEmailClick}
                        className="text-brand-accent border-brand-accent hover:bg-brand-accent hover:text-white"
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Send Email
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

               {/* Hours Card moved to footer */}
               <div className="hidden"></div>
            </div>
          </div>

                     {/* Enhanced Contact Form */}
           <Card className="shadow-2xl border-0 bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm">
             <CardHeader className="pb-4 bg-gradient-to-r from-brand to-brand-light text-white rounded-t-lg">
               <div className="flex items-center justify-between mb-3">
                 <CardTitle className="text-2xl text-white flex items-center gap-2">
                   <MessageCircle className="h-6 w-6" />
                   Send Us a Message
                 </CardTitle>
                 <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                   Step {currentStep} of 3
                 </Badge>
               </div>
               
               {/* Progress Bar */}
               <div className="w-full bg-white/20 rounded-full h-2 mb-3">
                 <div 
                   className="bg-white h-2 rounded-full transition-all duration-500 shadow-sm"
                   style={{ width: `${(currentStep / 3) * 100}%` }}
                 ></div>
               </div>
               
               <p className="text-white/90 text-sm">
                 {currentStep === 1 && "Let's start with your basic information"}
                 {currentStep === 2 && "Tell us about your inquiry"}
                 {currentStep === 3 && "Review and submit your message"}
               </p>
             </CardHeader>
             
             <CardContent className="p-6">
               <form onSubmit={handleSubmit} className="space-y-4">
                                 {/* Step 1: Basic Information */}
                 {currentStep === 1 && (
                   <div className="space-y-4">
                     <div className="grid md:grid-cols-2 gap-4">
                       <div className="space-y-2">
                         <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700">
                           First Name <span className="text-red-500">*</span>
                         </label>
                         <Input
                           id="firstName"
                           name="firstName"
                           type="text"
                           value={formData.firstName}
                           onChange={handleChange}
                           className={`w-full ${formErrors.firstName ? 'border-red-500 focus:border-red-500' : 'focus:border-brand-light'}`}
                           placeholder="Enter your first name"
                         />
                         {formErrors.firstName && (
                           <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                             <AlertCircle className="h-3 w-3" />
                             {formErrors.firstName}
                           </p>
                         )}
                       </div>
                       <div className="space-y-2">
                         <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700">
                           Last Name <span className="text-red-500">*</span>
                         </label>
                         <Input
                           id="lastName"
                           name="lastName"
                           type="text"
                           value={formData.lastName}
                           onChange={handleChange}
                           className={`w-full ${formErrors.lastName ? 'border-red-500 focus:border-red-500' : 'focus:border-brand-light'}`}
                           placeholder="Enter your last name"
                         />
                         {formErrors.lastName && (
                           <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                             <AlertCircle className="h-3 w-3" />
                             {formErrors.lastName}
                           </p>
                         )}
                       </div>
                     </div>

                     <div className="space-y-2">
                       <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                         Email Address <span className="text-red-500">*</span>
                       </label>
                       <Input
                         id="email"
                         name="email"
                         type="email"
                         value={formData.email}
                         onChange={handleChange}
                         className={`w-full ${formErrors.email ? 'border-red-500 focus:border-red-500' : 'focus:border-brand-light'}`}
                         placeholder="your.email@example.com"
                       />
                       {formErrors.email && (
                         <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                           <AlertCircle className="h-3 w-3" />
                           {formErrors.email}
                         </p>
                       )}
                     </div>

                     <div className="space-y-2">
                       <label htmlFor="phone" className="block text-sm font-semibold text-gray-700">
                         Phone Number <span className="text-red-500">*</span>
                       </label>
                       <Input
                         id="phone"
                         name="phone"
                         type="tel"
                         value={formData.phone}
                         onChange={handleChange}
                         className={`w-full ${formErrors.phone ? 'border-red-500 focus:border-red-500' : 'focus:border-brand-light'}`}
                         placeholder="(555) 123-4567"
                       />
                       {formErrors.phone && (
                         <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                           <AlertCircle className="h-3 w-3" />
                           {formErrors.phone}
                         </p>
                       )}
                     </div>

                     <div className="flex justify-end pt-2">
                       <Button 
                         type="button" 
                         onClick={nextStep}
                         className="bg-gradient-to-r from-brand-light to-brand hover:from-brand hover:to-brand-light text-white px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-300"
                       >
                         Next Step
                         <ArrowRight className="h-4 w-4 ml-2" />
                       </Button>
                     </div>
                   </div>
                 )}

                                 {/* Step 2: Inquiry Details */}
                 {currentStep === 2 && (
                   <div className="space-y-4">
                     <div className="space-y-2">
                       <label htmlFor="subject" className="block text-sm font-semibold text-gray-700">
                         Subject <span className="text-red-500">*</span>
                       </label>
                       <Input
                         id="subject"
                         name="subject"
                         type="text"
                         value={formData.subject}
                         onChange={handleChange}
                         className={`w-full ${formErrors.subject ? 'border-red-500 focus:border-red-500' : 'focus:border-brand-light'}`}
                         placeholder="Brief description of your inquiry"
                       />
                       {formErrors.subject && (
                         <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                           <AlertCircle className="h-3 w-3" />
                           {formErrors.subject}
                         </p>
                       )}
                     </div>

                     <div className="grid md:grid-cols-2 gap-4">
                       <div className="space-y-2">
                         <label className="block text-sm font-semibold text-gray-700">
                           Service Type
                         </label>
                         <Select value={formData.serviceType} onValueChange={(value) => handleSelectChange('serviceType', value)}>
                           <SelectTrigger className="focus:border-brand-light">
                             <SelectValue placeholder="Select a service type" />
                           </SelectTrigger>
                           <SelectContent>
                             {serviceTypes.map((service) => (
                               <SelectItem key={service.value} value={service.value}>
                                 <div className="flex items-center gap-2">
                                   <service.icon className="h-4 w-4" />
                                   {service.label}
                                 </div>
                               </SelectItem>
                             ))}
                           </SelectContent>
                         </Select>
                       </div>

                       <div className="space-y-2">
                         <label className="block text-sm font-semibold text-gray-700">
                           Urgency Level
                         </label>
                         <Select value={formData.urgency} onValueChange={(value) => handleSelectChange('urgency', value)}>
                           <SelectTrigger className="focus:border-brand-light">
                             <SelectValue />
                           </SelectTrigger>
                           <SelectContent>
                             {urgencyLevels.map((level) => (
                               <SelectItem key={level.value} value={level.value}>
                                 <div>
                                   <div className="font-medium">{level.label}</div>
                                   <div className="text-sm text-gray-500">{level.description}</div>
                                 </div>
                               </SelectItem>
                             ))}
                           </SelectContent>
                         </Select>
                       </div>
                     </div>

                     <div className="space-y-2">
                       <label htmlFor="message" className="block text-sm font-semibold text-gray-700">
                         Message <span className="text-red-500">*</span>
                       </label>
                       <Textarea
                         id="message"
                         name="message"
                         rows={4}
                         value={formData.message}
                         onChange={handleChange}
                         className={`w-full ${formErrors.message ? 'border-red-500 focus:border-red-500' : 'focus:border-brand-light'}`}
                         placeholder="Please provide detailed information about your inquiry, question, or concern..."
                       />
                       {formErrors.message && (
                         <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                           <AlertCircle className="h-3 w-3" />
                           {formErrors.message}
                         </p>
                       )}
                     </div>

                     <div className="flex justify-between pt-2">
                       <Button 
                         type="button" 
                         variant="outline"
                         onClick={prevStep}
                         className="border-brand-light text-brand-light hover:bg-brand-light hover:text-white px-6 py-2"
                       >
                         Previous
                       </Button>
                       <Button 
                         type="button" 
                         onClick={nextStep}
                         className="bg-gradient-to-r from-brand-light to-brand hover:from-brand hover:to-brand-light text-white px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-300"
                       >
                         Next Step
                         <ArrowRight className="h-4 w-4 ml-2" />
                       </Button>
                     </div>
                   </div>
                 )}

                                 {/* Step 3: Preferences and Submit */}
                 {currentStep === 3 && (
                   <div className="space-y-4">
                     <div className="grid md:grid-cols-2 gap-4">
                       <div className="space-y-2">
                         <label className="block text-sm font-semibold text-gray-700">
                           Preferred Contact Method
                         </label>
                         <Select value={formData.preferredContact} onValueChange={(value) => handleSelectChange('preferredContact', value)}>
                           <SelectTrigger className="focus:border-brand-light">
                             <SelectValue />
                           </SelectTrigger>
                           <SelectContent>
                             {contactMethods.map((method) => (
                               <SelectItem key={method.value} value={method.value}>
                                 <div className="flex items-center gap-2">
                                   <method.icon className="h-4 w-4" />
                                   {method.label}
                                 </div>
                               </SelectItem>
                             ))}
                           </SelectContent>
                         </Select>
                       </div>

                       <div className="space-y-2">
                         <label className="block text-sm font-semibold text-gray-700">
                           Best Time to Contact
                         </label>
                         <Select value={formData.bestTimeToContact} onValueChange={(value) => handleSelectChange('bestTimeToContact', value)}>
                           <SelectTrigger className="focus:border-brand-light">
                             <SelectValue placeholder="Select preferred time" />
                           </SelectTrigger>
                           <SelectContent>
                             {timeSlots.map((time) => (
                               <SelectItem key={time} value={time}>
                                 {time}
                               </SelectItem>
                             ))}
                           </SelectContent>
                         </Select>
                       </div>
                     </div>

                     <div className="space-y-3 bg-gray-50/50 rounded-lg p-4">
                       <div className="flex items-start space-x-3">
                         <Checkbox
                           id="agreeToTerms"
                           checked={formData.agreeToTerms}
                           onCheckedChange={(checked) => handleCheckboxChange('agreeToTerms', checked as boolean)}
                           className="mt-1"
                         />
                         <div className="grid gap-1 leading-none">
                           <label
                             htmlFor="agreeToTerms"
                             className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                           >
                             I agree to the terms and conditions <span className="text-red-500">*</span>
                           </label>
                           <p className="text-xs text-gray-500">
                             By submitting this form, you agree to our privacy policy and terms of service.
                           </p>
                         </div>
                       </div>
                       {formErrors.agreeToTerms && (
                         <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                           <AlertCircle className="h-3 w-3" />
                           {formErrors.agreeToTerms}
                         </p>
                       )}

                       <div className="flex items-start space-x-3">
                         <Checkbox
                           id="allowMarketing"
                           checked={formData.allowMarketing}
                           onCheckedChange={(checked) => handleCheckboxChange('allowMarketing', checked as boolean)}
                           className="mt-1"
                         />
                         <div className="grid gap-1 leading-none">
                           <label
                             htmlFor="allowMarketing"
                             className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                           >
                             Receive updates and newsletters
                           </label>
                           <p className="text-xs text-gray-500">
                             Stay informed about health tips, pharmacy services, and special offers.
                           </p>
                         </div>
                       </div>
                     </div>

                     <div className="flex justify-between pt-2">
                       <Button 
                         type="button" 
                         variant="outline"
                         onClick={prevStep}
                         className="border-brand-light text-brand-light hover:bg-brand-light hover:text-white px-6 py-2"
                       >
                         Previous
                       </Button>
                       <Button 
                         type="submit" 
                         disabled={loading}
                         className="bg-gradient-to-r from-brand-light to-brand hover:from-brand hover:to-brand-light text-white px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-300"
                       >
                         {loading ? (
                           <>
                             <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                             Sending...
                           </>
                         ) : (
                           <>
                             <Send className="h-4 w-4 mr-2" />
                             Send Message
                           </>
                         )}
                       </Button>
                     </div>
                   </div>
                 )}

                                 {error && (
                   <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                     <div className="flex items-center">
                       <AlertCircle className="h-4 w-4 text-red-500 mr-2 flex-shrink-0" />
                       <p className="text-red-700 text-sm">{error}</p>
                     </div>
                   </div>
                 )}

                 {success && (
                   <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                     <div className="flex items-center">
                       <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                       <p className="text-green-700 text-sm">Message sent successfully! We'll get back to you soon.</p>
                     </div>
                   </div>
                 )}
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Map Section */}
        <div className="mb-16">
          <Card className="overflow-hidden shadow-2xl border-0">
            <CardHeader className="bg-gradient-to-r from-brand to-brand-light text-white">
              <CardTitle className="text-2xl flex items-center">
                <MapPin className="h-6 w-6 mr-3" />
                Visit Our Location
              </CardTitle>
              <p className="text-white/90">Conveniently located in Brooklyn, NY</p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="w-full h-96 bg-muted relative">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3029.9649649649647!2d-73.984963684593!3d40.6139649793416!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c244e6f6a7a6a7%3A0x5b5b5b5b5b5b5b5b!2s2242%2065th%20St%2C%20Brooklyn%2C%20NY%2011204%2C%20USA!5e0!3m2!1sen!2sus!4v1718040000000!5m2!1sen!2sus"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="My Meds Pharmacy Location"
                  className="absolute inset-0"
                ></iframe>
                <div className="absolute top-4 left-4 bg-white rounded-xl shadow-lg p-4 max-w-xs">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-brand-light to-brand text-white rounded-full flex items-center justify-center font-bold text-sm">
                      MM
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">My Meds Pharmacy</p>
                      <p className="text-sm text-gray-600">2242 65th St., Brooklyn, NY</p>
                      <p className="text-xs text-gray-500">Open Mon-Sat</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Quick Actions */}
        <div className="text-center">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">Quick Actions</h3>
          <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
            Need immediate assistance? Use these quick contact methods for faster response times.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 bg-white/80 backdrop-blur-sm h-full flex flex-col">
              <CardContent className="p-8 text-center flex flex-col h-full">
                <div className="w-16 h-16 bg-gradient-to-r from-brand-light to-brand rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Phone className="h-8 w-8 text-white" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-3">Call Us Now</h4>
                <p className="text-gray-600 mb-6 flex-grow">Speak directly with our pharmacy team for immediate assistance</p>
                <Button 
                  className="w-full bg-brand-light hover:bg-brand text-white text-lg py-3 mt-auto"
                  onClick={handleCallClick}
                >
                  <Phone className="h-5 w-5 mr-2" />
                  Call (347) 312-6458
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 bg-white/80 backdrop-blur-sm h-full flex flex-col">
              <CardContent className="p-8 text-center flex flex-col h-full">
                <div className="w-16 h-16 bg-gradient-to-r from-brand-accent to-brand rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Mail className="h-8 w-8 text-white" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-3">Email Us</h4>
                <p className="text-gray-600 mb-6 flex-grow">Send us your questions or concerns via email</p>
                <Button 
                  className="w-full bg-brand-accent hover:bg-brand text-white text-lg py-3 mt-auto"
                  onClick={handleEmailClick}
                >
                  <Mail className="h-5 w-5 mr-2" />
                  Send Email
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 bg-white/80 backdrop-blur-sm h-full flex flex-col">
              <CardContent className="p-8 text-center flex flex-col h-full">
                <div className="w-16 h-16 bg-gradient-to-r from-brand to-brand-dark rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <MapPin className="h-8 w-8 text-white" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-3">Get Directions</h4>
                <p className="text-gray-600 mb-6 flex-grow">Navigate to our convenient Brooklyn location</p>
                <Button 
                  className="w-full bg-brand hover:bg-brand-dark text-white text-lg py-3 mt-auto"
                  onClick={handleMapClick}
                >
                  <MapPin className="h-5 w-5 mr-2" />
                  Get Directions
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};