import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Plus, Trash2, AlertTriangle, Info, Pill } from 'lucide-react';

interface Medication {
  id: string;
  name: string;
  frequency: string;
  firstDose: string;
  instructions: string;
  timing: {
    hours: number[];
    times: string[];
  };
}

interface TimingSchedule {
  medication: string;
  times: string[];
  nextDose: string;
  timeUntilNext: string;
}

const MedicationTimingCalculator: React.FC = () => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [medicationName, setMedicationName] = useState('');
  const [frequency, setFrequency] = useState('');
  const [firstDose, setFirstDose] = useState('');
  const [instructions, setInstructions] = useState('');
  const [schedule, setSchedule] = useState<TimingSchedule[]>([]);

  const frequencyOptions = [
    { value: 'once', label: 'Once Daily' },
    { value: 'twice', label: 'Twice Daily' },
    { value: 'three-times', label: 'Three Times Daily' },
    { value: 'four-times', label: 'Four Times Daily' },
    { value: 'every-6-hours', label: 'Every 6 Hours' },
    { value: 'every-8-hours', label: 'Every 8 Hours' },
    { value: 'every-12-hours', label: 'Every 12 Hours' },
    { value: 'as-needed', label: 'As Needed' }
  ];

  const calculateTiming = (freq: string, firstDose: string) => {
    const firstDoseTime = new Date(`2000-01-01T${firstDose}:00`);
    const times: string[] = [];
    const hours: number[] = [];

    switch (freq) {
      case 'once':
        times.push(firstDose);
        hours.push(firstDoseTime.getHours());
        break;
      
      case 'twice':
        times.push(firstDose);
        times.push(new Date(firstDoseTime.getTime() + 12 * 60 * 60 * 1000).toTimeString().slice(0, 5));
        hours.push(firstDoseTime.getHours(), (firstDoseTime.getHours() + 12) % 24);
        break;
      
      case 'three-times':
        times.push(firstDose);
        times.push(new Date(firstDoseTime.getTime() + 8 * 60 * 60 * 1000).toTimeString().slice(0, 5));
        times.push(new Date(firstDoseTime.getTime() + 16 * 60 * 60 * 1000).toTimeString().slice(0, 5));
        hours.push(firstDoseTime.getHours(), (firstDoseTime.getHours() + 8) % 24, (firstDoseTime.getHours() + 16) % 24);
        break;
      
      case 'four-times':
        times.push(firstDose);
        times.push(new Date(firstDoseTime.getTime() + 6 * 60 * 60 * 1000).toTimeString().slice(0, 5));
        times.push(new Date(firstDoseTime.getTime() + 12 * 60 * 60 * 1000).toTimeString().slice(0, 5));
        times.push(new Date(firstDoseTime.getTime() + 18 * 60 * 60 * 1000).toTimeString().slice(0, 5));
        hours.push(firstDoseTime.getHours(), (firstDoseTime.getHours() + 6) % 24, (firstDoseTime.getHours() + 12) % 24, (firstDoseTime.getHours() + 18) % 24);
        break;
      
      case 'every-6-hours':
        times.push(firstDose);
        times.push(new Date(firstDoseTime.getTime() + 6 * 60 * 60 * 1000).toTimeString().slice(0, 5));
        times.push(new Date(firstDoseTime.getTime() + 12 * 60 * 60 * 1000).toTimeString().slice(0, 5));
        times.push(new Date(firstDoseTime.getTime() + 18 * 60 * 60 * 1000).toTimeString().slice(0, 5));
        hours.push(firstDoseTime.getHours(), (firstDoseTime.getHours() + 6) % 24, (firstDoseTime.getHours() + 12) % 24, (firstDoseTime.getHours() + 18) % 24);
        break;
      
      case 'every-8-hours':
        times.push(firstDose);
        times.push(new Date(firstDoseTime.getTime() + 8 * 60 * 60 * 1000).toTimeString().slice(0, 5));
        times.push(new Date(firstDoseTime.getTime() + 16 * 60 * 60 * 1000).toTimeString().slice(0, 5));
        hours.push(firstDoseTime.getHours(), (firstDoseTime.getHours() + 8) % 24, (firstDoseTime.getHours() + 16) % 24);
        break;
      
      case 'every-12-hours':
        times.push(firstDose);
        times.push(new Date(firstDoseTime.getTime() + 12 * 60 * 60 * 1000).toTimeString().slice(0, 5));
        hours.push(firstDoseTime.getHours(), (firstDoseTime.getHours() + 12) % 24);
        break;
      
      case 'as-needed':
        times.push('As needed');
        hours.push(-1);
        break;
    }

    return { times, hours };
  };

  const addMedication = () => {
    if (!medicationName || !frequency || !firstDose) return;

    const timing = calculateTiming(frequency, firstDose);
    
    const newMedication: Medication = {
      id: Date.now().toString(),
      name: medicationName,
      frequency,
      firstDose,
      instructions,
      timing
    };

    setMedications(prev => [...prev, newMedication]);
    
    // Clear form
    setMedicationName('');
    setFrequency('');
    setFirstDose('');
    setInstructions('');
    
    // Update schedule
    updateSchedule([...medications, newMedication]);
  };

  const removeMedication = (id: string) => {
    const updatedMedications = medications.filter(med => med.id !== id);
    setMedications(updatedMedications);
    updateSchedule(updatedMedications);
  };

  const updateSchedule = (meds: Medication[]) => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const scheduleItems: TimingSchedule[] = meds.map(med => {
      if (med.frequency === 'as-needed') {
        return {
          medication: med.name,
          times: ['As needed'],
          nextDose: 'As needed',
          timeUntilNext: 'N/A'
        };
      }

      // Find next dose time
      let nextDose = '';
      let timeUntilNext = '';
      
      for (const time of med.timing.times) {
        const [hours, minutes] = time.split(':').map(Number);
        const doseTime = hours * 60 + minutes;
        
        if (doseTime > currentTime) {
          nextDose = time;
          const diff = doseTime - currentTime;
          const hoursUntil = Math.floor(diff / 60);
          const minutesUntil = diff % 60;
          timeUntilNext = `${hoursUntil}h ${minutesUntil}m`;
          break;
        }
      }
      
      // If no dose found for today, use first dose of tomorrow
      if (!nextDose) {
        nextDose = med.timing.times[0];
        const [hours, minutes] = nextDose.split(':').map(Number);
        const tomorrowDoseTime = (hours + 24) * 60 + minutes;
        const diff = tomorrowDoseTime - currentTime;
        const hoursUntil = Math.floor(diff / 60);
        const minutesUntil = diff % 60;
        timeUntilNext = `${hoursUntil}h ${minutesUntil}m`;
      }

      return {
        medication: med.name,
        times: med.timing.times,
        nextDose,
        timeUntilNext
      };
    });

    setSchedule(scheduleItems);
  };

  const getFrequencyLabel = (freq: string) => {
    const option = frequencyOptions.find(opt => opt.value === freq);
    return option ? option.label : freq;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Medication Timing Calculator
          </CardTitle>
          <CardDescription>
            Schedule your medications and track when to take your next dose
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="medication-name">Medication Name</Label>
              <Input
                id="medication-name"
                value={medicationName}
                onChange={(e) => setMedicationName(e.target.value)}
                placeholder="e.g., Lisinopril, Metformin"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  {frequencyOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="first-dose">First Dose Time</Label>
              <Input
                id="first-dose"
                type="time"
                value={firstDose}
                onChange={(e) => setFirstDose(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="instructions">Special Instructions</Label>
              <Input
                id="instructions"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="e.g., With food, on empty stomach"
              />
            </div>
          </div>

          <Button onClick={addMedication} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Medication
          </Button>
        </CardContent>
      </Card>

      {/* Current Schedule */}
      {schedule.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Today's Medication Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {schedule.map((item, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-lg">{item.medication}</h4>
                    <Badge variant="outline">
                      Next: {item.nextDose}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium text-sm text-gray-600 mb-1">Scheduled Times:</h5>
                      <div className="flex flex-wrap gap-1">
                        {item.times.map((time, i) => (
                          <Badge key={i} variant="secondary">
                            {time}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    {item.timeUntilNext !== 'N/A' && (
                      <div>
                        <h5 className="font-medium text-sm text-gray-600 mb-1">Time Until Next Dose:</h5>
                        <Badge className="bg-blue-100 text-blue-800">
                          {item.timeUntilNext}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Medication List */}
      {medications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Medications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {medications.map((med) => (
                <div key={med.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-lg">{med.name}</h4>
                      <p className="text-sm text-gray-600">{getFrequencyLabel(med.frequency)}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMedication(med.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium text-sm text-gray-600 mb-1">Dose Times:</h5>
                      <div className="flex flex-wrap gap-1">
                        {med.timing.times.map((time, i) => (
                          <Badge key={i} variant="secondary">
                            {time}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    {med.instructions && (
                      <div>
                        <h5 className="font-medium text-sm text-gray-600 mb-1">Instructions:</h5>
                        <p className="text-sm">{med.instructions}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5" />
            Medication Timing Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
              <span className="text-sm">Take medications at the same time each day to maintain consistent blood levels</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
              <span className="text-sm">Use pill organizers to help remember doses</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
              <span className="text-sm">Set alarms or reminders on your phone</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
              <span className="text-sm">Check with your pharmacist about food interactions</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
              <span className="text-sm">Never double up on doses if you miss one - consult your doctor</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Disclaimer:</strong> This tool is for informational purposes only. 
          Always follow your healthcare provider's instructions for medication timing. 
          This calculator should not replace professional medical advice.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default MedicationTimingCalculator;

