export type Division = 'U-13' | 'U-15' | 'U-17' | 'U-19' | 'Senior';
export type Sector = "Men's Singles" | "Women's Singles" | "Men's Doubles" | "Women's Doubles" | "Mixed Doubles";
export type Status = 'Fit' | 'Injured' | 'Recovery';
export type AlertLevel = 'Green' | 'Yellow' | 'Red';

export interface Athlete {
  id: string;
  name: string;
  division: Division;
  sector: Sector;
  weight: number;
  targetWeight: number;
  status: Status;
  hydrationLevel: number; // percentage
  sleepHours: number;
  rpe: number; // 1-10
  imageUrl: string;
  compliance: number; // percentage
  // New Comprehensive Fields
  placeOfBirth: string;
  dateOfBirth: string;
  age: number;
  gender: 'Laki-laki' | 'Perempuan';
  height: number;
  armCircumference: number;
  category: string;
  idealWeightRange: string;
  bodyFatCaliper: number;
  bodyFatInBody: number;
  targetBodyFat: number;
  skeletalMuscleMass: number;
  bmr: number;
  exerciseCalories: number;
  presentEnergy: number;
  dailyCalories: number;
  foodAllergies: string[];
  foodPreferences: string[];
  supplements: string[];
  bloodLab: {
    hb: number;
    ferritin: number;
    vitD: number;
  };
  sweatRate: number;
}

export const athletes: Athlete[] = [
  {
    id: '1',
    name: 'Jonatan Christie',
    division: 'Senior',
    sector: "Men's Singles",
    weight: 76.5,
    targetWeight: 76.0,
    status: 'Fit',
    hydrationLevel: 95,
    sleepHours: 8.5,
    rpe: 6,
    imageUrl: 'https://picsum.photos/seed/jonatan/200/200',
    compliance: 98,
    placeOfBirth: 'Jakarta',
    dateOfBirth: '15 Sep 1997',
    age: 28,
    gender: 'Laki-laki',
    height: 179,
    armCircumference: 32,
    category: 'Ideal (Atlet)',
    idealWeightRange: '74 - 78 kg',
    bodyFatCaliper: 9.5,
    bodyFatInBody: 10.2,
    targetBodyFat: 9.0,
    skeletalMuscleMass: 38.5,
    bmr: 1850,
    exerciseCalories: 1200,
    presentEnergy: 3050,
    dailyCalories: 3200,
    foodAllergies: ['Seafood (Kerang)'],
    foodPreferences: ['Tinggi Protein', 'Rendah Gula'],
    supplements: ['Whey Isolate', 'Creatine', 'Omega-3', 'Vit C'],
    bloodLab: { hb: 15.2, ferritin: 120, vitD: 45 },
    sweatRate: 1.2
  },
  {
    id: '2',
    name: 'Anthony Sinisuka Ginting',
    division: 'Senior',
    sector: "Men's Singles",
    weight: 66.2,
    targetWeight: 66.0,
    status: 'Recovery',
    hydrationLevel: 88,
    sleepHours: 7.5,
    rpe: 4,
    imageUrl: 'https://picsum.photos/seed/ginting/200/200',
    compliance: 92,
    placeOfBirth: 'Cimahi',
    dateOfBirth: '20 Okt 1996',
    age: 29,
    gender: 'Laki-laki',
    height: 171,
    armCircumference: 29,
    category: 'Ideal (Atlet)',
    idealWeightRange: '64 - 68 kg',
    bodyFatCaliper: 8.8,
    bodyFatInBody: 9.5,
    targetBodyFat: 8.5,
    skeletalMuscleMass: 33.2,
    bmr: 1650,
    exerciseCalories: 1000,
    presentEnergy: 2650,
    dailyCalories: 2800,
    foodAllergies: [],
    foodPreferences: ['Alergi Laktosa (Ringan)'],
    supplements: ['BCAA', 'Isotonic', 'Multivitamin'],
    bloodLab: { hb: 14.8, ferritin: 95, vitD: 38 },
    sweatRate: 1.4
  },
  {
    id: '3',
    name: 'Kevin Sanjaya',
    division: 'Senior',
    sector: "Men's Doubles",
    weight: 65.0,
    targetWeight: 64.5,
    status: 'Fit',
    hydrationLevel: 92,
    sleepHours: 8.0,
    rpe: 7,
    imageUrl: 'https://picsum.photos/seed/kevin/200/200',
    compliance: 85,
    placeOfBirth: 'Banyuwangi',
    dateOfBirth: '02 Agu 1995',
    age: 30,
    gender: 'Laki-laki',
    height: 170,
    armCircumference: 28.5,
    category: 'Ideal (Atlet)',
    idealWeightRange: '63 - 67 kg',
    bodyFatCaliper: 10.1,
    bodyFatInBody: 11.0,
    targetBodyFat: 9.5,
    skeletalMuscleMass: 32.0,
    bmr: 1620,
    exerciseCalories: 1100,
    presentEnergy: 2720,
    dailyCalories: 2700,
    foodAllergies: ['Kacang Tanah'],
    foodPreferences: ['Pedas'],
    supplements: ['Whey Protein', 'Pre-workout'],
    bloodLab: { hb: 15.0, ferritin: 110, vitD: 42 },
    sweatRate: 1.1
  },
  {
    id: '4',
    name: 'Gregoria Mariska',
    division: 'Senior',
    sector: "Women's Singles",
    weight: 58.5,
    targetWeight: 58.0,
    status: 'Fit',
    hydrationLevel: 90,
    sleepHours: 8.2,
    rpe: 6,
    imageUrl: 'https://picsum.photos/seed/gregoria/200/200',
    compliance: 95,
    placeOfBirth: 'Wonogiri',
    dateOfBirth: '11 Agu 1999',
    age: 26,
    gender: 'Perempuan',
    height: 166,
    armCircumference: 25,
    category: 'Ideal (Atlet)',
    idealWeightRange: '56 - 60 kg',
    bodyFatCaliper: 16.5,
    bodyFatInBody: 17.2,
    targetBodyFat: 16.0,
    skeletalMuscleMass: 24.5,
    bmr: 1350,
    exerciseCalories: 900,
    presentEnergy: 2250,
    dailyCalories: 2300,
    foodAllergies: [],
    foodPreferences: ['Banyak Sayur'],
    supplements: ['Iron', 'Calcium', 'Vit D', 'Whey Isolate'],
    bloodLab: { hb: 13.5, ferritin: 60, vitD: 32 },
    sweatRate: 0.9
  },
  {
    id: '5',
    name: 'Alwi Farhan',
    division: 'U-19',
    sector: "Men's Singles",
    weight: 68.0,
    targetWeight: 70.0,
    status: 'Fit',
    hydrationLevel: 85,
    sleepHours: 7.0,
    rpe: 8,
    imageUrl: 'https://picsum.photos/seed/alwi/200/200',
    compliance: 78,
    placeOfBirth: 'Surakarta',
    dateOfBirth: '12 Mei 2005',
    age: 20,
    gender: 'Laki-laki',
    height: 175,
    armCircumference: 27,
    category: 'Underweight (Atlet)',
    idealWeightRange: '69 - 73 kg',
    bodyFatCaliper: 8.0,
    bodyFatInBody: 8.5,
    targetBodyFat: 9.0,
    skeletalMuscleMass: 34.0,
    bmr: 1700,
    exerciseCalories: 1300,
    presentEnergy: 3000,
    dailyCalories: 3400, // Surplus for bulking
    foodAllergies: [],
    foodPreferences: ['Tinggi Kalori'],
    supplements: ['Mass Gainer', 'Creatine'],
    bloodLab: { hb: 14.5, ferritin: 85, vitD: 40 },
    sweatRate: 1.3
  },
  {
    id: '6',
    name: 'Christian Adinata',
    division: 'Senior',
    sector: "Men's Singles",
    weight: 72.1,
    targetWeight: 71.5,
    status: 'Injured',
    hydrationLevel: 96,
    sleepHours: 9.0,
    rpe: 2,
    imageUrl: 'https://picsum.photos/seed/christian/200/200',
    compliance: 100,
    placeOfBirth: 'Pati',
    dateOfBirth: '16 Jun 2001',
    age: 24,
    gender: 'Laki-laki',
    height: 183,
    armCircumference: 30,
    category: 'Ideal (Atlet)',
    idealWeightRange: '70 - 75 kg',
    bodyFatCaliper: 11.0,
    bodyFatInBody: 11.8,
    targetBodyFat: 10.5,
    skeletalMuscleMass: 36.2,
    bmr: 1800,
    exerciseCalories: 400, // Injured, low exercise
    presentEnergy: 2200,
    dailyCalories: 2100, // Deficit to prevent fat gain
    foodAllergies: [],
    foodPreferences: ['Anti-inflamasi'],
    supplements: ['Collagen', 'Omega-3', 'Vit C', 'Calcium'],
    bloodLab: { hb: 15.5, ferritin: 105, vitD: 50 },
    sweatRate: 0.8
  },
];

export const weightHistory = [
  { date: 'Jan', weight: 76.8, target: 76.0 },
  { date: 'Apr', weight: 76.6, target: 76.0 },
  { date: 'Jul', weight: 76.5, target: 76.0 },
  { date: 'Oct', weight: 76.7, target: 76.0 },
  { date: 'Jan', weight: 76.4, target: 76.0 },
  { date: 'Apr', weight: 76.5, target: 76.0 },
  { date: 'Jul', weight: 76.5, target: 76.0 },
];

export const nutritionBalance = [
  { subject: 'Protein', A: 120, fullMark: 150 },
  { subject: 'Carbs', A: 98, fullMark: 150 },
  { subject: 'Fats', A: 86, fullMark: 150 },
  { subject: 'Hydration', A: 99, fullMark: 150 },
  { subject: 'Vitamins', A: 85, fullMark: 150 },
  { subject: 'Minerals', A: 65, fullMark: 150 },
];
