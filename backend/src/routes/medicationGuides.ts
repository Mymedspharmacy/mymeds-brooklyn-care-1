import { Router, Request, Response } from 'express';
import { z } from 'zod';

const router = Router();

// Medication Guide Schema
const medicationGuideSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  icon: z.string(),
  content: z.string(),
  lastUpdated: z.string(),
  tags: z.array(z.string()).optional(),
  relatedMedications: z.array(z.string()).optional(),
  warnings: z.array(z.string()).optional(),
  dosage: z.string().optional(),
  sideEffects: z.array(z.string()).optional(),
  interactions: z.array(z.string()).optional()
});

// Sample medication guides data
const medicationGuides = [
  {
    id: 'diabetes',
    title: 'Diabetes Management',
    description: 'Complete guide to diabetes medications and management',
    category: 'Chronic Conditions',
    icon: 'Heart',
    content: `
# Diabetes Management Guide

## Overview
Diabetes is a chronic condition that affects how your body processes glucose (sugar). Proper management involves medication, diet, exercise, and regular monitoring.

## Common Diabetes Medications

### Metformin
- **How it works**: Reduces glucose production in the liver and improves insulin sensitivity
- **Dosage**: Usually starts at 500mg twice daily, can be increased to 2000mg daily
- **Side effects**: Nausea, diarrhea, metallic taste
- **Important**: Take with food to reduce stomach upset

### Sulfonylureas (Glipizide, Glyburide)
- **How it works**: Stimulates pancreas to produce more insulin
- **Dosage**: Varies by medication, usually once or twice daily
- **Side effects**: Low blood sugar (hypoglycemia), weight gain
- **Important**: Monitor blood sugar closely, especially when starting

### Insulin
- **Types**: Rapid-acting, short-acting, intermediate-acting, long-acting
- **Administration**: Injection or insulin pump
- **Storage**: Refrigerate unopened vials, room temperature for opened vials
- **Important**: Rotate injection sites to prevent lipodystrophy

## Blood Sugar Monitoring
- **Target ranges**: 
  - Before meals: 80-130 mg/dL
  - 2 hours after meals: Less than 180 mg/dL
  - A1C: Less than 7% (or as recommended by your doctor)
- **Frequency**: As directed by your healthcare provider
- **Record keeping**: Log readings, medications, meals, and exercise

## Lifestyle Management
- **Diet**: Focus on complex carbohydrates, lean proteins, healthy fats
- **Exercise**: 150 minutes of moderate activity per week
- **Weight management**: Even 5-10% weight loss can improve blood sugar control
- **Stress management**: Stress can raise blood sugar levels

## Warning Signs
- **High blood sugar**: Increased thirst, frequent urination, fatigue, blurred vision
- **Low blood sugar**: Shakiness, sweating, confusion, rapid heartbeat
- **Emergency**: Seek immediate medical attention for severe symptoms

## Regular Check-ups
- **A1C test**: Every 3-6 months
- **Eye exam**: Annual comprehensive eye exam
- **Foot exam**: Daily self-exam, annual professional exam
- **Kidney function**: Annual urine and blood tests
- **Blood pressure**: Regular monitoring, target less than 130/80 mmHg

## Emergency Contacts
- **Primary care physician**: [Your doctor's contact]
- **Endocrinologist**: [Specialist contact]
- **Emergency**: 911 for severe symptoms
- **24/7 pharmacy**: [Pharmacy contact]
    `,
    lastUpdated: '2024-01-15',
    tags: ['diabetes', 'blood sugar', 'insulin', 'metformin'],
    relatedMedications: ['Metformin', 'Glipizide', 'Insulin', 'Sitagliptin'],
    warnings: [
      'Always monitor blood sugar levels as directed',
      'Never skip meals when taking diabetes medications',
      'Carry emergency glucose tablets or gel',
      'Inform all healthcare providers about diabetes medications'
    ],
    dosage: 'Varies by medication and individual needs',
    sideEffects: ['Hypoglycemia', 'Weight gain', 'Nausea', 'Diarrhea'],
    interactions: ['Alcohol', 'Certain antibiotics', 'Beta-blockers']
  },
  {
    id: 'hypertension',
    title: 'Hypertension Treatment',
    description: 'Understanding blood pressure medications',
    category: 'Chronic Conditions',
    icon: 'Heart',
    content: `
# Hypertension Treatment Guide

## Overview
Hypertension (high blood pressure) is a common condition that can lead to serious health problems if not properly managed. Treatment typically involves lifestyle changes and medication.

## Common Blood Pressure Medications

### ACE Inhibitors (Lisinopril, Enalapril)
- **How it works**: Blocks enzyme that causes blood vessels to narrow
- **Dosage**: Usually once daily, can be increased as needed
- **Side effects**: Dry cough, dizziness, elevated potassium
- **Important**: Avoid potassium supplements unless directed by doctor

### ARBs (Losartan, Valsartan)
- **How it works**: Blocks receptors that cause blood vessels to narrow
- **Dosage**: Usually once daily
- **Side effects**: Dizziness, fatigue, elevated potassium
- **Important**: Alternative to ACE inhibitors if cough develops

### Diuretics (Hydrochlorothiazide, Furosemide)
- **How it works**: Helps kidneys remove excess sodium and water
- **Dosage**: Usually once daily in the morning
- **Side effects**: Increased urination, low potassium, dizziness
- **Important**: Take in the morning to avoid nighttime bathroom trips

### Beta-Blockers (Metoprolol, Atenolol)
- **How it works**: Reduces heart rate and force of heart contractions
- **Dosage**: Usually once or twice daily
- **Side effects**: Fatigue, cold hands/feet, sleep problems
- **Important**: Don't stop suddenly - can cause rebound hypertension

### Calcium Channel Blockers (Amlodipine, Diltiazem)
- **How it works**: Relaxes blood vessels and reduces heart workload
- **Dosage**: Usually once daily
- **Side effects**: Swelling in ankles/feet, dizziness, flushing
- **Important**: Take with food to reduce stomach upset

## Blood Pressure Monitoring
- **Target**: Less than 130/80 mmHg (or as recommended by your doctor)
- **Frequency**: As directed by your healthcare provider
- **Home monitoring**: Use validated devices, measure at same time daily
- **Record keeping**: Log readings, medications, and any symptoms

## Lifestyle Management
- **DASH diet**: Rich in fruits, vegetables, whole grains, lean proteins
- **Sodium restriction**: Less than 2,300mg daily (ideally less than 1,500mg)
- **Exercise**: 150 minutes of moderate activity per week
- **Weight management**: Even small weight loss can lower blood pressure
- **Limit alcohol**: No more than 1 drink per day for women, 2 for men
- **Quit smoking**: Smoking raises blood pressure and damages blood vessels

## Warning Signs
- **Severe hypertension**: Headache, shortness of breath, nosebleeds
- **Medication side effects**: Persistent cough, swelling, dizziness
- **Emergency**: Seek immediate medical attention for severe symptoms

## Regular Check-ups
- **Blood pressure monitoring**: Regular visits to healthcare provider
- **Blood tests**: Monitor kidney function, electrolytes, cholesterol
- **Heart monitoring**: EKG, echocardiogram as recommended
- **Eye exam**: Annual exam to check for hypertensive retinopathy

## Emergency Contacts
- **Primary care physician**: [Your doctor's contact]
- **Cardiologist**: [Specialist contact]
- **Emergency**: 911 for severe symptoms
- **24/7 pharmacy**: [Pharmacy contact]
    `,
    lastUpdated: '2024-01-10',
    tags: ['hypertension', 'blood pressure', 'heart health', 'cardiovascular'],
    relatedMedications: ['Lisinopril', 'Losartan', 'Hydrochlorothiazide', 'Amlodipine'],
    warnings: [
      'Monitor blood pressure regularly',
      'Take medications as prescribed',
      'Report any side effects to your doctor',
      'Don\'t stop medications without doctor approval'
    ],
    dosage: 'Varies by medication and individual needs',
    sideEffects: ['Dizziness', 'Fatigue', 'Dry cough', 'Swelling'],
    interactions: ['NSAIDs', 'Potassium supplements', 'Alcohol']
  },
  {
    id: 'antibiotics',
    title: 'Antibiotic Safety',
    description: 'Proper use and safety of antibiotics',
    category: 'Medication Safety',
    icon: 'Pill',
    content: `
# Antibiotic Safety Guide

## Overview
Antibiotics are powerful medications used to treat bacterial infections. Proper use is essential to ensure effectiveness and prevent antibiotic resistance.

## Common Antibiotics

### Penicillins (Amoxicillin, Penicillin VK)
- **How it works**: Kills bacteria by interfering with cell wall formation
- **Common uses**: Strep throat, ear infections, skin infections
- **Dosage**: Usually 2-3 times daily, take with or without food
- **Side effects**: Nausea, diarrhea, rash, allergic reactions
- **Important**: Complete full course even if feeling better

### Cephalosporins (Cephalexin, Cefdinir)
- **How it works**: Similar to penicillins, kills bacteria
- **Common uses**: Respiratory infections, skin infections, UTIs
- **Dosage**: Usually 2-3 times daily
- **Side effects**: Nausea, diarrhea, rash, yeast infections
- **Important**: May cause false positive on urine glucose tests

### Macrolides (Azithromycin, Erythromycin)
- **How it works**: Stops bacteria from making proteins
- **Common uses**: Respiratory infections, skin infections
- **Dosage**: Usually once daily for azithromycin
- **Side effects**: Nausea, stomach pain, diarrhea
- **Important**: Take with food to reduce stomach upset

### Fluoroquinolones (Ciprofloxacin, Levofloxacin)
- **How it works**: Interferes with bacterial DNA replication
- **Common uses**: UTIs, respiratory infections, skin infections
- **Dosage**: Usually once or twice daily
- **Side effects**: Nausea, diarrhea, dizziness, tendon problems
- **Important**: Avoid dairy products and antacids within 2 hours

## Proper Antibiotic Use
- **Complete the course**: Take all prescribed doses, even if symptoms improve
- **Timing**: Take at regular intervals as prescribed
- **Food interactions**: Follow instructions about taking with/without food
- **Storage**: Keep in original container, store as directed
- **Don't share**: Never share antibiotics with others

## Side Effects Management
- **Nausea**: Take with food, avoid spicy foods
- **Diarrhea**: Eat bland foods, stay hydrated
- **Yeast infections**: Use probiotics, eat yogurt
- **Allergic reactions**: Stop medication immediately, seek medical attention

## Antibiotic Resistance Prevention
- **Only when needed**: Don't demand antibiotics for viral infections
- **Proper disposal**: Don't flush unused antibiotics
- **Hand hygiene**: Wash hands frequently to prevent infections
- **Vaccinations**: Stay up to date on recommended vaccines

## Warning Signs
- **Allergic reaction**: Rash, hives, swelling, difficulty breathing
- **Severe side effects**: Severe diarrhea, abdominal pain, fever
- **Emergency**: Seek immediate medical attention for severe symptoms

## When to Call Your Doctor
- **Allergic reactions**: Any signs of allergy
- **Severe side effects**: Persistent vomiting, severe diarrhea
- **No improvement**: Symptoms worsen or don't improve after 3 days
- **New symptoms**: Fever, rash, or other concerning symptoms

## Emergency Contacts
- **Primary care physician**: [Your doctor's contact]
- **Emergency**: 911 for severe allergic reactions
- **24/7 pharmacy**: [Pharmacy contact]
    `,
    lastUpdated: '2024-01-20',
    tags: ['antibiotics', 'infection', 'bacterial', 'resistance'],
    relatedMedications: ['Amoxicillin', 'Cephalexin', 'Azithromycin', 'Ciprofloxacin'],
    warnings: [
      'Complete the full course of antibiotics',
      'Don\'t share antibiotics with others',
      'Report any allergic reactions immediately',
      'Take exactly as prescribed'
    ],
    dosage: 'Varies by medication and infection type',
    sideEffects: ['Nausea', 'Diarrhea', 'Rash', 'Yeast infections'],
    interactions: ['Dairy products', 'Antacids', 'Iron supplements']
  },
  {
    id: 'pain-management',
    title: 'Pain Management',
    description: 'Safe use of pain medications',
    category: 'Medication Safety',
    icon: 'Pill',
    content: `
# Pain Management Guide

## Overview
Pain management involves using medications safely and effectively to control pain while minimizing risks and side effects.

## Common Pain Medications

### Acetaminophen (Tylenol)
- **How it works**: Blocks pain signals in the brain
- **Common uses**: Headaches, fever, mild to moderate pain
- **Dosage**: 325-650mg every 4-6 hours, max 4,000mg daily
- **Side effects**: Liver damage with overdose
- **Important**: Check other medications for acetaminophen content

### NSAIDs (Ibuprofen, Naproxen, Aspirin)
- **How it works**: Reduces inflammation and blocks pain signals
- **Common uses**: Arthritis, muscle pain, headaches, fever
- **Dosage**: Varies by medication, usually 2-3 times daily
- **Side effects**: Stomach upset, ulcers, kidney problems
- **Important**: Take with food, avoid if you have stomach problems

### Opioids (Codeine, Hydrocodone, Oxycodone)
- **How it works**: Blocks pain signals in the brain and spinal cord
- **Common uses**: Severe pain, post-surgical pain
- **Dosage**: As prescribed, usually every 4-6 hours
- **Side effects**: Drowsiness, constipation, nausea, addiction risk
- **Important**: Use only as prescribed, store securely

### Muscle Relaxants (Cyclobenzaprine, Methocarbamol)
- **How it works**: Relaxes muscle spasms
- **Common uses**: Muscle spasms, back pain
- **Dosage**: Usually 2-3 times daily
- **Side effects**: Drowsiness, dizziness, dry mouth
- **Important**: Avoid alcohol, may impair driving

## Safe Pain Management
- **Start low, go slow**: Begin with lowest effective dose
- **Non-drug options**: Heat/cold therapy, physical therapy, relaxation
- **Regular schedule**: Take medications at regular intervals
- **Pain diary**: Track pain levels, medications, and effectiveness

## Side Effects Management
- **Constipation**: Increase fiber, fluids, consider stool softeners
- **Nausea**: Take with food, use anti-nausea medications if prescribed
- **Drowsiness**: Avoid driving, don't mix with alcohol
- **Dry mouth**: Use sugar-free gum, frequent sips of water

## Opioid Safety
- **Storage**: Keep in locked cabinet, away from children
- **Disposal**: Return unused medications to pharmacy
- **Signs of misuse**: Taking more than prescribed, seeking early refills
- **Withdrawal**: Don't stop suddenly, taper under medical supervision

## Warning Signs
- **Overdose**: Slow breathing, extreme drowsiness, unresponsiveness
- **Allergic reaction**: Rash, swelling, difficulty breathing
- **Severe side effects**: Severe constipation, confusion, falls
- **Emergency**: Call 911 for overdose or severe reactions

## When to Seek Help
- **Pain not controlled**: Pain persists despite medication
- **Side effects**: Unmanageable side effects
- **Addiction concerns**: Taking more than prescribed, seeking early refills
- **New symptoms**: Fever, severe headache, chest pain

## Alternative Therapies
- **Physical therapy**: Exercise, stretching, strengthening
- **Heat/cold therapy**: Ice packs, heating pads
- **Relaxation techniques**: Deep breathing, meditation, yoga
- **Acupuncture**: May help with certain types of pain

## Emergency Contacts
- **Primary care physician**: [Your doctor's contact]
- **Pain specialist**: [Specialist contact]
- **Emergency**: 911 for overdose or severe reactions
- **24/7 pharmacy**: [Pharmacy contact]
    `,
    lastUpdated: '2024-01-25',
    tags: ['pain', 'analgesics', 'opioids', 'NSAIDs'],
    relatedMedications: ['Acetaminophen', 'Ibuprofen', 'Hydrocodone', 'Cyclobenzaprine'],
    warnings: [
      'Use opioids only as prescribed',
      'Store medications securely',
      'Don\'t mix with alcohol',
      'Report any signs of misuse'
    ],
    dosage: 'Varies by medication and pain severity',
    sideEffects: ['Drowsiness', 'Constipation', 'Nausea', 'Dizziness'],
    interactions: ['Alcohol', 'Other sedatives', 'Blood thinners']
  }
];

// GET /api/medication-guides - Get all medication guides
router.get('/', async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      guides: medicationGuides
    });
  } catch (error) {
    console.error('Error fetching medication guides:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch medication guides'
    });
  }
});

// GET /api/medication-guides/:id - Get specific medication guide
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const guide = medicationGuides.find(g => g.id === id);
    
    if (!guide) {
      return res.status(404).json({
        success: false,
        error: 'Medication guide not found'
      });
    }
    
    res.json({
      success: true,
      guide: guide
    });
  } catch (error) {
    console.error('Error fetching medication guide:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch medication guide'
    });
  }
});

// POST /api/medication-guides - Create new medication guide (admin only)
router.post('/', async (req: Request, res: Response) => {
  try {
    const guideData = medicationGuideSchema.parse(req.body);
    
    // Check if guide already exists
    const existingGuide = medicationGuides.find(g => g.id === guideData.id);
    if (existingGuide) {
      return res.status(400).json({
        success: false,
        error: 'Medication guide with this ID already exists'
      });
    }
    
    medicationGuides.push(guideData);
    
    res.status(201).json({
      success: true,
      guide: guideData,
      message: 'Medication guide created successfully'
    });
  } catch (error) {
    console.error('Error creating medication guide:', error);
    res.status(400).json({
      success: false,
      error: 'Invalid medication guide data'
    });
  }
});

// PUT /api/medication-guides/:id - Update medication guide (admin only)
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const guideData = medicationGuideSchema.parse(req.body);
    
    const guideIndex = medicationGuides.findIndex(g => g.id === id);
    if (guideIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Medication guide not found'
      });
    }
    
    medicationGuides[guideIndex] = { ...guideData, id };
    
    res.json({
      success: true,
      guide: medicationGuides[guideIndex],
      message: 'Medication guide updated successfully'
    });
  } catch (error) {
    console.error('Error updating medication guide:', error);
    res.status(400).json({
      success: false,
      error: 'Invalid medication guide data'
    });
  }
});

// DELETE /api/medication-guides/:id - Delete medication guide (admin only)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const guideIndex = medicationGuides.findIndex(g => g.id === id);
    
    if (guideIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Medication guide not found'
      });
    }
    
    medicationGuides.splice(guideIndex, 1);
    
    res.json({
      success: true,
      message: 'Medication guide deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting medication guide:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete medication guide'
    });
  }
});

export default router;
