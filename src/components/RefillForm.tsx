import { useState } from "react";
import { X, Pill, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface RefillFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RefillForm = ({ isOpen, onClose }: RefillFormProps) => {
  const [formData, setFormData] = useState({
    patientName: '',
    dateOfBirth: '',
    phone: '',
    email: '',
    prescriptionNumber: '',
    medicationName: '',
    physicianName: '',
    pickupDate: '',
    deliveryOption: 'pickup',
    deliveryAddress: '',
    specialInstructions: ''
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Refill Request Submitted!",
      description: "We'll process your prescription refill and contact you when it's ready.",
    });
    setFormData({
      patientName: '',
      dateOfBirth: '',
      phone: '',
      email: '',
      prescriptionNumber: '',
      medicationName: '',
      physicianName: '',
      pickupDate: '',
      deliveryOption: 'pickup',
      deliveryAddress: '',
      specialInstructions: ''
    });
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
        <Card className="border-0 shadow-xl">
          <CardHeader className="relative bg-primary text-primary-foreground rounded-t-lg">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-primary-foreground hover:text-primary-foreground/70"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-3">
              <Pill className="h-8 w-8" />
              <CardTitle className="text-2xl">Prescription Refill Request</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Patient Information */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <User className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">Patient Information</h3>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Full Name *
                    </label>
                    <Input
                      name="patientName"
                      type="text"
                      required
                      value={formData.patientName}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Date of Birth *
                    </label>
                    <Input
                      name="dateOfBirth"
                      type="date"
                      required
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Phone Number *
                    </label>
                    <Input
                      name="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="(347) 312-6458"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Email Address
                    </label>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
              </div>

              {/* Prescription Information */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <Pill className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">Prescription Information</h3>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Prescription Number
                    </label>
                    <Input
                      name="prescriptionNumber"
                      type="text"
                      value={formData.prescriptionNumber}
                      onChange={handleChange}
                      placeholder="Rx# (if available)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Medication Name *
                    </label>
                    <Input
                      name="medicationName"
                      type="text"
                      required
                      value={formData.medicationName}
                      onChange={handleChange}
                      placeholder="Name of medication"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Prescribing Physician
                  </label>
                  <Input
                    name="physicianName"
                    type="text"
                    value={formData.physicianName}
                    onChange={handleChange}
                    placeholder="Doctor's name"
                  />
                </div>
              </div>

              {/* Pickup/Delivery Options */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <Calendar className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">Pickup & Delivery</h3>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Preferred Date
                    </label>
                    <Input
                      name="pickupDate"
                      type="date"
                      value={formData.pickupDate}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Delivery Option
                    </label>
                    <select
                      name="deliveryOption"
                      value={formData.deliveryOption}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                    >
                      <option value="pickup">Pickup at Pharmacy</option>
                      <option value="delivery">Free Home Delivery</option>
                    </select>
                  </div>
                </div>

                {formData.deliveryOption === 'delivery' && (
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Delivery Address *
                    </label>
                    <Input
                      name="deliveryAddress"
                      type="text"
                      required={formData.deliveryOption === 'delivery'}
                      value={formData.deliveryAddress}
                      onChange={handleChange}
                      placeholder="Full delivery address"
                    />
                  </div>
                )}
              </div>

              {/* Special Instructions */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Special Instructions
                </label>
                <Textarea
                  name="specialInstructions"
                  rows={3}
                  value={formData.specialInstructions}
                  onChange={handleChange}
                  placeholder="Any special instructions or questions..."
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <Button type="submit" className="flex-1 bg-primary hover:bg-pharmacy-blue-dark text-lg py-3">
                  Submit Refill Request
                </Button>
                <Button type="button" variant="outline" onClick={onClose} className="px-6">
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};