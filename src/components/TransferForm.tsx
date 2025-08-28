import { useState } from "react";
import { X, Pill, Building2, ArrowRight, User, Phone, Mail, Calendar, FileText, Upload, CheckCircle, AlertCircle, Info, Shield, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import api from '../lib/api';

interface TransferFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TransferForm = ({ isOpen, onClose }: TransferFormProps) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    phone: '',
    email: '',
    currentPharmacy: '',
    currentPharmacyPhone: '',
    currentPharmacyAddress: '',
    medication: '',
    prescriptionNumber: '',
    prescribingDoctor: '',
    insuranceProvider: '',
    insuranceMemberID: '',
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
    { id: 1, title: 'Patient Info (Required)', icon: User },
    { id: 2, title: 'Current Pharmacy (Optional)', icon: Building2 },
    { id: 3, title: 'Prescription (Required) & Upload (Optional)', icon: Pill },
    { id: 4, title: 'Insurance (Optional) & Submit', icon: Shield }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      const formDataToSend = new FormData();
      
      // Only append file if it exists
      if (prescriptionFile) {
        formDataToSend.append('file', prescriptionFile);
      }
      
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });
      
      await api.post('/prescriptions/transfer', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setSuccess(true);
      setFormData({
        firstName: '', lastName: '', dateOfBirth: '', phone: '', email: '', currentPharmacy: '', currentPharmacyPhone: '', currentPharmacyAddress: '', medication: '', prescriptionNumber: '', prescribingDoctor: '', insuranceProvider: '', insuranceMemberID: '', notes: ''
      });
      setPrescriptionFile(null);
      toast({ title: 'Transfer Request Submitted!', description: "We'll process your prescription transfer request within 24 hours and notify you when it's ready." });
      onClose();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit transfer request';
      setError(errorMessage);
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-300">
              <div className="bg-[#D5C6BC] rounded-2xl max-w-full sm:max-w-4xl w-full max-h-screen overflow-y-auto shadow-2xl animate-in slide-in-from-bottom-4 duration-300 scale-in-95">
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
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">Transfer Prescription</CardTitle>
                <p className="text-white/90 text-sm">Seamlessly transfer your prescriptions to My Meds Pharmacy</p>
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
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-500 transform hover:scale-110 ${
                      isActive ? 'bg-white text-[#376f6b] shadow-lg scale-110' : 
                      isCompleted ? 'bg-white/20 text-white hover:bg-white/30 hover:shadow-md' : 'bg-white/10 text-white/60 hover:bg-white/20'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="h-4 w-4 animate-pulse" />
                      ) : (
                        <IconComponent className={`h-4 w-4 transition-transform duration-300 ${isActive ? 'animate-bounce' : 'group-hover:scale-110'}`} />
                      )}
                    </div>
                    <span className={`ml-2 text-xs font-medium transition-colors duration-300 ${
                      isActive ? 'text-white' : 'text-white/70 group-hover:text-white'
                    }`}>
                      {step.title}
                    </span>
                    {index < steps.length - 1 && (
                      <div className={`w-6 h-0.5 mx-2 transition-all duration-500 ${
                        isCompleted ? 'bg-white' : 'bg-white/30'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {/* Interactive Transfer Flow Visualization */}
            <div className="mb-8 flex items-center justify-center">
              <div className="flex items-center space-x-4 text-center">
                <div className="flex flex-col items-center group">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center transition-all duration-300 group-hover:bg-gray-200 group-hover:scale-110">
                    <Building2 className="h-6 w-6 text-gray-600 group-hover:text-gray-700 transition-colors duration-300" />
                  </div>
                  <span className="text-sm text-gray-600 mt-2 group-hover:text-gray-700 transition-colors duration-300">Current Pharmacy</span>
                </div>
                                 <ArrowRight className="h-6 w-6 text-[#376F6B] animate-pulse" />
                <div className="flex flex-col items-center group">
                                     <div className="w-12 h-12 bg-[#376F6B] rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg">
                     <div className="text-white font-bold text-sm">MM</div>
                   </div>
                   <span className="text-sm text-[#376F6B] mt-2 font-medium group-hover:text-[#2A5A56] transition-colors duration-300">My Meds Pharmacy</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Required Fields Summary */}
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <p className="font-medium text-green-800">Required Fields</p>
                </div>
                <p className="text-sm text-green-700">
                  Only <strong>First Name</strong>, <strong>Last Name</strong>, <strong>Phone</strong>, and <strong>Medication</strong> are required. 
                  All other fields are optional and can be filled in if you have the information available.
                </p>
              </div>
              
              {/* Step 1: Patient Information */}
              {currentStep === 1 && (
                <div className="space-y-6">
                                    <div className="flex items-center space-x-2 mb-4">
                    <User className="h-5 w-5 text-[#376F6B]" />
                    <h3 className="text-lg font-semibold text-gray-900">Patient Information (Required)</h3>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        First Name *
                      </label>
                      <div className="relative">
                                                 <Input
                           name="firstName"
                           type="text"
                           required
                           value={formData.firstName}
                           onChange={handleChange}
                           placeholder="Enter your first name"
                           className="pl-10 border-gray-200 focus:border-[#376F6B] focus:ring-[#376F6B]"
                         />
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
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
                        Date of Birth *
                      </label>
                      <div className="relative">
                                                 <Input
                           name="dateOfBirth"
                           type="date"
                           required
                           value={formData.dateOfBirth}
                           onChange={handleChange}
                           className="pl-10 border-gray-200 focus:border-[#376F6B] focus:ring-[#376F6B]"
                         />
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      </div>
                    </div>
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
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Email Address (Optional)
                    </label>
                    <div className="relative">
                                             <Input
                         name="email"
                         type="email"
                         value={formData.email}
                         onChange={handleChange}
                         placeholder="your@email.com"
                         className="pl-10 border-gray-200 focus:border-[#376F6B] focus:ring-[#376F6B]"
                       />
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
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

              {/* Step 2: Current Pharmacy Information */}
              {currentStep === 2 && (
                <div className="space-y-6">
                                    <div className="flex items-center space-x-2 mb-4">
                    <Building2 className="h-5 w-5 text-[#376F6B]" />
                    <h3 className="text-lg font-semibold text-gray-900">Current Pharmacy Information</h3>
                  </div>
                  
                  <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-700">
                      <Info className="h-4 w-4 inline mr-2" />
                      Pharmacy details are optional. If you don't have this information, we can still process your transfer request.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Pharmacy Name (Optional)
                      </label>
                      <div className="relative">
                        <Input
                          name="currentPharmacy"
                          type="text"
                          value={formData.currentPharmacy}
                          onChange={handleChange}
                          placeholder="Name of current pharmacy (optional)"
                          className="pl-10 border-gray-200 focus:border-[#376F6B] focus:ring-[#376F6B]"
                        />
                        <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Pharmacy Phone (Optional)
                      </label>
                      <div className="relative">
                        <Input
                          name="currentPharmacyPhone"
                          type="tel"
                          value={formData.currentPharmacyPhone}
                          onChange={handleChange}
                          placeholder="Pharmacy phone number (optional)"
                          className="pl-10 border-gray-200 focus:border-[#376F6B] focus:ring-[#376F6B]"
                        />
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Pharmacy Address (Optional)
                    </label>
                    <Input
                      name="currentPharmacyAddress"
                      type="text"
                      value={formData.currentPharmacyAddress}
                      onChange={handleChange}
                      placeholder="Full address of current pharmacy (optional)"
                      className="border-gray-200 focus:border-[#376F6B] focus:ring-[#376F6B]"
                    />
                  </div>

                  <div className="flex justify-between">
                    <Button 
                      type="button" 
                      onClick={prevStep}
                      variant="outline"
                      className="border-white hover:border-[#57bbb6] hover:text-[#57bbb6]"
                    >
                      Previous
                    </Button>
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

              {/* Step 3: Prescription Information */}
              {currentStep === 3 && (
                <div className="space-y-6">
                                    <div className="flex items-center space-x-2 mb-4">
                    <Pill className="h-5 w-5 text-[#376F6B]" />
                    <h3 className="text-lg font-semibold text-gray-900">Prescription Information (Required) & Upload (Optional)</h3>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
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
                           placeholder="e.g., Lisinopril 10mg"
                           className="pl-10 border-gray-200 focus:border-[#376F6B] focus:ring-[#376F6B]"
                         />
                        <Pill className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                                        <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Prescription Number (Optional)
                      </label>
                      <div className="relative">
                        <Input
                          name="prescriptionNumber"
                          type="text"
                          value={formData.prescriptionNumber}
                          onChange={handleChange}
                          placeholder="Rx# (if available)"
                          className="pl-10 border-gray-200 focus:border-[#376F6B] focus:ring-[#376F6B]"
                        />
                        <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Prescribing Doctor *
                    </label>
                                         <Input
                       name="prescribingDoctor"
                       type="text"
                       required
                       value={formData.prescribingDoctor}
                       onChange={handleChange}
                       placeholder="Doctor's name"
                       className="border-gray-200 focus:border-[#376F6B] focus:ring-[#376F6B]"
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
                      placeholder="Any specific instructions, multiple medications to transfer, or additional information..."
                      className="border-gray-200 focus:border-[#376F6B] focus:ring-[#376F6B]"
                    />
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

              {/* Step 4: Insurance & Submit */}
              {currentStep === 4 && (
                <div className="space-y-6">
                                    <div className="flex items-center space-x-2 mb-4">
                    <Shield className="h-5 w-5 text-[#376F6B]" />
                    <h3 className="text-lg font-semibold text-gray-900">Insurance (Optional) & Submit</h3>
                  </div>
                  
                  <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-700">
                      <Info className="h-4 w-4 inline mr-2" />
                      Insurance information is optional. We can still process your transfer request without it.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Insurance Provider (Optional)
                      </label>
                      <div className="relative">
                        <Input
                          name="insuranceProvider"
                          type="text"
                          value={formData.insuranceProvider}
                          onChange={handleChange}
                          placeholder="e.g., Blue Cross Blue Shield"
                          className="pl-10 border-gray-200 focus:border-[#376F6B] focus:ring-[#376F6B]"
                        />
                        <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Member ID (Optional)
                      </label>
                      <Input
                        name="insuranceMemberID"
                        type="text"
                        value={formData.insuranceMemberID}
                        onChange={handleChange}
                        placeholder="Insurance member ID"
                        className="border-gray-200 focus:border-[#376F6B] focus:ring-[#376F6B]"
                      />
                    </div>
                  </div>

                                    {/* File Upload Area */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Upload Prescription (Optional)
                    </label>
                    
                    <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-sm text-amber-700">
                        <Info className="h-4 w-4 inline mr-2" />
                        Prescription upload is optional. If you don't have a digital copy, we can still process your transfer request.
                      </p>
                    </div>
                    <div
                      className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                        dragActive 
                          ? 'border-[#376F6B] bg-[#376F6B]/5' 
                          : prescriptionFile 
                            ? 'border-green-500 bg-green-50' 
                            : 'border-gray-300 hover:border-[#376F6B] hover:bg-gray-50'
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <Upload className={`h-12 w-12 mx-auto mb-4 ${
                        prescriptionFile ? 'text-green-500' : 'text-gray-400'
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
                            Supports: JPG, PNG, PDF (Max 10MB) - Optional
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
                    <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <p className="text-green-700 text-sm">Transfer request sent successfully!</p>
                    </div>
                  )}

                  {/* Info Box */}
                  <div className="flex items-start space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div className="text-sm text-blue-700">
                      <p className="font-medium">What happens next?</p>
                      <p>We will process your prescription transfer request with the information you provide. If you included pharmacy details, we'll contact them directly. If you uploaded a prescription, we'll use that for reference. You will be notified once the transfer is complete and your medication is ready for pickup or delivery.</p>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button 
                      type="button" 
                      onClick={prevStep}
                      variant="outline"
                      className="border-white hover:border-[#57bbb6] hover:text-[#57bbb6]"
                    >
                      Previous
                    </Button>
                                        <Button 
                      type="submit" 
                      disabled={loading}
                      className="bg-[#376F6B] hover:bg-[#2A5A56] hover:shadow-lg text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
                    >
                      {loading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Submitting...
                        </div>
                      ) : (
                        'Submit Transfer Request'
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