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
  notes?: string;
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

// Helper function to generate assessment history for 1 year
const generateHistory = (startWeight: number, targetWeight: number, startBF: number, targetBF: number): AssessmentEntry[] => {
  const history: AssessmentEntry[] = [];
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AGU', 'SEP', 'OKT', 'NOV', 'DES'];
  const currentYear = 25;
  const prevYear = 24;

  // Generate 12 months of data ending at current month (approx)
  for (let i = 0; i < 12; i++) {
    const monthIdx = (new Date().getMonth() - i + 12) % 12;
    const year = i > new Date().getMonth() ? prevYear : currentYear;
    const date = `15 ${months[monthIdx]} ${year}`;
    
    // Simulate progress: values get closer to target as we move forward in time (smaller i)
    const progressFactor = (11 - i) / 11; 
    const weight = Number((startWeight + (targetWeight - startWeight) * progressFactor + (Math.random() * 0.5 - 0.25)).toFixed(1));
    const bfCaliper = Number((startBF + (targetBF - startBF) * progressFactor + (Math.random() * 0.4 - 0.2)).toFixed(1));
    const bfInBody = Number((bfCaliper + 0.5 + (Math.random() * 0.2)).toFixed(1));
    
    const bicep = Number((3 + Math.random() * 2).toFixed(1));
    const tricep = Number((5 + Math.random() * 3).toFixed(1));
    const subscapula = Number((6 + Math.random() * 4).toFixed(1));
    const abdominal = Number((5 + Math.random() * 4).toFixed(1));
    const total = Number((bicep + tricep + subscapula + abdominal).toFixed(1));
    const lbm = Number((weight * (1 - bfCaliper / 100)).toFixed(1));
    const fm = Number((weight - lbm).toFixed(1));

    history.push({
      date,
      bfInBody,
      bicep,
      tricep,
      subscapula,
      abdominal,
      total,
      bfCaliper,
      weight,
      lbm,
      fm
    });
  }
  return history;
};

const firstNames = ['Jonatan', 'Anthony', 'Kevin', 'Marcus', 'Fajar', 'Rian', 'Hendra', 'Ahsan', 'Chico', 'Alwi', 'Gregoria', 'Apriyani', 'Siti', 'Ribka', 'Lanny', 'Rachel', 'Meilysa', 'Rose', 'Ester', 'Komang'];
const lastNames = ['Christie', 'Ginting', 'Sanjaya', 'Gideon', 'Alfian', 'Ardianto', 'Setiawan', 'Pratama', 'Wardoyo', 'Farhan', 'Mariska', 'Rahayu', 'Fadia', 'Sugiarto', 'Mayasari', 'Allessya', 'Puspitasari', 'Dinda', 'Wardani', 'Ayu'];
const divisions: Division[] = ['U-13', 'U-15', 'U-17', 'U-19', 'Senior'];
const sectors: Sector[] = ["Tunggal Putra", "Tunggal Putri", "Ganda Putra", "Ganda Putri", "Ganda Campuran"];

const generateAthletes = (): Athlete[] => {
  const generated: Athlete[] = [];
  for (let i = 1; i <= 100; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const name = `${firstName} ${lastName} ${i > 20 ? i : ''}`.trim();
    const division = divisions[Math.floor((i - 1) / 20)]; // 20 athletes per division
    const sector = sectors[Math.floor(Math.random() * sectors.length)];
    const gender = sector.includes('Putri') ? 'Perempuan' : 'Laki-laki';
    
    const startWeight = 60 + Math.random() * 20;
    const targetWeight = startWeight - (Math.random() * 3);
    const startBF = gender === 'Perempuan' ? 18 + Math.random() * 5 : 10 + Math.random() * 5;
    const targetBF = startBF - (Math.random() * 2);
    
    const history = generateHistory(startWeight, targetWeight, startBF, targetBF);
    const latest = history[0];

    generated.push({
      id: i.toString(),
      name,
      division,
      sector,
      weight: latest.weight,
      targetWeight: Number(targetWeight.toFixed(1)),
      status: Math.random() > 0.9 ? 'Cedera' : (Math.random() > 0.8 ? 'Pemulihan' : 'Fit'),
      hydrationLevel: 80 + Math.floor(Math.random() * 20),
      sleepHours: 7 + Math.random() * 2,
      rpe: 3 + Math.floor(Math.random() * 5),
      imageUrl: `https://picsum.photos/seed/athlete${i}/200/200`,
      compliance: 80 + Math.floor(Math.random() * 20),
      placeOfBirth: 'Jakarta',
      dateOfBirth: '01 Jan 2000',
      age: 12 + Math.floor(Math.random() * 15),
      gender,
      height: 160 + Math.floor(Math.random() * 25),
      armCircumference: Number((25 + Math.random() * 10).toFixed(1)),
      armCircumferenceCategory: 'SEDANG',
      armCircumferenceRangeBB: '60-69',
      bodyFatCaliper: latest.bfCaliper,
      bodyFatInBody: latest.bfInBody,
      targetBodyFat: Number(targetBF.toFixed(1)),
      skeletalMuscleMass: 30 + Math.random() * 10,
      bmr: 1500 + Math.random() * 500,
      exerciseCalories: 800 + Math.random() * 600,
      presentEnergy: 2500 + Math.random() * 1000,
      dailyCalories: 2800 + Math.random() * 800,
      foodAllergies: [],
      foodPreferences: ['Tinggi Protein'],
      supplements: ['Whey', 'Vit C'],
      bloodLab: { hb: 14 + Math.random() * 2, ferritin: 80 + Math.random() * 50, vitD: 30 + Math.random() * 20 },
      sweatRate: 1.0 + Math.random() * 0.5,
      whatsapp: `+62812${Math.floor(10000000 + Math.random() * 90000000)}`,
      email: `${name.toLowerCase().replace(/\s+/g, '.')}@athlete.id`,
      bloodType: ['A', 'B', 'AB', 'O'][Math.floor(Math.random() * 4)],
      dominantHand: Math.random() > 0.1 ? 'Kanan' : 'Kidal',
      joinYear: 2015 + Math.floor(Math.random() * 8),
      apparelSize: { shirt: 'L', shoe: 40 + Math.floor(Math.random() * 5) },
      socialMedia: { instagram: `@${name.toLowerCase().replace(/\s+/g, '_')}` },
      emergencyContact: { name: 'Emergency Contact', relation: 'Keluarga', phone: '+62811222333' },
      assessmentHistory: history,
      notes: [],
      injuries: []
    });
  }
  return generated;
};

export const athletes: Athlete[] = generateAthletes();

export const weightHistory = [
  { date: 'Jan', weight: 76.8, target: 76.0, bodyFat: 10.5, targetBodyFat: 9.0 },
  { date: 'Apr', weight: 76.6, target: 76.0, bodyFat: 10.2, targetBodyFat: 9.0 },
  { date: 'Jul', weight: 76.5, target: 76.0, bodyFat: 10.0, targetBodyFat: 9.0 },
  { date: 'Oct', weight: 76.7, target: 76.0, bodyFat: 9.8, targetBodyFat: 9.0 },
  { date: 'Jan', weight: 76.4, target: 76.0, bodyFat: 9.6, targetBodyFat: 9.0 },
  { date: 'Apr', weight: 76.5, target: 76.0, bodyFat: 9.5, targetBodyFat: 9.0 },
  { date: 'Jul', weight: 76.5, target: 76.0, bodyFat: 9.5, targetBodyFat: 9.0 },
];

export const nutritionBalance = [
  { subject: 'Protein', A: 120, fullMark: 150 },
  { subject: 'Karbohidrat', A: 98, fullMark: 150 },
  { subject: 'Lemak', A: 86, fullMark: 150 },
  { subject: 'Hidrasi', A: 99, fullMark: 150 },
  { subject: 'Vitamin', A: 85, fullMark: 150 },
  { subject: 'Mineral', A: 65, fullMark: 150 },
];
