import { Semester, AnalysisInput, AnalysisResult } from '../types';

/**
 * Converts a semester object (YYYY.X) into a linear index.
 * Formula: Year * 2 + (Period - 1)
 * This allows simple integer subtraction to find distances.
 */
const getSemesterIndex = (sem: Semester): number => {
  return sem.year * 2 + (sem.period - 1);
};

/**
 * Parses a string "YYYY.X" into a Semester object.
 * Returns null if invalid.
 */
export const parseSemesterString = (value: string): Semester | null => {
  const parts = value.split('.');
  if (parts.length !== 2) return null;
  
  const year = parseInt(parts[0], 10);
  const period = parseInt(parts[1], 10);

  if (isNaN(year) || isNaN(period)) return null;
  if (period !== 1 && period !== 2) return null;

  return { year, period };
};

/**
 * Formats a Semester object back to "YYYY.X" string.
 */
export const formatSemester = (sem: Semester): string => {
  return `${sem.year}.${sem.period}`;
};

/**
 * Calculates the number of semesters BETWEEN two semesters.
 * The Start and End semesters themselves are excluded from the gap count 
 * based on the business rule provided (current semester doesn't count in calculation).
 * 
 * Logic:
 * Start: 2024.1 (Index 4048)
 * End:   2026.1 (Index 4052)
 * Diff:  4052 - 4048 - 1 = 3 semesters gap (2024.2, 2025.1, 2025.2).
 */
export const calculateGap = (start: Semester, end: Semester): number => {
  const startIndex = getSemesterIndex(start);
  const endIndex = getSemesterIndex(end);
  
  // If end is before or same as start, gap is 0 (or technically negative/invalid for this context)
  if (endIndex <= startIndex) return 0;

  return endIndex - startIndex - 1;
};

/**
 * Main Business Rule Validator
 */
export const analyzeEligibility = (input: AnalysisInput): AnalysisResult => {
  // Rule 1: Status Cancelada
  if (input.isCancelled) {
    return {
      isEligible: false,
      justification: "A matrícula atual consta como 'Cancelada'. Situações de cancelamento impedem o enquadramento direto em retorno ao curso.",
      gapSemesters: 0
    };
  }

  // Rule 2: Different Course
  if (!input.isSameCourse) {
    return {
      isEligible: false,
      justification: "O retorno não é para o mesmo curso. O enquadramento exige que o aluno retorne à mesma graduação de origem.",
      gapSemesters: 0
    };
  }

  // Rule 3: Time Calculation
  const gap = calculateGap(input.lastActiveSemester, input.currentSemester);
  const MAX_GAP = 4;

  if (gap > MAX_GAP) {
    return {
      isEligible: false,
      justification: `O período de afastamento foi de ${gap} semestres letivos, excedendo o limite máximo permitido de ${MAX_GAP} semestres.`,
      gapSemesters: gap
    };
  }

  if (gap < 0) {
     return {
      isEligible: false, // Logical error in input, safer to say not eligible or handle error
      justification: "Data do semestre atual é anterior ao último vínculo. Verifique as datas inseridas.",
      gapSemesters: gap
    };
  }

  // All rules passed
  return {
    isEligible: true,
    justification: `Critérios atendidos: O afastamento foi de ${gap} semestre(s) (limite: ${MAX_GAP}), matrícula não está cancelada e o curso é o mesmo.`,
    gapSemesters: gap
  };
};