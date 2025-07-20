import { useState } from "react";
import { X, Pill, Building2, ArrowRight, User, Phone } from "lucide-react";
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
  const [prescriptionFile, setPrescriptionFile] = useState(null);
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate file upload
    if (!prescriptionFile) {
      setError('Please upload your prescription file');
      toast({ title: 'Error', description: 'Please upload your prescription file', variant: 'destructive' });
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      // Create FormData to include file upload
      const formDataToSend = new FormData();
      formDataToSend.append('file', prescriptionFile);
      
      // Add all form fields to FormData
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
      toast({ title: 'Transfer Request Submitted!', description: "We'll process your prescription transfer within 24 hours and notify you when it's ready." });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit transfer request');
      toast({ title: 'Error', description: error, variant: 'destructive' });
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="bg-background rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
          <div>
            <CardTitle className="text-2xl font-bold text-foreground">Transfer Prescription</CardTitle>
            <p className="text-muted-foreground mt-2">Transfer your prescriptions to My Meds Pharmacy</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <div className="mb-8 flex items-center justify-center">
            <div className="flex items-center space-x-4 text-center">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-muted-foreground" />
                </div>
                <span className="text-sm text-muted-foreground mt-2">Current Pharmacy</span>
              </div>
              <ArrowRight className="h-6 w-6 text-primary" />
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                  <div className="text-primary font-bold text-sm">MM</div>
                </div>
                <span className="text-sm text-primary mt-2 font-medium">My Meds Pharmacy</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Patient Information */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Patient Information
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-foreground mb-2">
                    First Name
                  </label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-foreground mb-2">
                    Last Name
                  </label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="dateOfBirth" className="block text-sm font-medium text-foreground mb-2">
                    Date of Birth
                  </label>
                  <Input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    required
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
                    <Phone className="inline h-4 w-4 mr-1" />
                    Phone Number
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                    Email Address (Optional)
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Current Pharmacy Information */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                <Building2 className="h-5 w-5 mr-2" />
                Current Pharmacy Information
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="currentPharmacy" className="block text-sm font-medium text-foreground mb-2">
                    Pharmacy Name
                  </label>
                  <Input
                    id="currentPharmacy"
                    name="currentPharmacy"
                    type="text"
                    required
                    value={formData.currentPharmacy}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="currentPharmacyPhone" className="block text-sm font-medium text-foreground mb-2">
                    Pharmacy Phone Number
                  </label>
                  <Input
                    id="currentPharmacyPhone"
                    name="currentPharmacyPhone"
                    type="tel"
                    required
                    value={formData.currentPharmacyPhone}
                    onChange={handleChange}
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="currentPharmacyAddress" className="block text-sm font-medium text-foreground mb-2">
                    Pharmacy Address
                  </label>
                  <Input
                    id="currentPharmacyAddress"
                    name="currentPharmacyAddress"
                    type="text"
                    required
                    value={formData.currentPharmacyAddress}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Prescription Information */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                <Pill className="h-5 w-5 mr-2" />
                Prescription Information
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="medication" className="block text-sm font-medium text-foreground mb-2">
                    Medication Name
                  </label>
                  <Input
                    id="medication"
                    name="medication"
                    type="text"
                    required
                    value={formData.medication}
                    onChange={handleChange}
                    placeholder="e.g., Lisinopril 10mg"
                  />
                </div>
                <div>
                  <label htmlFor="prescriptionNumber" className="block text-sm font-medium text-foreground mb-2">
                    Prescription Number (if available)
                  </label>
                  <Input
                    id="prescriptionNumber"
                    name="prescriptionNumber"
                    type="text"
                    value={formData.prescriptionNumber}
                    onChange={handleChange}
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="prescribingDoctor" className="block text-sm font-medium text-foreground mb-2">
                    Prescribing Doctor
                  </label>
                  <Input
                    id="prescribingDoctor"
                    name="prescribingDoctor"
                    type="text"
                    required
                    value={formData.prescribingDoctor}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Insurance Information */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Insurance Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="insuranceProvider" className="block text-sm font-medium text-foreground mb-2">
                    Insurance Provider
                  </label>
                  <Input
                    id="insuranceProvider"
                    name="insuranceProvider"
                    type="text"
                    value={formData.insuranceProvider}
                    onChange={handleChange}
                    placeholder="e.g., Blue Cross Blue Shield"
                  />
                </div>
                <div>
                  <label htmlFor="insuranceMemberID" className="block text-sm font-medium text-foreground mb-2">
                    Member ID
                  </label>
                  <Input
                    id="insuranceMemberID"
                    name="insuranceMemberID"
                    type="text"
                    value={formData.insuranceMemberID}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-foreground mb-2">
                Additional Notes or Special Instructions
              </label>
              <Textarea
                id="notes"
                name="notes"
                rows={3}
                value={formData.notes}
                onChange={handleChange}
                placeholder="Any specific instructions or multiple medications to transfer..."
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-[#376f6b] mb-2">Upload Prescription *</label>
              <input type="file" accept="image/*,application/pdf" onChange={e => setPrescriptionFile(e.target.files[0])} required className="border p-2 rounded w-full" />
              {prescriptionFile && <div className="text-[#57bbb6] mt-1">Selected: {prescriptionFile.name}</div>}
            </div>

            <div className="bg-secondary/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Important:</strong> We will contact your current pharmacy directly to transfer your prescription(s). 
                You will be notified once the transfer is complete and your medication is ready for pickup or delivery.
              </p>
            </div>

            <div className="flex gap-4">
              <Button type="submit" className="w-full text-lg py-3" disabled={loading}>{loading ? 'Submitting...' : 'Submit'}</Button>
              {error && <div className="text-red-500 mt-2">{error}</div>}
              {success && <div className="text-green-600 mt-2">Transfer request sent!</div>}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};