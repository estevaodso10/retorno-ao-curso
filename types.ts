export interface Semester {
  year: number;
  period: 1 | 2;
}

export interface AnalysisInput {
  studentId: string;
  isCancelled: boolean;
  currentSemester: Semester;
  lastActiveSemester: Semester;
  isSameCourse: boolean;
}

export interface AnalysisResult {
  isEligible: boolean;
  justification: string;
  gapSemesters: number; // The calculated gap
}
