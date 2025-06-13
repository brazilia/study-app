export interface Upload {
  id: string;
  name: string;
  date: string;
  processed: boolean;
  user_id?: string;
  file_size?: number;
  file_type?: string;
}

export interface Question {
  id: string;
  question: string;
  answer: string;
  options?: string[];
  type?: 'multiple_choice' | 'true_false' | 'short_answer';
  difficulty?: 'easy' | 'medium' | 'hard';
  upload_id?: string;
}

export interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in?: string;
}

export interface StudySession {
  id: string;
  user_id: string;
  upload_id: string;
  mode: 'flashcards' | 'test';
  score?: number;
  total_questions: number;
  completed_at: string;
  time_spent?: number;
}

export type Language = 'kz' | 'en';
export type StudyMode = 'flashcards' | 'test' | null;
export type ProcessingStatus = 'idle' | 'uploading' | 'processing' | 'complete' | 'error';

export interface Translations {
  logo: string;
  flashcards: string;
  test: string;
  signInPrompt: string;
  uploadFile: string;
  pasteText: string;
  dragDrop: string;
  processing: string;
  chooseMethod: string;
  yourUploads: string;
  showAnswer: string;
  nextCard: string;
  prevCard: string;
  submitAnswer: string;
  nextQuestion: string;
  score: string;
  complete: string;
  backToHome: string;
  email: string;
  password: string;
  signIn: string;
  signUp: string;
  createAccount: string;
  haveAccount: string;
  noAccount: string;
  correct: string;
  incorrect: string;
  correctAnswer: string;
}

export interface AppState {
  language: Language;
  isSignedIn: boolean;
  currentUser: User | null;
  uploads: Upload[];
  currentView: 'home' | 'processing' | 'study-select' | 'study';
  studyMode: StudyMode;
  questions: Question[];
  processingStatus: ProcessingStatus;
}