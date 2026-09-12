import { DEMO_PATIENT_ID } from '../config';

export interface PatientData {
  id: string;
  name: string;
  fullName: string;
  greeting: string;
  subtext: string;
  streakDays: number;
  streakEncouragement: string;
  avatarUrl: string;
}

export const defaultPatient: PatientData = {
  id: DEMO_PATIENT_ID,
  name: 'Anita',
  fullName: 'Anita Devi',
  greeting: 'Good morning, Anita 👋',
  subtext: "Let's begin your memory journey today!",
  streakDays: 4,
  streakEncouragement: "Keep going, you're doing great!",
  // Friendly grandmother portrait from Unsplash
  avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
};
