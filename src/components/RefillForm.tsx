import { useState } from "react";
import { X, Pill, Calendar, User, Phone, Mail, FileText, Upload, CheckCircle, AlertCircle, Info, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { HIPAAFormBanner } from "@/components/HIPAACompliance";
import api from '../lib/api';

interface RefillFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RefillForm = ({ isOpen, onClose }: RefillFormProps) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    prescriptionNumber: '',
    medication: '',
    pharmacy: '',
    notes: ''
  });
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [dragActive, setDragActive] = useState(false);

  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const steps = [
    { id: 1, title: 'Patient Info', icon: User },
    { id: 2, title: 'Prescription', icon: Pill },
    { id: 3, title: 'Upload & Submit', icon: Upload }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prescriptionFile) {
      setError('Please upload your prescription file');
      toast({ title: 'Error', description: 'Please upload your prescription file', variant: 'destructive' });
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('file', prescriptionFile);
      
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });
      
      await api.post('/prescriptions/refill', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setSuccess(true);
      setFormData({
        firstName: '', lastName: '', phone: '', email: '', prescriptionNumber: '', medication: '', pharmacy: '', notes: ''
      });
      setPrescriptionFile(null);
      toast({ title: 'Refill Request Submitted!', description: "We'll process your prescription refill and contact you when it's ready." });
      onClose();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit refill request';
      setError(errorMessage);
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPrescriptionFile(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setPrescriptionFile(e.dataTransfer.files[0]);
    }
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-300">
              <div className="bg-[#D5C6BC] rounded-2xl max-w-full sm:max-w-2xl w-full max-h-screen overflow-y-auto shadow-2xl animate-in slide-in-from-bottom-4 duration-300 scale-in-95">
        <Card className="border-0 shadow-none">
          {/* Enhanced Header */}
          <CardHeader className="relative rounded-t-2xl bg-gradient-to-r from-[#376f6b] to-[#57bbb6] text-white p-6">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white hover:text-white/70 p-2 rounded-lg hover:bg-white/10 transition-colors duration-300"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Pill className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">Prescription Refill Request</CardTitle>
                <p className="text-white/90 text-sm">Quick and easy prescription refill process</p>
              </div>
            </div>

            {/* Interactive Progress Steps */}
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const IconComponent = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                
                return (
                  <div key={step.id} className="flex items-center group cursor-pointer" onClick={() => currentStep > step.id && setCurrentStep(step.id)}>
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-500 transform hover:scale-110 ${
                      isActive ? 'bg-white text-[#376f6b] shadow-lg scale-110' : 
                      isCompleted ? 'bg-white/20 text-white hover:bg-white/30 hover:shadow-md' : 'bg-white/10 text-white/60 hover:bg-white/20'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5 animate-pulse" />
                      ) : (
                        <IconComponent className={`h-5 w-5 transition-transform duration-300 ${isActive ? 'animate-bounce' : 'group-hover:scale-110'}`} />
                      )}
                    </div>
                    <span className={`ml-2 text-sm font-medium transition-colors duration-300 ${
                      isActive ? 'text-white' : 'text-white/70 group-hover:text-white'
                    }`}>
                      {step.title}
                    </span>
                    {index < steps.length - 1 && (
                      <div className={`w-8 h-0.5 mx-2 transition-all duration-500 ${
                        isCompleted ? 'bg-white' : 'bg-white/30'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </CardHeader>

                  <CardContent className="p-6">
          <HIPAAFormBanner />
          <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1: Patient Information */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-2 mb-4">
                                         <User className="h-5 w-5 text-[#376F6B]" />
                     <h3 className="text-lg font-semibold text-gray-900">Patient Information</h3>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        First Name *
                      </label>
                      <div className="relative group">
                        <Input
                          name="firstName"
                          type="text"
                          required
                          value={formData.firstName}
                          onChange={handleChange}
                          placeholder="Enter your first name"
                                                     className="pl-10 border-gray-200 focus:border-[#376F6B] focus:ring-[#376F6B] transition-all duration-300 group-hover:border-[#376F6B]/50 group-hover:shadow-md"
                        />
                                                 <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-hover:text-[#376F6B] transition-colors duration-300" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Last Name *
                      </label>
                      <div className="relative">
                                                 <Input
                           name="lastName"
                           type="text"
                           required
                           value={formData.lastName}
                           onChange={handleChange}
                           placeholder="Enter your last name"
                           className="pl-10 border-gray-200 focus:border-[#376F6B] focus:ring-[#376F6B]"
                         />
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Phone Number *
                      </label>
                      <div className="relative">
                                                 <Input
                           name="phone"
                           type="tel"
                           required
                           value={formData.phone}
                           onChange={handleChange}
                           placeholder="(347) 312-6458"
                           className="pl-10 border-gray-200 focus:border-[#376F6B] focus:ring-[#376F6B]"
                         />
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Email Address
                      </label>
                      <div className="relative">
                                                 <Input
                           name="email"
                           type="email"
                           value={formData.email}
                           onChange={handleChange}
                           placeholder="your@email.com"
                           className="pl-10 border-gray-200 focus:ring-[#376F6B]"
                         />
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      type="button" 
                      onClick={nextStep}
                                             className="bg-[#376F6B] hover:bg-[#2A5A56] hover:shadow-lg text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
                    >
                      Next Step
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Prescription Information */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-2 mb-4">
                                         <Pill className="h-5 w-5 text-[#376F6B]" />
                     <h3 className="text-lg font-semibold text-gray-900">Prescription Information</h3>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Prescription Number *
                      </label>
                      <div className="relative">
                        <Input
                          name="prescriptionNumber"
                          type="text"
                          required
                          value={formData.prescriptionNumber}
                          onChange={handleChange}
                          placeholder="Rx# (required)"
                          className="pl-10 border-gray-200 focus:border-[#57bbb6] focus:ring-[#57bbb6]"
                        />
                        <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Medication Name *
                      </label>
                      <div className="relative">
                        <Input
                          name="medication"
                          type="text"
                          required
                          value={formData.medication}
                          onChange={handleChange}
                          placeholder="Name of medication"
                          className="pl-10 border-gray-200 focus:border-[#57bbb6] focus:ring-[#57bbb6]"
                        />
                        <Pill className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Current Pharmacy
                    </label>
                    <Input
                      name="pharmacy"
                      type="text"
                      value={formData.pharmacy}
                      onChange={handleChange}
                      placeholder="Name of current pharmacy"
                      className="border-gray-200 focus:border-[#57bbb6] focus:ring-[#57bbb6]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Additional Notes (Optional)
                    </label>
                    <Textarea
                      name="notes"
                      rows={3}
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="Any special instructions, questions, or additional information..."
                      className="border-gray-200 focus:border-[#57bbb6] focus:ring-[#57bbb6]"
                    />
                  </div>

                  <div className="flex justify-between">
                    <Button 
                      type="button" 
                      onClick={prevStep}
                      variant="outline"
                                             className="border-gray-200 hover:border-[#376F6B] hover:text-[#376F6B] transition-all duration-300 transform hover:scale-105 hover:shadow-md"
                    >
                      Previous
                    </Button>
                    <Button 
                      type="button" 
                      onClick={nextStep}
                                             className="bg-[#376F6B] hover:bg-[#2A5A56] hover:shadow-lg text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl group"
                    >
                      Next Step
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Upload & Submit */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-2 mb-4">
                                         <Upload className="h-5 w-5 text-[#376F6B]" />
                     <h3 className="text-lg font-semibold text-gray-900">Upload Prescription & Submit</h3>
                  </div>

                  {/* File Upload Area */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Upload Prescription *
                    </label>
                    <div
                      className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-500 transform hover:scale-[1.02] ${
                                                 dragActive 
                           ? 'border-[#376F6B] bg-[#376F6B]/5 scale-105 shadow-lg' 
                           : prescriptionFile 
                             ? 'border-green-500 bg-green-50 shadow-md' 
                             : 'border-gray-300 hover:border-[#376F6B] hover:bg-gray-50 hover:shadow-md'
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                                               <Upload className={`h-12 w-12 mx-auto mb-4 transition-all duration-300 ${
                           prescriptionFile ? 'text-green-500 animate-bounce' : 'text-gray-400 group-hover:text-[#376F6B]'
                         }`} />
                      
                      {prescriptionFile ? (
                        <div className="space-y-2">
                          <p className="text-green-600 font-medium">File uploaded successfully!</p>
                          <p className="text-sm text-gray-600">{prescriptionFile.name}</p>
                          <p className="text-xs text-gray-500">
                            Size: {(prescriptionFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-gray-600">
                            Drag and drop your prescription here, or{' '}
                                                         <label htmlFor="prescriptionFile" className="text-[#376F6B] hover:text-[#2A5A56] cursor-pointer font-medium">
                               browse files
                             </label>
                          </p>
                          <p className="text-xs text-gray-500">
                            Supports: JPG, PNG, PDF (Max 10MB)
                          </p>
                        </div>
                      )}
                      
                      <input
                        id="prescriptionFile"
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {/* Error Display */}
                  {error && (
                    <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  )}

                  {/* Success Display */}
                  {success && (
                    <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg animate-in slide-in-from-top-2 duration-500">
                      <CheckCircle className="h-5 w-5 text-green-500 animate-bounce" />
                      <p className="text-green-700 text-sm font-medium">Refill request sent successfully!</p>
                    </div>
                  )}

                  {/* Info Box */}
                  <div className="flex items-start space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div className="text-sm text-blue-700">
                      <p className="font-medium">What happens next?</p>
                      <p>We'll review your prescription and contact you within 24 hours to confirm your refill request.</p>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button 
                      type="button" 
                      onClick={prevStep}
                      variant="outline"
                                             className="border-gray-200 hover:border-[#376F6B] hover:text-[#376F6B]"
                    >
                      Previous
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={loading || !prescriptionFile}
                                             className="bg-[#376F6B] hover:bg-[#2A5A56] hover:shadow-lg text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:transform-none group"
                    >
                      {loading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          <span className="animate-pulse">Submitting...</span>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <span>Submit Refill Request</span>
                          <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                        </div>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};