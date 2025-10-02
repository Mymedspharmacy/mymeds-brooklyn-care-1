import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Heart, Plus, Trash2, TrendingUp, AlertTriangle, Info } from 'lucide-react';

interface BloodPressureReading {
  id: string;
  systolic: number;
  diastolic: number;
  date: string;
  time: string;
  category: string;
  color: string;
}

interface BPResult {
  category: string;
  color: string;
  description: string;
  recommendations: string[];
  urgent: boolean;
}

const BloodPressureTracker: React.FC = () => {
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [readings, setReadings] = useState<BloodPressureReading[]>([]);
  const [result, setResult] = useState<BPResult | null>(null);

  const getBPCategory = (systolic: number, diastolic: number): BPResult => {
    if (systolic < 120 && diastolic < 80) {
      return {
        category: 'Normal',
        color: 'bg-green-100 text-green-800',
        description: 'Your blood pressure is within the normal range.',
        recommendations: [
          'Continue maintaining a healthy lifestyle',
          'Regular exercise and balanced diet',
          'Annual check-ups with your healthcare provider',
          'Monitor blood pressure regularly'
        ],
        urgent: false
      };
    } else if (systolic >= 120 && systolic < 130 && diastolic < 80) {
      return {
        category: 'Elevated',
        color: 'bg-yellow-100 text-yellow-800',
        description: 'Your blood pressure is elevated (pre-hypertension).',
        recommendations: [
          'Focus on lifestyle modifications',
          'Reduce sodium intake',
          'Increase physical activity',
          'Discuss with your healthcare provider'
        ],
        urgent: false
      };
    } else if ((systolic >= 130 && systolic < 140) || (diastolic >= 80 && diastolic < 90)) {
      return {
        category: 'High Blood Pressure Stage 1',
        color: 'bg-orange-100 text-orange-800',
        description: 'You have Stage 1 hypertension.',
        recommendations: [
          'Immediate lifestyle changes required',
          'Consult your healthcare provider',
          'Consider medication if lifestyle changes are insufficient',
          'Regular monitoring is essential'
        ],
        urgent: true
      };
    } else if ((systolic >= 140 && systolic < 180) || (diastolic >= 90 && diastolic < 120)) {
      return {
        category: 'High Blood Pressure Stage 2',
        color: 'bg-red-100 text-red-800',
        description: 'You have Stage 2 hypertension.',
        recommendations: [
          'Urgent medical attention required',
          'Medication likely needed',
          'Immediate lifestyle modifications',
          'Regular monitoring and follow-up'
        ],
        urgent: true
      };
    } else {
      return {
        category: 'Hypertensive Crisis',
        color: 'bg-red-200 text-red-900',
        description: 'You may be experiencing a hypertensive crisis.',
        recommendations: [
          'Seek immediate medical attention',
          'Call emergency services if symptoms present',
          'Do not delay medical care',
          'This is a medical emergency'
        ],
        urgent: true
      };
    }
  };

  const addReading = () => {
    if (!systolic || !diastolic) return;

    const systolicNum = parseInt(systolic);
    const diastolicNum = parseInt(diastolic);

    if (systolicNum <= 0 || diastolicNum <= 0) return;

    const bpResult = getBPCategory(systolicNum, diastolicNum);
    const now = new Date();
    
    const newReading: BloodPressureReading = {
      id: Date.now().toString(),
      systolic: systolicNum,
      diastolic: diastolicNum,
      date: now.toLocaleDateString(),
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      category: bpResult.category,
      color: bpResult.color
    };

    setReadings(prev => [newReading, ...prev]);
    setResult(bpResult);
    setSystolic('');
    setDiastolic('');
  };

  const deleteReading = (id: string) => {
    setReadings(prev => prev.filter(reading => reading.id !== id));
  };

  const getAverageBP = () => {
    if (readings.length === 0) return null;
    
    const avgSystolic = readings.reduce((sum, reading) => sum + reading.systolic, 0) / readings.length;
    const avgDiastolic = readings.reduce((sum, reading) => sum + reading.diastolic, 0) / readings.length;
    
    return {
      systolic: Math.round(avgSystolic),
      diastolic: Math.round(avgDiastolic),
      category: getBPCategory(avgSystolic, avgDiastolic)
    };
  };

  const getTrend = () => {
    if (readings.length < 2) return 'insufficient';
    
    const recent = readings.slice(0, 3);
    const older = readings.slice(3, 6);
    
    if (recent.length < 2) return 'insufficient';
    
    const recentAvg = recent.reduce((sum, r) => sum + r.systolic, 0) / recent.length;
    const olderAvg = older.length > 0 ? older.reduce((sum, r) => sum + r.systolic, 0) / older.length : recentAvg;
    
    const difference = recentAvg - olderAvg;
    
    if (Math.abs(difference) < 5) return 'stable';
    return difference > 0 ? 'increasing' : 'decreasing';
  };

  const exportReadings = () => {
    const csvContent = [
      'Date,Time,Systolic,Diastolic,Category',
      ...readings.map(r => `${r.date},${r.time},${r.systolic},${r.diastolic},${r.category}`)
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `blood-pressure-readings-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const averageBP = getAverageBP();
  const trend = getTrend();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Blood Pressure Tracker
          </CardTitle>
          <CardDescription>
            Monitor your blood pressure readings and track trends over time
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="systolic">Systolic (Top Number)</Label>
              <Input
                id="systolic"
                type="number"
                value={systolic}
                onChange={(e) => setSystolic(e.target.value)}
                placeholder="120"
                min="50"
                max="300"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="diastolic">Diastolic (Bottom Number)</Label>
              <Input
                id="diastolic"
                type="number"
                value={diastolic}
                onChange={(e) => setDiastolic(e.target.value)}
                placeholder="80"
                min="30"
                max="200"
              />
            </div>
          </div>

          <Button onClick={addReading} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Reading
          </Button>
        </CardContent>
      </Card>

      {/* Current Result */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Current Reading Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">
                {systolic || readings[0]?.systolic}/{diastolic || readings[0]?.diastolic}
              </div>
              <Badge className={`${result.color} text-lg px-4 py-2`}>
                {result.category}
              </Badge>
            </div>

            {result.urgent && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <strong>Important:</strong> This reading indicates elevated blood pressure. 
                  Please consult with your healthcare provider promptly.
                </AlertDescription>
              </Alert>
            )}

            <p className="text-center text-muted-foreground">
              {result.description}
            </p>

            <div className="space-y-3">
              <h4 className="font-semibold">Recommendations:</h4>
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

      {/* Summary Stats */}
      {readings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Reading Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{readings.length}</div>
                <div className="text-sm text-blue-800">Total Readings</div>
              </div>
              
              {averageBP && (
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {averageBP.systolic}/{averageBP.diastolic}
                  </div>
                  <div className="text-sm text-green-800">Average BP</div>
                </div>
              )}
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <TrendingUp className="h-6 w-6 mx-auto mb-1 text-purple-600" />
                <div className="text-sm text-purple-800 capitalize">
                  {trend === 'increasing' ? 'Trending Up' : 
                   trend === 'decreasing' ? 'Trending Down' : 
                   trend === 'stable' ? 'Stable' : 'Insufficient Data'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reading History */}
      {readings.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Reading History</CardTitle>
              <Button variant="outline" size="sm" onClick={exportReadings}>
                Export CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {readings.map((reading) => (
                <div key={reading.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="text-lg font-semibold">
                      {reading.systolic}/{reading.diastolic}
                    </div>
                    <div className="text-sm text-gray-600">
                      {reading.date} at {reading.time}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={reading.color}>
                      {reading.category}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteReading(reading.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Blood Pressure Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Blood Pressure Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-2 bg-green-50 rounded">
              <span className="font-medium">Normal</span>
              <span className="text-sm">Less than 120/80 mmHg</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
              <span className="font-medium">Elevated</span>
              <span className="text-sm">120-129/less than 80 mmHg</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-orange-50 rounded">
              <span className="font-medium">High BP Stage 1</span>
              <span className="text-sm">130-139/80-89 mmHg</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-red-50 rounded">
              <span className="font-medium">High BP Stage 2</span>
              <span className="text-sm">140+/90+ mmHg</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-red-100 rounded">
              <span className="font-medium">Hypertensive Crisis</span>
              <span className="text-sm">180+/120+ mmHg</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Important:</strong> This tool is for informational purposes only. 
          Blood pressure can vary throughout the day and should be measured multiple times 
          for accuracy. Always consult with your healthcare provider for proper diagnosis 
          and treatment of high blood pressure.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default BloodPressureTracker;

