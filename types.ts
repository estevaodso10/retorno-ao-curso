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
  gapIntervalStart: string; // The semester immediately following the last active one
  gapIntervalEnd: string;   // The semester immediately preceding the current one
}