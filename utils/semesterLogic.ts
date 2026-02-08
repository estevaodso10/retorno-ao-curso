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
 * Calculates the next semester logically.
 */
const getNextSemester = (sem: Semester): Semester => {
  if (sem.period === 2) {
    return { year: sem.year + 1, period: 1 };
  }
  return { year: sem.year, period: 2 };
};

/**
 * Calculates the previous semester logically.
 */
const getPreviousSemester = (sem: Semester): Semester => {
  if (sem.period === 1) {
    return { year: sem.year - 1, period: 2 };
  }
  return { year: sem.year, period: 1 };
};

/**
 * Calculates the number of semesters BETWEEN two semesters.
 * The Start and End semesters themselves are excluded from the gap count.
 * 
 * Logic:
 * Start: 2024.1 (Index 4048)
 * End:   2026.1 (Index 4052)
 * Diff:  4052 - 4048 - 1 = 3 semesters gap (2024.2, 2025.1, 2025.2).
 * 
 * Returns negative values if end <= start, allowing validation of date order.
 */
export const calculateGap = (start: Semester, end: Semester): number => {
  const startIndex = getSemesterIndex(start);
  const endIndex = getSemesterIndex(end);
  
  return endIndex - startIndex - 1;
};

/**
 * Main Business Rule Validator
 */
export const analyzeEligibility = (input: AnalysisInput): AnalysisResult => {
  const nextSemester = getNextSemester(input.lastActiveSemester);
  const prevSemester = getPreviousSemester(input.currentSemester);
  
  const startCountStr = formatSemester(nextSemester);
  const endCountStr = formatSemester(prevSemester);

  // Rule 1: Status Cancelada
  if (input.isCancelled) {
    return {
      isEligible: false,
      justification: "A matrícula atual consta como 'Cancelada'. Situações de cancelamento impedem o enquadramento direto em retorno ao curso.",
      gapSemesters: 0,
      gapIntervalStart: startCountStr,
      gapIntervalEnd: endCountStr
    };
  }

  // Rule 2: Different Course
  if (!input.isSameCourse) {
    return {
      isEligible: false,
      justification: "O retorno não é para o mesmo curso. O enquadramento exige que o aluno retorne à mesma graduação de origem.",
      gapSemesters: 0,
      gapIntervalStart: startCountStr,
      gapIntervalEnd: endCountStr
    };
  }

  // Rule 3: Time Calculation
  const gap = calculateGap(input.lastActiveSemester, input.currentSemester);
  const LIMIT_GAP = 4; 

  if (gap < 0) {
     return {
      isEligible: false, 
      justification: "Data do semestre atual deve ser posterior ao último vínculo. Verifique as datas inseridas.",
      gapSemesters: gap,
      gapIntervalStart: startCountStr,
      gapIntervalEnd: endCountStr
    };
  }

  const rangeText = gap > 0 ? `(de ${startCountStr} a ${endCountStr})` : `(sem intervalo entre os semestres)`;

  // Rule: Gap must be strictly less than 4 (gap < 4 is eligible).
  // Therefore, gap >= 4 is ineligible.
  if (gap >= LIMIT_GAP) {
    return {
      isEligible: false,
      justification: `A soma de períodos letivos entre o último vínculo e o retorno é de ${gap} semestre(s) ${rangeText}.`,
      gapSemesters: gap,
      gapIntervalStart: startCountStr,
      gapIntervalEnd: endCountStr
    };
  }

  // All rules passed
  return {
    isEligible: true,
    justification: `Critérios atendidos: A soma de períodos letivos entre o último vínculo e o retorno é de ${gap} semestre(s) ${rangeText}, o que é menor que ${LIMIT_GAP}. Matrícula não está cancelada e o curso é o mesmo.`,
    gapSemesters: gap,
    gapIntervalStart: startCountStr,
    gapIntervalEnd: endCountStr
  };
};