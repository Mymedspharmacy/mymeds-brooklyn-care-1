import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calculator, Info, AlertTriangle } from 'lucide-react';

interface BMIResult {
  bmi: number;
  category: string;
  color: string;
  description: string;
  recommendations: string[];
}

const BMICalculator: React.FC = () => {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');
  const [result, setResult] = useState<BMIResult | null>(null);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  const calculateBMI = () => {
    if (!height || !weight) return;

    const heightNum = parseFloat(height);
    const weightNum = parseFloat(weight);

    if (heightNum <= 0 || weightNum <= 0) return;

    let heightInMeters: number;
    let weightInKg: number;

    if (unit === 'metric') {
      heightInMeters = heightNum / 100; // Convert cm to meters
      weightInKg = weightNum;
    } else {
      // Convert feet and inches to meters
      const feet = Math.floor(heightNum);
      const inches = (heightNum - feet) * 10;
      heightInMeters = (feet * 12 + inches) * 0.0254; // Convert to meters
      weightInKg = weightNum * 0.453592; // Convert lbs to kg
    }

    const bmi = weightInKg / (heightInMeters * heightInMeters);
    const category = getBMICategory(bmi);
    
    setResult({
      bmi: Math.round(bmi * 10) / 10,
      ...category
    });
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) {
      return {
        category: 'Underweight',
        color: 'bg-blue-100 text-blue-800',
        description: 'Your BMI indicates you may be underweight.',
        recommendations: [
          'Consult with a healthcare provider to ensure proper nutrition',
          'Consider working with a dietitian to develop a healthy weight gain plan',
          'Focus on nutrient-dense foods to support healthy weight gain',
          'Regular exercise can help build muscle mass'
        ]
      };
    } else if (bmi >= 18.5 && bmi < 25) {
      return {
        category: 'Normal Weight',
        color: 'bg-green-100 text-green-800',
        description: 'Your BMI is within the healthy range.',
        recommendations: [
          'Maintain your current healthy lifestyle',
          'Continue regular physical activity',
          'Eat a balanced diet with plenty of fruits and vegetables',
          'Stay hydrated and get adequate sleep'
        ]
      };
    } else if (bmi >= 25 && bmi < 30) {
      return {
        category: 'Overweight',
        color: 'bg-yellow-100 text-yellow-800',
        description: 'Your BMI indicates you may be overweight.',
        recommendations: [
          'Consider making gradual changes to your diet and exercise routine',
          'Focus on portion control and balanced meals',
          'Aim for at least 150 minutes of moderate exercise per week',
          'Consult with a healthcare provider for personalized guidance'
        ]
      };
    } else {
      return {
        category: 'Obese',
        color: 'bg-red-100 text-red-800',
        description: 'Your BMI indicates obesity.',
        recommendations: [
          'Consult with a healthcare provider immediately',
          'Consider working with a registered dietitian',
          'Develop a comprehensive weight management plan',
          'Focus on sustainable lifestyle changes rather than quick fixes'
        ]
      };
    }
  };

  useEffect(() => {
    if (height && weight) {
      calculateBMI();
    }
  }, [height, weight, unit]);

  const resetCalculator = () => {
    setHeight('');
    setWeight('');
    setResult(null);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            BMI Calculator
          </CardTitle>
          <CardDescription>
            Calculate your Body Mass Index to assess your weight category
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Unit Selection */}
          <div className="flex gap-4">
            <Button
              variant={unit === 'metric' ? 'default' : 'outline'}
              onClick={() => setUnit('metric')}
              className="flex-1"
            >
              Metric (cm, kg)
            </Button>
            <Button
              variant={unit === 'imperial' ? 'default' : 'outline'}
              onClick={() => setUnit('imperial')}
              className="flex-1"
            >
              Imperial (ft/in, lbs)
            </Button>
          </div>

          {/* Input Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="height">
                Height {unit === 'metric' ? '(cm)' : '(ft.in - e.g., 5.8 for 5\'8")'}
              </Label>
              <Input
                id="height"
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder={unit === 'metric' ? '175' : '5.8'}
                min="0"
                step="0.1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">
                Weight {unit === 'metric' ? '(kg)' : '(lbs)'}
              </Label>
              <Input
                id="weight"
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder={unit === 'metric' ? '70' : '150'}
                min="0"
                step="0.1"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={calculateBMI} className="flex-1">
              Calculate BMI
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
              Your BMI Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">{result.bmi}</div>
              <Badge className={`${result.color} text-lg px-4 py-2`}>
                {result.category}
              </Badge>
            </div>

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

      {/* Disclaimer */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Disclaimer:</strong> BMI is a screening tool and may not be accurate for everyone. 
          It doesn't account for muscle mass, bone density, or body composition. 
          Always consult with a healthcare provider for personalized health advice.
        </AlertDescription>
      </Alert>

      {/* BMI Chart */}
      <Card>
        <CardHeader>
          <CardTitle>BMI Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
              <span className="font-medium">Underweight</span>
              <span className="text-sm">Below 18.5</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-green-50 rounded">
              <span className="font-medium">Normal Weight</span>
              <span className="text-sm">18.5 - 24.9</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
              <span className="font-medium">Overweight</span>
              <span className="text-sm">25.0 - 29.9</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-red-50 rounded">
              <span className="font-medium">Obese</span>
              <span className="text-sm">30.0 and above</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BMICalculator;

