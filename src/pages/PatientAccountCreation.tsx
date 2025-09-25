import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Shield, 
  FileText, 
  Camera, 
  Upload, 
  CheckCircle, 
  AlertTriangle, 
  Lock,
  Eye,
  EyeOff,
  Phone,
  Mail,
  Calendar,
  MapPin,
  CreditCard,
  FileCheck,
  Fingerprint,
  Camera as CameraIcon,
  UploadCloud,
  AlertCircle,
  Info
} from 'lucide-react';
import { HIPAAFormBanner } from '@/components/HIPAACompliance';
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import api from '@/lib/api';

interface AccountCreationData {
  // Personal Information
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  ssn: string;
  
  // Address Information
  address: string;
  city: string;
  state: string;
  zipCode: string;
  
  // Emergency Contact
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
  
  // Insurance Information
  insuranceProvider: string;
  insuranceGroupNumber: string;
  insuranceMemberId: string;
  
  // Medical Information
  primaryCarePhysician: string;
  physicianPhone: string;
  allergies: string;
  currentMedications: string;
  medicalConditions: string;
  
  // Legal Documentation
  governmentIdType: string;
  governmentIdNumber: string;
  governmentIdFile: File | null;
  proofOfAddressFile: File | null;
  insuranceCardFile: File | null;
  
  // Verification
  identityVerified: boolean;
  addressVerified: boolean;
  insuranceVerified: boolean;
  
  // Legal Agreements
  termsAccepted: boolean;
  privacyPolicyAccepted: boolean;
  hipaaConsent: boolean;
  medicalAuthorization: boolean;
  financialResponsibility: boolean;
  
  // Security
  password: string;
  confirmPassword: string;
  securityQuestions: {
    question1: string;
    answer1: string;
    question2: string;
    answer2: string;
    question3: string;
    answer3: string;
  };
}

export default function PatientAccountCreation() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  
  // Helper function to render the current step icon
  const renderStepIcon = () => {
    const IconComponent = steps[currentStep - 1].icon;
    return <IconComponent className="h-6 w-6" />;
  };
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState<AccountCreationData>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    email: '',
    phone: '',
    ssn: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
    insuranceProvider: '',
    insuranceGroupNumber: '',
    insuranceMemberId: '',
    primaryCarePhysician: '',
    physicianPhone: '',
    allergies: '',
    currentMedications: '',
    medicalConditions: '',
    governmentIdType: '',
    governmentIdNumber: '',
    governmentIdFile: null,
    proofOfAddressFile: null,
    insuranceCardFile: null,
    identityVerified: false,
    addressVerified: false,
    insuranceVerified: false,
    termsAccepted: false,
    privacyPolicyAccepted: false,
    hipaaConsent: false,
    medicalAuthorization: false,
    financialResponsibility: false,
    password: '',
    confirmPassword: '',
    securityQuestions: {
      question1: '',
      answer1: '',
      question2: '',
      answer2: '',
      question3: '',
      answer3: ''
    }
  });

  const securityQuestions = [
    "What was the name of your first pet?",
    "In what city were you born?",
    "What was your mother's maiden name?",
    "What was the name of your first school?",
    "What was your favorite food as a child?",
    "What was the make of your first car?",
    "What was the name of the street you grew up on?",
    "What was your favorite subject in school?"
  ];

  const updateFormData = (field: keyof AccountCreationData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateSecurityQuestion = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      securityQuestions: { ...prev.securityQuestions, [field]: value }
    }));
  };

  const handleFileUpload = (field: keyof AccountCreationData, file: File) => {
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      alert('File size must be less than 10MB');
      return;
    }
    updateFormData(field, file);
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return Boolean(formData.firstName) && Boolean(formData.lastName) && Boolean(formData.dateOfBirth) && 
               Boolean(formData.email) && Boolean(formData.phone) && Boolean(formData.ssn);
      case 2:
        return Boolean(formData.address) && Boolean(formData.city) && Boolean(formData.state) && Boolean(formData.zipCode) &&
               Boolean(formData.emergencyContactName) && Boolean(formData.emergencyContactPhone) && 
               Boolean(formData.emergencyContactRelationship);
      case 3:
        return Boolean(formData.insuranceProvider) && Boolean(formData.insuranceGroupNumber) && 
               Boolean(formData.insuranceMemberId);
      case 4:
        return Boolean(formData.primaryCarePhysician) && Boolean(formData.physicianPhone);
      case 5:
        return Boolean(formData.governmentIdType) && Boolean(formData.governmentIdNumber) && 
               Boolean(formData.governmentIdFile) && Boolean(formData.proofOfAddressFile) && 
               Boolean(formData.insuranceCardFile);
      case 6:
        return Boolean(formData.password) && Boolean(formData.confirmPassword) && 
               formData.password === formData.confirmPassword &&
               Boolean(formData.securityQuestions.question1) && Boolean(formData.securityQuestions.answer1) &&
               Boolean(formData.securityQuestions.question2) && Boolean(formData.securityQuestions.answer2) &&
               Boolean(formData.securityQuestions.question3) && Boolean(formData.securityQuestions.answer3) &&
               formData.termsAccepted && formData.privacyPolicyAccepted && 
               formData.hipaaConsent && formData.medicalAuthorization && 
               formData.financialResponsibility;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
      return;
    }

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      
      // Append all form data
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'securityQuestions') {
          formDataToSend.append(key, JSON.stringify(value));
        } else if (value instanceof File) {
          formDataToSend.append(key, value);
        } else if (typeof value === 'boolean') {
          formDataToSend.append(key, value.toString());
        } else {
          formDataToSend.append(key, value);
        }
      });

      const response = await api.post('/patient/account-creation', formDataToSend);
      
      if (response.status === 200) {
        alert('Account creation request submitted successfully! Our team will review your information within 24-48 hours.');
        navigate('/patient-portal');
      }
    } catch (error) {
      console.error('Error creating account:', error);
      alert('There was an error creating your account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { title: 'Personal Information', icon: User },
    { title: 'Address & Emergency Contact', icon: MapPin },
    { title: 'Insurance Information', icon: CreditCard },
    { title: 'Medical Information', icon: FileText },
    { title: 'Documentation', icon: FileCheck },
    { title: 'Security & Agreements', icon: Shield }
  ];

  return (
    <>
      <SEOHead 
        title="Create Patient Account - My Meds Pharmacy | Patient Portal"
        description="Create your patient account at My Meds Pharmacy. Access prescription management, health records, and personalized care services."
        keywords="patient account creation, pharmacy patient portal, patient account, prescription management, health records, patient portal signup"
      />
      <div className="min-h-screen bg-[#D5C6BC]">
        <Header 
          onRefillClick={() => navigate('/', { state: { openRefillForm: true } })}
          onAppointmentClick={() => navigate('/', { state: { openAppointmentForm: true } })}
          onTransferClick={() => navigate('/', { state: { openTransferForm: true } })}
        />
      
      <div className="pt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-[#57BBB6] text-white px-6 py-3 rounded-full text-sm font-semibold mb-6 shadow-lg">
                <User className="h-5 w-5" />
                Patient Account Creation
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#376F6B] mb-4">
                Create Your Patient Account
              </h1>
              
              <p className="text-lg sm:text-xl text-[#376F6B] max-w-3xl mx-auto">
                Join our pharmacy family and get access to personalized care, prescription management, 
                and exclusive health services. Your information is protected and secure.
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                {steps.map((step, index) => (
                  <div key={index} className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                      index + 1 <= currentStep 
                        ? 'bg-[#57BBB6] text-white' 
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {index + 1 < currentStep ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <step.icon className="h-5 w-5" />
                      )}
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-16 h-1 mx-2 ${
                        index + 1 < currentStep ? 'bg-[#57BBB6]' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
              
              <Progress value={(currentStep / steps.length) * 100} className="h-2" />
              <p className="text-center text-sm text-gray-600 mt-2">
                Step {currentStep} of {steps.length}: {steps[currentStep - 1].title}
              </p>
            </div>

            {/* HIPAA Banner */}
            <div className="mb-8">
              <HIPAAFormBanner />
            </div>

            {/* Main Form */}
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-[#376F6B] flex items-center gap-3">
                  {renderStepIcon()}
                  {steps[currentStep - 1].title}
                </CardTitle>
                <CardDescription>
                  {currentStep === 1 && "Please provide your basic personal information to get started."}
                  {currentStep === 2 && "Tell us where you live and who to contact in case of emergency."}
                  {currentStep === 3 && "Help us work with your insurance provider for the best coverage."}
                  {currentStep === 4 && "Share your medical information so we can provide better care."}
                  {currentStep === 5 && "Upload required documents to verify your identity and insurance."}
                  {currentStep === 6 && "Set up your account security and review legal agreements."}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Step 1: Personal Information */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => updateFormData('firstName', e.target.value)}
                          placeholder="Enter your first name"
                          className="border-gray-300 focus:border-[#57BBB6] focus:ring-[#57BBB6]"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => updateFormData('lastName', e.target.value)}
                          placeholder="Enter your last name"
                          className="border-gray-300 focus:border-[#57BBB6] focus:ring-[#57BBB6]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={(e) => updateFormData('dateOfBirth', e.target.value)}
                          className="border-gray-300 focus:border-[#57BBB6] focus:ring-[#57BBB6]"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="ssn">Social Security Number *</Label>
                        <Input
                          id="ssn"
                          value={formData.ssn}
                          onChange={(e) => updateFormData('ssn', e.target.value)}
                          placeholder="XXX-XX-XXXX"
                          className="border-gray-300 focus:border-[#57BBB6] focus:ring-[#57BBB6]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => updateFormData('email', e.target.value)}
                          placeholder="Enter your email address"
                          className="border-gray-300 focus:border-[#57BBB6] focus:ring-[#57BBB6]"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => updateFormData('phone', e.target.value)}
                          placeholder="(XXX) XXX-XXXX"
                          className="border-gray-300 focus:border-[#57BBB6] focus:ring-[#57BBB6]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Address & Emergency Contact */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="address">Street Address *</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => updateFormData('address', e.target.value)}
                        placeholder="Enter your street address"
                        className="border-gray-300 focus:border-[#57BBB6] focus:ring-[#57BBB6]"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) => updateFormData('city', e.target.value)}
                          placeholder="Enter your city"
                          className="border-gray-300 focus:border-[#57BBB6] focus:ring-[#57BBB6]"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="state">State *</Label>
                        <Select value={formData.state} onValueChange={(value) => updateFormData('state', value)}>
                          <SelectTrigger className="border-gray-300 focus:border-[#57BBB6] focus:ring-[#57BBB6]">
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="NY">New York</SelectItem>
                            <SelectItem value="NJ">New Jersey</SelectItem>
                            <SelectItem value="CT">Connecticut</SelectItem>
                            <SelectItem value="PA">Pennsylvania</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="zipCode">ZIP Code *</Label>
                        <Input
                          id="zipCode"
                          value={formData.zipCode}
                          onChange={(e) => updateFormData('zipCode', e.target.value)}
                          placeholder="Enter ZIP code"
                          className="border-gray-300 focus:border-[#57BBB6] focus:ring-[#57BBB6]"
                        />
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold text-[#376F6B] mb-4">Emergency Contact</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="emergencyContactName">Emergency Contact Name *</Label>
                          <Input
                            id="emergencyContactName"
                            value={formData.emergencyContactName}
                            onChange={(e) => updateFormData('emergencyContactName', e.target.value)}
                            placeholder="Enter emergency contact name"
                            className="border-gray-300 focus:border-[#57BBB6] focus:ring-[#57BBB6]"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="emergencyContactPhone">Emergency Contact Phone *</Label>
                          <Input
                            id="emergencyContactPhone"
                            type="tel"
                            value={formData.emergencyContactPhone}
                            onChange={(e) => updateFormData('emergencyContactPhone', e.target.value)}
                            placeholder="(XXX) XXX-XXXX"
                            className="border-gray-300 focus:border-[#57BBB6] focus:ring-[#57BBB6]"
                          />
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <Label htmlFor="emergencyContactRelationship">Relationship *</Label>
                        <Select value={formData.emergencyContactRelationship} onValueChange={(value) => updateFormData('emergencyContactRelationship', value)}>
                          <SelectTrigger className="border-gray-300 focus:border-[#57BBB6] focus:ring-[#57BBB6]">
                            <SelectValue placeholder="Select relationship" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="spouse">Spouse</SelectItem>
                            <SelectItem value="parent">Parent</SelectItem>
                            <SelectItem value="child">Child</SelectItem>
                            <SelectItem value="sibling">Sibling</SelectItem>
                            <SelectItem value="friend">Friend</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Insurance Information */}
                {currentStep === 3 && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="insuranceProvider">Insurance Provider *</Label>
                      <Input
                        id="insuranceProvider"
                        value={formData.insuranceProvider}
                        onChange={(e) => updateFormData('insuranceProvider', e.target.value)}
                        placeholder="Enter your insurance provider name"
                        className="border-gray-300 focus:border-[#57BBB6] focus:ring-[#57BBB6]"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="insuranceGroupNumber">Group Number *</Label>
                        <Input
                          id="insuranceGroupNumber"
                          value={formData.insuranceGroupNumber}
                          onChange={(e) => updateFormData('insuranceGroupNumber', e.target.value)}
                          placeholder="Enter group number"
                          className="border-gray-300 focus:border-[#57BBB6] focus:ring-[#57BBB6]"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="insuranceMemberId">Member ID *</Label>
                        <Input
                          id="insuranceMemberId"
                          value={formData.insuranceMemberId}
                          onChange={(e) => updateFormData('insuranceMemberId', e.target.value)}
                          placeholder="Enter member ID"
                          className="border-gray-300 focus:border-[#57BBB6] focus:ring-[#57BBB6]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Medical Information */}
                {currentStep === 4 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="primaryCarePhysician">Primary Care Physician *</Label>
                        <Input
                          id="primaryCarePhysician"
                          value={formData.primaryCarePhysician}
                          onChange={(e) => updateFormData('primaryCarePhysician', e.target.value)}
                          placeholder="Enter physician name"
                          className="border-gray-300 focus:border-[#57BBB6] focus:ring-[#57BBB6]"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="physicianPhone">Physician Phone *</Label>
                        <Input
                          id="physicianPhone"
                          type="tel"
                          value={formData.physicianPhone}
                          onChange={(e) => updateFormData('physicianPhone', e.target.value)}
                          placeholder="(XXX) XXX-XXXX"
                          className="border-gray-300 focus:border-[#57BBB6] focus:ring-[#57BBB6]"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="allergies">Allergies (Optional)</Label>
                      <Textarea
                        id="allergies"
                        value={formData.allergies}
                        onChange={(e) => updateFormData('allergies', e.target.value)}
                        placeholder="List any known allergies or 'None'"
                        rows={3}
                        className="border-gray-300 focus:border-[#57BBB6] focus:ring-[#57BBB6]"
                      />
                    </div>

                    <div>
                      <Label htmlFor="currentMedications">Current Medications (Optional)</Label>
                      <Textarea
                        id="currentMedications"
                        value={formData.currentMedications}
                        onChange={(e) => updateFormData('currentMedications', e.target.value)}
                        placeholder="List current medications or 'None'"
                        rows={3}
                        className="border-gray-300 focus:border-[#57BBB6] focus:ring-[#57BBB6]"
                      />
                    </div>

                    <div>
                      <Label htmlFor="medicalConditions">Medical Conditions (Optional)</Label>
                      <Textarea
                        id="medicalConditions"
                        value={formData.medicalConditions}
                        onChange={(e) => updateFormData('medicalConditions', e.target.value)}
                        placeholder="List any medical conditions or 'None'"
                        rows={3}
                        className="border-gray-300 focus:border-[#57BBB6] focus:ring-[#57BBB6]"
                      />
                    </div>
                  </div>
                )}

                {/* Step 5: Documentation */}
                {currentStep === 5 && (
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="governmentIdType">Government ID Type *</Label>
                      <Select value={formData.governmentIdType} onValueChange={(value) => updateFormData('governmentIdType', value)}>
                        <SelectTrigger className="border-gray-300 focus:border-[#57BBB6] focus:ring-[#57BBB6]">
                          <SelectValue placeholder="Select ID type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="driver-license">Driver's License</SelectItem>
                          <SelectItem value="state-id">State ID</SelectItem>
                          <SelectItem value="passport">Passport</SelectItem>
                          <SelectItem value="military-id">Military ID</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="governmentIdNumber">Government ID Number *</Label>
                      <Input
                        id="governmentIdNumber"
                        value={formData.governmentIdNumber}
                        onChange={(e) => updateFormData('governmentIdNumber', e.target.value)}
                        placeholder="Enter ID number"
                        className="border-gray-300 focus:border-[#57BBB6] focus:ring-[#57BBB6]"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label>Government ID *</Label>
                        <div className="mt-2">
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => e.target.files?.[0] && handleFileUpload('governmentIdFile', e.target.files[0])}
                            className="hidden"
                            id="governmentIdFile"
                          />
                          <label
                            htmlFor="governmentIdFile"
                            className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#57BBB6] transition-colors"
                          >
                            {formData.governmentIdFile ? (
                              <div className="text-center">
                                <FileCheck className="h-8 w-8 text-[#57BBB6] mx-auto mb-2" />
                                <p className="text-sm text-gray-600">{formData.governmentIdFile.name}</p>
                              </div>
                            ) : (
                              <div className="text-center">
                                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-600">Upload Government ID</p>
                              </div>
                            )}
                          </label>
                        </div>
                      </div>

                      <div>
                        <Label>Proof of Address *</Label>
                        <div className="mt-2">
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => e.target.files?.[0] && handleFileUpload('proofOfAddressFile', e.target.files[0])}
                            className="hidden"
                            id="proofOfAddressFile"
                          />
                          <label
                            htmlFor="proofOfAddressFile"
                            className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#57BBB6] transition-colors"
                          >
                            {formData.proofOfAddressFile ? (
                              <div className="text-center">
                                <FileCheck className="h-8 w-8 text-[#57BBB6] mx-auto mb-2" />
                                <p className="text-sm text-gray-600">{formData.proofOfAddressFile.name}</p>
                              </div>
                            ) : (
                              <div className="text-center">
                                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-600">Upload Proof of Address</p>
                              </div>
                            )}
                          </label>
                        </div>
                      </div>

                      <div>
                        <Label>Insurance Card *</Label>
                        <div className="mt-2">
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => e.target.files?.[0] && handleFileUpload('insuranceCardFile', e.target.files[0])}
                            className="hidden"
                            id="insuranceCardFile"
                          />
                          <label
                            htmlFor="insuranceCardFile"
                            className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#57BBB6] transition-colors"
                          >
                            {formData.insuranceCardFile ? (
                              <div className="text-center">
                                <FileCheck className="h-8 w-8 text-[#57BBB6] mx-auto mb-2" />
                                <p className="text-sm text-gray-600">{formData.insuranceCardFile.name}</p>
                              </div>
                            ) : (
                              <div className="text-center">
                                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-600">Upload Insurance Card</p>
                              </div>
                            )}
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 6: Security & Agreements */}
                {currentStep === 6 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="password">Password *</Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={(e) => updateFormData('password', e.target.value)}
                            placeholder="Create a strong password"
                            className="pr-10 border-gray-300 focus:border-[#57BBB6] focus:ring-[#57BBB6]"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="confirmPassword">Confirm Password *</Label>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            value={formData.confirmPassword}
                            onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                            placeholder="Confirm your password"
                            className="pr-10 border-gray-300 focus:border-[#57BBB6] focus:ring-[#57BBB6]"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>Passwords do not match. Please try again.</AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-[#376F6B]">Security Questions</h3>
                      
                      <div>
                        <Label>Security Question 1 *</Label>
                        <Select value={formData.securityQuestions.question1} onValueChange={(value) => updateSecurityQuestion('question1', value)}>
                          <SelectTrigger className="border-gray-300 focus:border-[#57BBB6] focus:ring-[#57BBB6]">
                            <SelectValue placeholder="Select a security question" />
                          </SelectTrigger>
                          <SelectContent>
                            {securityQuestions.map((question, index) => (
                              <SelectItem key={index} value={question}>{question}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          className="mt-2 border-gray-300 focus:border-[#57BBB6] focus:ring-[#57BBB6]"
                          value={formData.securityQuestions.answer1}
                          onChange={(e) => updateSecurityQuestion('answer1', e.target.value)}
                          placeholder="Enter your answer"
                        />
                      </div>

                      <div>
                        <Label>Security Question 2 *</Label>
                        <Select value={formData.securityQuestions.question2} onValueChange={(value) => updateSecurityQuestion('question2', value)}>
                          <SelectTrigger className="border-gray-300 focus:border-[#57BBB6] focus:ring-[#57BBB6]">
                            <SelectValue placeholder="Select a security question" />
                          </SelectTrigger>
                          <SelectContent>
                            {securityQuestions.map((question, index) => (
                              <SelectItem key={index} value={question}>{question}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          className="mt-2 border-gray-300 focus:border-[#57BBB6] focus:ring-[#57BBB6]"
                          value={formData.securityQuestions.answer2}
                          onChange={(e) => updateSecurityQuestion('answer2', e.target.value)}
                          placeholder="Enter your answer"
                        />
                      </div>

                      <div>
                        <Label>Security Question 3 *</Label>
                        <Select value={formData.securityQuestions.question3} onValueChange={(value) => updateSecurityQuestion('question3', value)}>
                          <SelectTrigger className="border-gray-300 focus:border-[#57BBB6] focus:ring-[#57BBB6]">
                            <SelectValue placeholder="Select a security question" />
                          </SelectTrigger>
                          <SelectContent>
                            {securityQuestions.map((question, index) => (
                              <SelectItem key={index} value={question}>{question}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          className="mt-2 border-gray-300 focus:border-[#57BBB6] focus:ring-[#57BBB6]"
                          value={formData.securityQuestions.answer3}
                          onChange={(e) => updateSecurityQuestion('answer3', e.target.value)}
                          placeholder="Enter your answer"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-[#376F6B]">Legal Agreements</h3>
                      
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <Checkbox
                            id="termsAccepted"
                            checked={formData.termsAccepted}
                            onCheckedChange={(checked) => updateFormData('termsAccepted', checked)}
                            className="mt-1"
                          />
                          <Label htmlFor="termsAccepted" className="text-sm">
                            I accept the <a href="/terms-of-service" className="text-[#57BBB6] hover:underline">Terms of Service</a> *
                          </Label>
                        </div>
                        
                        <div className="flex items-start space-x-3">
                          <Checkbox
                            id="privacyPolicyAccepted"
                            checked={formData.privacyPolicyAccepted}
                            onCheckedChange={(checked) => updateFormData('privacyPolicyAccepted', checked)}
                            className="mt-1"
                          />
                          <Label htmlFor="privacyPolicyAccepted" className="text-sm">
                            I accept the <a href="/privacy-policy" className="text-[#57BBB6] hover:underline">Privacy Policy</a> *
                          </Label>
                        </div>
                        
                        <div className="flex items-start space-x-3">
                          <Checkbox
                            id="hipaaConsent"
                            checked={formData.hipaaConsent}
                            onCheckedChange={(checked) => updateFormData('hipaaConsent', checked)}
                            className="mt-1"
                          />
                          <Label htmlFor="hipaaConsent" className="text-sm">
                            I consent to the use and disclosure of my health information as described in the <a href="/hipaa-notice" className="text-[#57BBB6] hover:underline">HIPAA Notice</a> *
                          </Label>
                        </div>
                        
                        <div className="flex items-start space-x-3">
                          <Checkbox
                            id="medicalAuthorization"
                            checked={formData.medicalAuthorization}
                            onCheckedChange={(checked) => updateFormData('medicalAuthorization', checked)}
                            className="mt-1"
                          />
                          <Label htmlFor="medicalAuthorization" className="text-sm">
                            I authorize the pharmacy to provide my medical information to healthcare providers as necessary *
                          </Label>
                        </div>
                        
                        <div className="flex items-start space-x-3">
                          <Checkbox
                            id="financialResponsibility"
                            checked={formData.financialResponsibility}
                            onCheckedChange={(checked) => updateFormData('financialResponsibility', checked)}
                            className="mt-1"
                          />
                          <Label htmlFor="financialResponsibility" className="text-sm">
                            I understand that I am financially responsible for any charges not covered by my insurance *
                          </Label>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-green-800">Account Creation Complete</h4>
                          <p className="text-sm text-green-700 mt-1">
                            You're almost done! Click "Create Account" to submit your application. 
                            Our team will review your information and verify your identity within 24-48 hours.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
                className="border-[#57BBB6] text-[#57BBB6] hover:bg-[#57BBB6] hover:text-white"
              >
                Previous
              </Button>
              
              <Button
                onClick={handleSubmit}
                disabled={loading || !validateStep(currentStep)}
                className="min-w-[120px] bg-[#57BBB6] hover:bg-[#376F6B] text-white"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processing...
                  </div>
                ) : currentStep === 6 ? (
                  'Create Account'
                ) : (
                  'Next'
                )}
              </Button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Already have an account?{' '}
                <a href="/patient-portal" className="text-[#57BBB6] hover:underline">
                  Sign in to your patient portal
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
        </div>
      </>
    );
}
