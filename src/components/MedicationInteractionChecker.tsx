import { useState, useEffect } from 'react';
import { Search, AlertTriangle, CheckCircle, Info, Pill, X, Plus, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { HIPAAFormBanner } from '@/components/HIPAACompliance';

interface Medication {
  id: string;
  name: string;
  genericName?: string;
  category: string;
  strength?: string;
}

interface Interaction {
  severity: 'high' | 'moderate' | 'low' | 'none';
  description: string;
  recommendation: string;
  evidence: string;
}

interface InteractionResult {
  medications: string[];
  interactions: Interaction[];
  summary: {
    high: number;
    moderate: number;
    low: number;
    none: number;
  };
}

const MedicationInteractionChecker = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMedications, setSelectedMedications] = useState<Medication[]>([]);
  const [searchResults, setSearchResults] = useState<Medication[]>([]);
  const [interactionResults, setInteractionResults] = useState<InteractionResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  // Sample medication database (in real app, this would come from an API)
  const medicationDatabase: Medication[] = [
    { id: '1', name: 'Lisinopril', genericName: 'Lisinopril', category: 'ACE Inhibitor', strength: '10mg' },
    { id: '2', name: 'Metformin', genericName: 'Metformin', category: 'Antidiabetic', strength: '500mg' },
    { id: '3', name: 'Atorvastatin', genericName: 'Atorvastatin', category: 'Statin', strength: '20mg' },
    { id: '4', name: 'Aspirin', genericName: 'Acetylsalicylic Acid', category: 'NSAID', strength: '81mg' },
    { id: '5', name: 'Warfarin', genericName: 'Warfarin', category: 'Anticoagulant', strength: '5mg' },
    { id: '6', name: 'Omeprazole', genericName: 'Omeprazole', category: 'Proton Pump Inhibitor', strength: '20mg' },
    { id: '7', name: 'Amlodipine', genericName: 'Amlodipine', category: 'Calcium Channel Blocker', strength: '5mg' },
    { id: '8', name: 'Losartan', genericName: 'Losartan', category: 'ARB', strength: '50mg' },
    { id: '9', name: 'Ibuprofen', genericName: 'Ibuprofen', category: 'NSAID', strength: '400mg' },
    { id: '10', name: 'Acetaminophen', genericName: 'Acetaminophen', category: 'Analgesic', strength: '500mg' },
  ];

  // Sample interaction database
  const interactionDatabase: Record<string, Interaction[]> = {
    'Lisinopril-Warfarin': [
      {
        severity: 'moderate',
        description: 'Lisinopril may increase the anticoagulant effect of warfarin',
        recommendation: 'Monitor INR more frequently and adjust warfarin dose as needed',
        evidence: 'Clinical studies show increased bleeding risk'
      }
    ],
    'Aspirin-Warfarin': [
      {
        severity: 'high',
        description: 'Combined use increases risk of bleeding',
        recommendation: 'Avoid combination unless specifically prescribed by doctor',
        evidence: 'Multiple clinical trials show increased bleeding risk'
      }
    ],
    'Metformin-Aspirin': [
      {
        severity: 'low',
        description: 'Aspirin may slightly increase metformin levels',
        recommendation: 'Monitor blood glucose more closely',
        evidence: 'Limited clinical data available'
      }
    ]
  };

  useEffect(() => {
    if (searchTerm.length > 2) {
      const filtered = medicationDatabase.filter(med =>
        med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        med.genericName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSearchResults(filtered.slice(0, 5));
    } else {
      setSearchResults([]);
    }
  }, [searchTerm]);

  const addMedication = (medication: Medication) => {
    if (!selectedMedications.find(med => med.id === medication.id)) {
      setSelectedMedications([...selectedMedications, medication]);
    }
    setSearchTerm('');
    setSearchResults([]);
  };

  const removeMedication = (medicationId: string) => {
    setSelectedMedications(selectedMedications.filter(med => med.id !== medicationId));
    setInteractionResults(null);
  };

  const checkInteractions = async () => {
    if (selectedMedications.length < 2) return;

    setIsChecking(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    const interactions: Interaction[] = [];
    const medicationNames = selectedMedications.map(med => med.name);

    // Check for known interactions
    for (let i = 0; i < selectedMedications.length; i++) {
      for (let j = i + 1; j < selectedMedications.length; j++) {
        const med1 = selectedMedications[i];
        const med2 = selectedMedications[j];
        const key = `${med1.name}-${med2.name}`;
        const reverseKey = `${med2.name}-${med1.name}`;

        if (interactionDatabase[key]) {
          interactions.push(...interactionDatabase[key]);
        } else if (interactionDatabase[reverseKey]) {
          interactions.push(...interactionDatabase[reverseKey]);
        } else {
          // No known interaction
          interactions.push({
            severity: 'none',
            description: `No known interactions between ${med1.name} and ${med2.name}`,
            recommendation: 'Continue taking both medications as prescribed',
            evidence: 'No documented interactions found in current literature'
          });
        }
      }
    }

    const summary = {
      high: interactions.filter(i => i.severity === 'high').length,
      moderate: interactions.filter(i => i.severity === 'moderate').length,
      low: interactions.filter(i => i.severity === 'low').length,
      none: interactions.filter(i => i.severity === 'none').length
    };

    setInteractionResults({
      medications: medicationNames,
      interactions,
      summary
    });

    setIsChecking(false);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'none': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'moderate': return <AlertTriangle className="h-4 w-4" />;
      case 'low': return <Info className="h-4 w-4" />;
      case 'none': return <CheckCircle className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Medication Interaction Checker</h1>
        <p className="text-gray-600">
          Check for potential drug interactions between your medications. 
          Always consult with your healthcare provider for medical advice.
        </p>
      </div>

      <HIPAAFormBanner />

      {/* Disclaimer */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Important:</strong> This tool is for informational purposes only and should not replace professional medical advice. 
          Always consult with your doctor or pharmacist before making any changes to your medication regimen.
        </AlertDescription>
      </Alert>

      {/* Medication Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5" />
            Select Your Medications
          </CardTitle>
          <CardDescription>
            Search and add your medications to check for potential interactions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search for medications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="border rounded-lg p-2 space-y-1">
              {searchResults.map((medication) => (
                <div
                  key={medication.id}
                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer"
                  onClick={() => addMedication(medication)}
                >
                  <div>
                    <div className="font-medium">{medication.name}</div>
                    <div className="text-sm text-gray-500">
                      {medication.genericName && `${medication.genericName} • `}
                      {medication.category} {medication.strength && `• ${medication.strength}`}
                    </div>
                  </div>
                  <Plus className="h-4 w-4 text-gray-400" />
                </div>
              ))}
            </div>
          )}

          {/* Selected Medications */}
          {selectedMedications.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Selected Medications:</h4>
              <div className="flex flex-wrap gap-2">
                {selectedMedications.map((medication) => (
                  <Badge
                    key={medication.id}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {medication.name}
                    <button
                      onClick={() => removeMedication(medication.id)}
                      className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Check Interactions Button */}
          {selectedMedications.length >= 2 && (
            <Button
              onClick={checkInteractions}
              disabled={isChecking}
              className="w-full"
            >
              {isChecking ? 'Checking Interactions...' : 'Check Interactions'}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Interaction Results */}
      {interactionResults && (
        <Card>
          <CardHeader>
            <CardTitle>Interaction Results</CardTitle>
            <CardDescription>
              Analysis for {interactionResults.medications.join(', ')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{interactionResults.summary.high}</div>
                <div className="text-sm text-red-700">High Risk</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{interactionResults.summary.moderate}</div>
                <div className="text-sm text-yellow-700">Moderate</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{interactionResults.summary.low}</div>
                <div className="text-sm text-blue-700">Low Risk</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{interactionResults.summary.none}</div>
                <div className="text-sm text-green-700">No Interaction</div>
              </div>
            </div>

            {/* Detailed Interactions */}
            <div className="space-y-4">
              <h4 className="font-semibold">Detailed Analysis:</h4>
              {interactionResults.interactions.map((interaction, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${getSeverityColor(interaction.severity)}`}
                >
                  <div className="flex items-start gap-3">
                    {getSeverityIcon(interaction.severity)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getSeverityColor(interaction.severity)}>
                          {interaction.severity.toUpperCase()} RISK
                        </Badge>
                      </div>
                      <p className="font-medium mb-2">{interaction.description}</p>
                      <p className="text-sm mb-2"><strong>Recommendation:</strong> {interaction.recommendation}</p>
                      <p className="text-xs opacity-75"><strong>Evidence:</strong> {interaction.evidence}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" className="flex-1">
                <ExternalLink className="h-4 w-4 mr-2" />
                Print Report
              </Button>
              <Button variant="outline" className="flex-1">
                <ExternalLink className="h-4 w-4 mr-2" />
                Share with Doctor
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="flex-1">
                    Schedule Consultation
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Schedule a Consultation</DialogTitle>
                    <DialogDescription>
                      Book an appointment with our pharmacist to discuss your medication interactions in detail.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Our pharmacists can provide personalized advice about your medication interactions 
                      and help you understand the risks and benefits.
                    </p>
                    <Button className="w-full">
                      Call (347) 312-6458
                    </Button>
                    <Button variant="outline" className="w-full">
                      Book Online Appointment
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Resources */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="justify-start">
              <ExternalLink className="h-4 w-4 mr-2" />
              FDA Drug Information
            </Button>
            <Button variant="outline" className="justify-start">
              <ExternalLink className="h-4 w-4 mr-2" />
              MedlinePlus Drug Information
            </Button>
            <Button variant="outline" className="justify-start">
              <ExternalLink className="h-4 w-4 mr-2" />
              Drug Interaction Database
            </Button>
            <Button variant="outline" className="justify-start">
              <ExternalLink className="h-4 w-4 mr-2" />
              Side Effect Information
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MedicationInteractionChecker;
