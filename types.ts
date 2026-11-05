export type GradeLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface GradeInfo {
  level: GradeLevel;
  title: string;
  tagalogTitle: string;
  stage: 'Key Stage 1 (Primary)' | 'Key Stage 2 (Intermediate)';
  ageRange: string;
  description: string;
  badge: string;
  iconName: string;
  color: string;
}

export interface Subject {
  id: string;
  name: string;
  tagalogName: string;
  icon: string;
  color: string;
  gradient: string;
  description: string;
  topics: string[];
  keyCompetencies: string[];
  sampleQuestions: string[];
}

export interface QuizQuestion {
  id: string;
  grade: GradeLevel;
  subjectId: string;
  subjectName: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface StudyCheatSheet {
  title: string;
  subject: string;
  content: string[];
  tip: string;
}

export interface HomeworkTask {
  id: string;
  title: string;
  subjectId: string;
  dueDate?: string;
  isCompleted: boolean;
}

export type HelperSubject = 
  | 'Math' 
  | 'Science' 
  | 'English' 
  | 'Filipino' 
  | 'Araling Panlipunan' 
  | 'MAPEH' 
  | 'TLE/EPP' 
  | 'GMRC';

export type HelperLanguage = 'English' | 'Filipino' | 'Bisaya';

export interface HelperResponse {
  isAiConnected: boolean;
  aiNotice: string;
  question: string;
  grade: number;
  subject: HelperSubject | string;
  language: HelperLanguage | string;
  explanation: string;
  steps: string[];
  finalAnswer: string;
  tip: string;
  isSample: boolean;
  extractedText?: string;
  photoUrl?: string;
}
