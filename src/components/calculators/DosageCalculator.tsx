import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pill, Calculator, AlertTriangle, Info, Shield } from 'lucide-react';

interface DosageResult {
  tablets: number;
  liquidML: number;
  liquidTsp: number;
  warning: string | null;
  recommendations: string[];
}

const DosageCalculator: React.FC = () => {
  const [prescribedDose, setPrescribedDose] = useState('');
  const [availableStrength, setAvailableStrength] = useState('');
  const [formType, setFormType] = useState<'tablet' | 'liquid'>('tablet');
  const [liquidConcentration, setLiquidConcentration] = useState('');
  const [patientWeight, setPatientWeight] = useState('');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');
  const [result, setResult] = useState<DosageResult | null>(null);

  const formTypes = [
    { value: 'tablet', label: 'Tablet/Capsule' },
    { value: 'liquid', label: 'Liquid/Suspension' }
  ];

  const calculateDosage = () => {
    if (!prescribedDose || !availableStrength) return;

    const prescribed = parseFloat(prescribedDose);
    const available = parseFloat(availableStrength);

    if (prescribed <= 0 || available <= 0) return;

    let tablets = 0;
    let liquidML = 0;
    let liquidTsp = 0;
    let warning: string | null = null;
    const recommendations: string[] = [];

    if (formType === 'tablet') {
      tablets = prescribed / available;
      
      if (tablets !== Math.floor(tablets)) {
        warning = 'This dosage requires cutting tablets. Consult your pharmacist for proper tablet splitting techniques.';
        recommendations.push('Use a pill splitter for accurate division');
        recommendations.push('Ask your pharmacist if scored tablets are available');
        recommendations.push('Consider asking for a different strength tablet');
      }

      if (tablets > 4) {
        warning = 'High number of tablets required. Please verify with your healthcare provider.';
        recommendations.push('Double-check the prescription with your doctor');
        recommendations.push('Verify the available tablet strength');
      }
    } else {
      // Liquid calculation
      if (!liquidConcentration) return;
      
      const concentration = parseFloat(liquidConcentration);
      if (concentration <= 0) return;

      liquidML = prescribed / concentration;
      liquidTsp = liquidML / 5; // 1 teaspoon = 5ml

      if (liquidTsp > 3) {
        warning = 'Large volume of liquid medication required. Please verify the concentration.';
        recommendations.push('Verify the liquid concentration with your pharmacist');
        recommendations.push('Use a calibrated measuring device');
      }

      recommendations.push('Use a medicine cup or oral syringe for accurate measurement');
      recommendations.push('Shake liquid medications before measuring');
    }

    // Weight-based warnings
    if (patientWeight) {
      const weight = parseFloat(patientWeight);
      const weightInKg = weightUnit === 'lbs' ? weight * 0.453592 : weight;
      const dosePerKg = prescribed / weightInKg;

      if (dosePerKg > 10) {
        warning = 'High dose per kilogram. Please verify with your healthcare provider.';
        recommendations.push('Confirm the prescribed dose with your doctor');
        recommendations.push('Verify patient weight and dosage calculations');
      }
    }

    // General recommendations
    recommendations.push('Always double-check calculations');
    recommendations.push('Ask your pharmacist if you have questions');
    recommendations.push('Use the measuring device provided with liquid medications');

    setResult({
      tablets: Math.round(tablets * 100) / 100,
      liquidML: Math.round(liquidML * 10) / 10,
      liquidTsp: Math.round(liquidTsp * 100) / 100,
      warning,
      recommendations
    });
  };

  const resetCalculator = () => {
    setPrescribedDose('');
    setAvailableStrength('');
    setFormType('tablet');
    setLiquidConcentration('');
    setPatientWeight('');
    setWeightUnit('kg');
    setResult(null);
  };

  const getFormTypeLabel = (type: string) => {
    const option = formTypes.find(opt => opt.value === type);
    return option ? option.label : type;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Dosage Calculator
          </CardTitle>
          <CardDescription>
            Calculate the correct amount of medication to take based on your prescription
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Prescribed Dose */}
          <div className="space-y-2">
            <Label htmlFor="prescribed-dose">Prescribed Dose (mg)</Label>
            <Input
              id="prescribed-dose"
              type="number"
              value={prescribedDose}
              onChange={(e) => setPrescribedDose(e.target.value)}
              placeholder="e.g., 10, 25, 50"
              min="0"
              step="0.1"
            />
          </div>

          {/* Form Type */}
          <div className="space-y-2">
            <Label htmlFor="form-type">Medication Form</Label>
            <Select value={formType} onValueChange={(value: 'tablet' | 'liquid') => setFormType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select form type" />
              </SelectTrigger>
              <SelectContent>
                {formTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Available Strength */}
          <div className="space-y-2">
            <Label htmlFor="available-strength">
              Available Strength ({formType === 'tablet' ? 'mg per tablet' : 'mg per ml'})
            </Label>
            <Input
              id="available-strength"
              type="number"
              value={availableStrength}
              onChange={(e) => setAvailableStrength(e.target.value)}
              placeholder={formType === 'tablet' ? 'e.g., 5, 10, 20' : 'e.g., 2.5, 5, 10'}
              min="0"
              step="0.1"
            />
          </div>

          {/* Liquid Concentration (only for liquid form) */}
          {formType === 'liquid' && (
            <div className="space-y-2">
              <Label htmlFor="liquid-concentration">Liquid Concentration (mg/ml)</Label>
              <Input
                id="liquid-concentration"
                type="number"
                value={liquidConcentration}
                onChange={(e) => setLiquidConcentration(e.target.value)}
                placeholder="e.g., 2.5, 5, 10"
                min="0"
                step="0.1"
              />
            </div>
          )}

          {/* Patient Weight (optional) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="patient-weight">Patient Weight (optional)</Label>
              <Input
                id="patient-weight"
                type="number"
                value={patientWeight}
                onChange={(e) => setPatientWeight(e.target.value)}
                placeholder="e.g., 70"
                min="0"
                step="0.1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight-unit">Weight Unit</Label>
              <Select value={weightUnit} onValueChange={(value: 'kg' | 'lbs') => setWeightUnit(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">Kilograms (kg)</SelectItem>
                  <SelectItem value="lbs">Pounds (lbs)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={calculateDosage} className="flex-1">
              Calculate Dosage
            </Button>
            <Button variant="outline" onClick={resetCalculator}>
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Dosage Calculation Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {formType === 'tablet' ? (
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">{result.tablets}</div>
                <div className="text-lg text-muted-foreground">
                  {result.tablets === 1 ? 'tablet' : 'tablets'} required
                </div>
              </div>
            ) : (
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold">{result.liquidML} ml</div>
                <div className="text-lg text-muted-foreground">
                  or {result.liquidTsp} teaspoon{result.liquidTsp !== 1 ? 's' : ''}
                </div>
              </div>
            )}

            {result.warning && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  <strong>Warning:</strong> {result.warning}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              <h4 className="font-semibold">Important Recommendations:</h4>
              <ul className="space-y-2">
                {result.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span className="text-sm">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Safety Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Medication Safety Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
              <span className="text-sm">Always read the medication label carefully</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
              <span className="text-sm">Use the measuring device provided with liquid medications</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
              <span className="text-sm">Never use household spoons for liquid medications</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
              <span className="text-sm">Ask your pharmacist to demonstrate proper tablet splitting</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
              <span className="text-sm">Keep medications in their original containers</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
              <span className="text-sm">Contact your pharmacist if you have any questions</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Common Conversions */}
      <Card>
        <CardHeader>
          <CardTitle>Common Liquid Conversions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Volume Conversions:</h4>
              <div className="text-sm space-y-1">
                <div>1 teaspoon = 5 ml</div>
                <div>1 tablespoon = 15 ml</div>
                <div>1 fluid ounce = 30 ml</div>
                <div>1 cup = 240 ml</div>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Weight Conversions:</h4>
              <div className="text-sm space-y-1">
                <div>1 kg = 2.2 lbs</div>
                <div>1 lb = 0.45 kg</div>
                <div>1 gram = 1000 mg</div>
                <div>1 mg = 1000 mcg</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Important Disclaimer:</strong> This calculator is for educational purposes only 
          and should not replace professional medical advice. Always follow your healthcare provider's 
          instructions and consult your pharmacist for proper medication administration. 
          Dosage calculations should be verified by a healthcare professional.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default DosageCalculator;

