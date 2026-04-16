export interface AssessmentEntry {
  id?: string;
  athlete_id?: string;
  date: string;
  weight: number;
  bf_caliper: number;
  bf_in_body: number;
  bicep: number;
  tricep: number;
  subscapula: number;
  abdominal: number;
  total: number;
  lbm: number;
  fm: number;
  notes?: string;
}

export interface NoteEntry {
  id: string;
  athlete_id: string;
  date: string;
  title: string;
  content: string;
  category: string;
}

export interface InjuryEntry {
  id: string;
  athlete_id: string;
  date: string;
  type: string;
  severity: 'Ringan' | 'Sedang' | 'Berat';
  status: 'Active' | 'Recovered';
  notes: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface Athlete {
  id: string;
  name: string;
  category_id: string;
  status: 'AKTIF' | 'NON AKTIF';
  whatsapp: string;
  place_of_birth: string;
  date_of_birth: string;
  age: number;
  gender: 'Laki-laki' | 'Perempuan';
  height: number;
  blood_type: string;
  dominant_hand: 'Kanan' | 'Kidal';
  arm_circumference: number;
  arm_circumference_category: string;
  arm_circumference_range_bb: string;
  target_weight: number;
  target_body_fat: number;
  image_url: string;
  weight?: number; // Latest weight snapshot
  bf_in_body?: number; // Latest BF snapshot
  bf_caliper?: number; // Latest BF Caliper snapshot
  // Virtual fields for UI (not in DB table directly if using joins, but useful for state)
  category_name?: string;
  assessment_history?: AssessmentEntry[];
  notes_history?: NoteEntry[];
  injuries_history?: InjuryEntry[];
}
