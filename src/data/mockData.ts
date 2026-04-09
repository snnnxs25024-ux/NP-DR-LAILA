export type Division = 'U-13' | 'U-15' | 'U-17' | 'U-19' | 'Senior';
export type Sector = "Tunggal Putra" | "Tunggal Putri" | "Ganda Putra" | "Ganda Putri" | "Ganda Campuran";
export type Status = 'Fit' | 'Cedera' | 'Pemulihan';
export type AlertLevel = 'Hijau' | 'Kuning' | 'Merah';

export interface AssessmentEntry {
  date: string;
  bfInBody: number;
  bicep: number;
  tricep: number;
  subscapula: number;
  abdominal: number;
  total: number;
  bfCaliper: number;
  weight: number;
  lbm: number;
  fm: number;
}

export interface NoteEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  category: 'Coaching' | 'Nutrition' | 'Behavior' | 'Other';
}

export interface InjuryEntry {
  id: string;
  date: string;
  type: string;
  severity: 'Ringan' | 'Sedang' | 'Berat';
  status: 'Active' | 'Recovered';
  notes: string;
}

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
  armCircumferenceCategory: string;
  armCircumferenceRangeBB: string;
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
  // New Contact & Logistics Fields
  whatsapp: string;
  email: string;
  bloodType: string;
  dominantHand: 'Kanan' | 'Kidal';
  joinYear: number;
  apparelSize: {
    shirt: string;
    shoe: number;
  };
  socialMedia: {
    instagram: string;
  };
  emergencyContact: {
    name: string;
    relation: string;
    phone: string;
  };
  assessmentHistory: AssessmentEntry[];
  notes: NoteEntry[];
  injuries: InjuryEntry[];
}

export const athletes: Athlete[] = [
  {
    id: '1',
    name: 'Jonatan Christie',
    division: 'Senior',
    sector: "Tunggal Putra",
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
    armCircumferenceCategory: 'BESAR',
    armCircumferenceRangeBB: '70-79',
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
    sweatRate: 1.2,
    whatsapp: '+6281234567890',
    email: 'jonatan.c@pbsi.id',
    bloodType: 'O',
    dominantHand: 'Kanan',
    joinYear: 2013,
    apparelSize: { shirt: 'L', shoe: 43 },
    socialMedia: { instagram: '@jonatanchristieofficial' },
    emergencyContact: { name: 'Marlanti', relation: 'Ibu', phone: '+628111222333' },
    assessmentHistory: [
      {
        date: '08 APR 26',
        bfInBody: 10.1,
        bicep: 3,
        tricep: 5,
        subscapula: 6.8,
        abdominal: 5.8,
        total: 20.6,
        bfCaliper: 9.2,
        weight: 76.2,
        lbm: 69.2,
        fm: 7.0
      },
      {
        date: '15 OKT 25',
        bfInBody: 10.2,
        bicep: 3,
        tricep: 5,
        subscapula: 7,
        abdominal: 6,
        total: 21,
        bfCaliper: 9.5,
        weight: 76.5,
        lbm: 69.2,
        fm: 7.3
      }
    ],
    notes: [
      { id: 'n1', date: '01 APR 26', title: 'Fokus Power', content: 'Latihan beban fokus pada ledakan otot kaki ditingkatkan.', category: 'Coaching' },
      { id: 'n2', date: '05 APR 26', title: 'Diet Karbo', content: 'Asupan karbohidrat kompleks ditingkatkan sebelum sesi latihan sore.', category: 'Nutrition' }
    ],
    injuries: []
  },
  {
    id: '2',
    name: 'Anthony Sinisuka Ginting',
    division: 'Senior',
    sector: "Tunggal Putra",
    weight: 66.2,
    targetWeight: 66.0,
    status: 'Pemulihan',
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
    armCircumferenceCategory: 'SEDANG',
    armCircumferenceRangeBB: '60-69',
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
    sweatRate: 1.4,
    whatsapp: '+6281298765432',
    email: 'anthony.g@pbsi.id',
    bloodType: 'A',
    dominantHand: 'Kanan',
    joinYear: 2014,
    apparelSize: { shirt: 'M', shoe: 41 },
    socialMedia: { instagram: '@sinisukanthony' },
    emergencyContact: { name: 'Lucia', relation: 'Ibu', phone: '+62822333444' },
    assessmentHistory: [
      {
        date: '08 APR 26',
        bfInBody: 9.4,
        bicep: 2,
        tricep: 4,
        subscapula: 5.8,
        abdominal: 4.8,
        total: 16.6,
        bfCaliper: 8.6,
        weight: 66.0,
        lbm: 60.3,
        fm: 5.7
      },
      {
        date: '10 OKT 25',
        bfInBody: 9.5,
        bicep: 2,
        tricep: 4,
        subscapula: 6,
        abdominal: 5,
        total: 17,
        bfCaliper: 8.8,
        weight: 66.2,
        lbm: 60.4,
        fm: 5.8
      }
    ],
    notes: [],
    injuries: [
      { id: 'i1', date: '02 APR 26', type: 'Strain Hamstring', severity: 'Sedang', status: 'Active', notes: 'Terjadi saat sesi latihan sprint. Sedang dalam fase fisioterapi.' }
    ]
  },
  {
    id: '3',
    name: 'Kevin Sanjaya',
    division: 'Senior',
    sector: "Ganda Putra",
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
    armCircumferenceCategory: 'SEDANG',
    armCircumferenceRangeBB: '60-69',
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
    sweatRate: 1.1,
    whatsapp: '+6281345678901',
    email: 'kevin.s@pbsi.id',
    bloodType: 'B',
    dominantHand: 'Kanan',
    joinYear: 2013,
    apparelSize: { shirt: 'M', shoe: 41 },
    socialMedia: { instagram: '@kevin_sanjaya' },
    emergencyContact: { name: 'Sugiarto', relation: 'Ayah', phone: '+62833444555' },
    assessmentHistory: [
      {
        date: '08 APR 26',
        bfInBody: 10.8,
        bicep: 3,
        tricep: 5.8,
        subscapula: 7.8,
        abdominal: 6.8,
        total: 23.4,
        bfCaliper: 9.8,
        weight: 64.8,
        lbm: 58.4,
        fm: 6.4
      },
      {
        date: '05 OKT 25',
        bfInBody: 11.0,
        bicep: 3,
        tricep: 6,
        subscapula: 8,
        abdominal: 7,
        total: 24,
        bfCaliper: 10.1,
        weight: 65.0,
        lbm: 58.4,
        fm: 6.6
      }
    ],
    notes: [
      { id: 'n3', date: '03 APR 26', title: 'Disiplin Tidur', content: 'Jam tidur sudah mulai konsisten 8 jam per hari.', category: 'Behavior' }
    ],
    injuries: []
  },
  {
    id: '4',
    name: 'Gregoria Mariska',
    division: 'Senior',
    sector: "Tunggal Putri",
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
    armCircumferenceCategory: 'SEDANG',
    armCircumferenceRangeBB: '50-59',
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
    supplements: ['Zat Besi', 'Kalsium', 'Vit D', 'Whey Isolate'],
    bloodLab: { hb: 13.5, ferritin: 60, vitD: 32 },
    sweatRate: 0.9,
    whatsapp: '+6281456789012',
    email: 'gregoria.m@pbsi.id',
    bloodType: 'O',
    dominantHand: 'Kanan',
    joinYear: 2015,
    apparelSize: { shirt: 'S', shoe: 39 },
    socialMedia: { instagram: '@gregoriamrska' },
    emergencyContact: { name: 'Fransiska', relation: 'Ibu', phone: '+62844555666' },
    assessmentHistory: [
      {
        date: '08 APR 26',
        bfInBody: 17.0,
        bicep: 4.8,
        tricep: 7.8,
        subscapula: 9.8,
        abdominal: 8.8,
        total: 31.2,
        bfCaliper: 16.2,
        weight: 58.2,
        lbm: 48.8,
        fm: 9.4
      },
      {
        date: '12 OKT 25',
        bfInBody: 17.2,
        bicep: 5,
        tricep: 8,
        subscapula: 10,
        abdominal: 9,
        total: 32,
        bfCaliper: 16.5,
        weight: 58.5,
        lbm: 48.8,
        fm: 9.7
      }
    ],
    notes: [],
    injuries: []
  },
  {
    id: '5',
    name: 'Alwi Farhan',
    division: 'U-19',
    sector: "Tunggal Putra",
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
    armCircumferenceCategory: 'KECIL',
    armCircumferenceRangeBB: '60-69',
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
    sweatRate: 1.3,
    whatsapp: '+6281567890123',
    email: 'alwi.f@pbsi.id',
    bloodType: 'AB',
    dominantHand: 'Kanan',
    joinYear: 2021,
    apparelSize: { shirt: 'M', shoe: 42 },
    socialMedia: { instagram: '@alwifarhan' },
    emergencyContact: { name: 'Budi', relation: 'Ayah', phone: '+62855666777' },
    assessmentHistory: [
      {
        date: '08 APR 26',
        bfInBody: 8.4,
        bicep: 2,
        tricep: 3.8,
        subscapula: 4.8,
        abdominal: 3.8,
        total: 14.4,
        bfCaliper: 7.8,
        weight: 69.5,
        lbm: 64.1,
        fm: 5.4
      },
      {
        date: '08 OKT 25',
        bfInBody: 8.5,
        bicep: 2,
        tricep: 4,
        subscapula: 5,
        abdominal: 4,
        total: 15,
        bfCaliper: 8.0,
        weight: 68.0,
        lbm: 62.6,
        fm: 5.4
      }
    ],
    notes: [],
    injuries: []
  },
  {
    id: '6',
    name: 'Christian Adinata',
    division: 'Senior',
    sector: "Tunggal Putra",
    weight: 72.1,
    targetWeight: 71.5,
    status: 'Cedera',
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
    armCircumferenceCategory: 'SEDANG',
    armCircumferenceRangeBB: '70-79',
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
    supplements: ['Kolagen', 'Omega-3', 'Vit C', 'Kalsium'],
    bloodLab: { hb: 15.5, ferritin: 105, vitD: 50 },
    sweatRate: 0.8,
    whatsapp: '+6281678901234',
    email: 'christian.a@pbsi.id',
    bloodType: 'A',
    dominantHand: 'Kanan',
    joinYear: 2018,
    apparelSize: { shirt: 'L', shoe: 44 },
    socialMedia: { instagram: '@christianadinata' },
    emergencyContact: { name: 'Siti', relation: 'Ibu', phone: '+62866777888' },
    assessmentHistory: [
      {
        date: '08 APR 26',
        bfInBody: 11.6,
        bicep: 3.8,
        tricep: 5.8,
        subscapula: 7.8,
        abdominal: 6.8,
        total: 24.2,
        bfCaliper: 10.8,
        weight: 71.8,
        lbm: 64.0,
        fm: 7.8
      },
      {
        date: '20 OKT 25',
        bfInBody: 11.8,
        bicep: 4,
        tricep: 6,
        subscapula: 8,
        abdominal: 7,
        total: 25,
        bfCaliper: 11.0,
        weight: 72.1,
        lbm: 64.2,
        fm: 7.9
      }
    ],
    notes: [],
    injuries: [
      { id: 'i2', date: '15 MAR 26', type: 'ACL Tear', severity: 'Berat', status: 'Active', notes: 'Pasca operasi. Fokus pada penguatan otot sekitar lutut.' }
    ]
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
  { subject: 'Karbohidrat', A: 98, fullMark: 150 },
  { subject: 'Lemak', A: 86, fullMark: 150 },
  { subject: 'Hidrasi', A: 99, fullMark: 150 },
  { subject: 'Vitamin', A: 85, fullMark: 150 },
  { subject: 'Mineral', A: 65, fullMark: 150 },
];
