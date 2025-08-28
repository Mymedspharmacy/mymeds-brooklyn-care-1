/**
 * Artillery load test processors
 * Custom functions for dynamic test data generation
 */

function generateRandomEmail() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  return `test-${timestamp}-${random}@example.com`;
}

function generateRandomName() {
  const firstNames = ['John', 'Jane', 'Mike', 'Sarah', 'David', 'Lisa', 'Tom', 'Emma'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller'];
  
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  
  return `${firstName} ${lastName}`;
}

function generateRandomPhone() {
  const areaCode = Math.floor(Math.random() * 900) + 100;
  const prefix = Math.floor(Math.random() * 900) + 100;
  const lineNumber = Math.floor(Math.random() * 9000) + 1000;
  
  return `(${areaCode}) ${prefix}-${lineNumber}`;
}

function generateRandomAddress() {
  const streetNumbers = [100, 200, 300, 400, 500, 600, 700, 800, 900];
  const streetNames = ['Main St', 'Oak Ave', 'Pine Rd', 'Elm St', 'Maple Dr', 'Cedar Ln'];
  const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia'];
  const states = ['NY', 'CA', 'IL', 'TX', 'AZ', 'PA'];
  const zipCodes = ['10001', '20001', '30001', '40001', '50001', '60001'];
  
  const streetNumber = streetNumbers[Math.floor(Math.random() * streetNumbers.length)];
  const streetName = streetNames[Math.floor(Math.random() * streetNames.length)];
  const city = cities[Math.floor(Math.random() * cities.length)];
  const state = states[Math.floor(Math.random() * states.length)];
  const zipCode = zipCodes[Math.floor(Math.random() * zipCodes.length)];
  
  return {
    street: `${streetNumber} ${streetName}`,
    city,
    state,
    zipCode
  };
}

function generateRandomProduct() {
  const productNames = [
    'Aspirin 325mg',
    'Ibuprofen 200mg',
    'Acetaminophen 500mg',
    'Vitamin D3 1000IU',
    'Omega-3 Fish Oil',
    'Probiotic Supplement',
    'Calcium Carbonate',
    'Iron Supplement'
  ];
  
  const descriptions = [
    'Relieves pain and reduces fever',
    'Anti-inflammatory medication',
    'Pain reliever and fever reducer',
    'Supports bone health',
    'Heart health supplement',
    'Supports digestive health',
    'Bone health supplement',
    'Iron deficiency treatment'
  ];
  
  const randomIndex = Math.floor(Math.random() * productNames.length);
  
  return {
    name: productNames[randomIndex],
    description: descriptions[randomIndex],
    price: (Math.random() * 50 + 5).toFixed(2),
    stock: Math.floor(Math.random() * 100) + 1
  };
}

function generateRandomAppointment() {
  const appointmentTypes = ['consultation', 'prescription_review', 'vaccination', 'health_screening'];
  const timeSlots = ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'];
  
  // Generate a random date within the next 30 days
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 30);
  
  const randomDate = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
  const formattedDate = randomDate.toISOString().split('T')[0];
  
  return {
    date: formattedDate,
    time: timeSlots[Math.floor(Math.random() * timeSlots.length)],
    type: appointmentTypes[Math.floor(Math.random() * appointmentTypes.length)],
    notes: 'Load test appointment'
  };
}

function generateRandomPrescription() {
  const medications = [
    'Lisinopril 10mg',
    'Metformin 500mg',
    'Atorvastatin 20mg',
    'Amlodipine 5mg',
    'Omeprazole 20mg',
    'Losartan 50mg',
    'Simvastatin 20mg',
    'Hydrochlorothiazide 25mg'
  ];
  
  const dosages = ['Once daily', 'Twice daily', 'Three times daily', 'As needed'];
  const instructions = [
    'Take with food',
    'Take on empty stomach',
    'Take in the morning',
    'Take at bedtime',
    'Take with plenty of water'
  ];
  
  return {
    medication: medications[Math.floor(Math.random() * medications.length)],
    dosage: dosages[Math.floor(Math.random() * dosages.length)],
    instructions: instructions[Math.floor(Math.random() * instructions.length)]
  };
}

// Export functions for use in Artillery scenarios
module.exports = {
  generateRandomEmail,
  generateRandomName,
  generateRandomPhone,
  generateRandomAddress,
  generateRandomProduct,
  generateRandomAppointment,
  generateRandomPrescription
};




