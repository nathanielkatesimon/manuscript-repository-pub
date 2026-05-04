/**
 * Data definitions for year levels and courses used in the manuscript repository.
 *
 * Education is split into two tracks:
 *   - Senior High School (SHS): Grade 11 and Grade 12, with Academic Strands and Tech-Pro strands.
 *   - College: 1st Year to 4th Year for Bachelor's Degree programs;
 *              1st Year and 2nd Year for Diploma programs.
 */

export type EducationLevel = "senior_high" | "college";
export type CollegeProgramType = "bachelors" | "diploma";

export interface YearLevel {
  id: string;
  label: string;
  educationLevel: EducationLevel;
}

export interface Course {
  id: string;
  label: string;
  educationLevel: EducationLevel;
  /** SHS courses carry a track label (Academic Strands or Tech-Pro). */
  track?: string;
  /** College courses specify whether they are a Bachelor's or Diploma program. */
  programType?: CollegeProgramType;
}

// ---------------------------------------------------------------------------
// Year levels
// ---------------------------------------------------------------------------

export const SENIOR_HIGH_YEAR_LEVELS: YearLevel[] = [
  { id: "grade_11", label: "Grade 11", educationLevel: "senior_high" },
  { id: "grade_12", label: "Grade 12", educationLevel: "senior_high" },
];

export const COLLEGE_YEAR_LEVELS: YearLevel[] = [
  { id: "college_1st", label: "1st Year", educationLevel: "college" },
  { id: "college_2nd", label: "2nd Year", educationLevel: "college" },
  { id: "college_3rd", label: "3rd Year", educationLevel: "college" },
  { id: "college_4th", label: "4th Year", educationLevel: "college" },
];

export const ALL_YEAR_LEVELS: YearLevel[] = [
  ...SENIOR_HIGH_YEAR_LEVELS,
  ...COLLEGE_YEAR_LEVELS,
];

// ---------------------------------------------------------------------------
// Courses
// ---------------------------------------------------------------------------

/** Senior High School — Academic Strands */
export const ACADEMIC_TRACK_COURSES: Course[] = [
  {
    id: "be",
    label: "Business & Entrepreneurship (BE)",
    educationLevel: "senior_high",
    track: "Academic Strands",
  },
  {
    id: "stem",
    label: "Science, Technology, Engineering & Mathematics (STEM)",
    educationLevel: "senior_high",
    track: "Academic Strands",
  },
  {
    id: "assh",
    label: "Arts, Social Science & Humanities (ASSH)",
    educationLevel: "senior_high",
    track: "Academic Strands",
  },
];

/** Senior High School — Tech-Pro strands */
export const TECH_PRO_TRACK_COURSES: Course[] = [
  {
    id: "ict",
    label: "Information & Communication Technology (ICT)",
    educationLevel: "senior_high",
    track: "Tech-Pro",
  },
  {
    id: "fcs",
    label: "Family & Consumer Science (FCS)",
    educationLevel: "senior_high",
    track: "Tech-Pro",
  },
];

export const SENIOR_HIGH_COURSES: Course[] = [
  ...ACADEMIC_TRACK_COURSES,
  ...TECH_PRO_TRACK_COURSES,
];

/** College — Bachelor's Degree programs (up to 4 years) */
export const BACHELORS_COURSES: Course[] = [
  {
    id: "bsit",
    label: "Bachelor of Science in Information Technology (BSIT)",
    educationLevel: "college",
    programType: "bachelors",
  },
  {
    id: "bsba",
    label: "Bachelor of Science in Business Administration (BSBA)",
    educationLevel: "college",
    programType: "bachelors",
  },
  {
    id: "bshm",
    label: "Bachelor of Science in Hospitality Management (BSHM)",
    educationLevel: "college",
    programType: "bachelors",
  },
  {
    id: "bscrim",
    label: "Bachelor of Science in Criminology (BSCrim)",
    educationLevel: "college",
    programType: "bachelors",
  },
  {
    id: "bsism",
    label: "Bachelor of Science in Industrial Security Management (BSISM)",
    educationLevel: "college",
    programType: "bachelors",
  },
  {
    id: "bsentrep",
    label: "Bachelor of Science in Entrepreneurship (BSEntrep)",
    educationLevel: "college",
    programType: "bachelors",
  },
  {
    id: "bstm",
    label: "Bachelor of Science in Tourism Management (BSTM)",
    educationLevel: "college",
    programType: "bachelors",
  },
];

/** College — Diploma programs (2 years, available in 1st and 2nd Year only) */
export const DIPLOMA_COURSES: Course[] = [
  {
    id: "wadt",
    label: "Web Application Development Technology (WADT)",
    educationLevel: "college",
    programType: "diploma",
  },
  {
    id: "oat",
    label: "Office Administration Technology (OAT)",
    educationLevel: "college",
    programType: "diploma",
  },
  {
    id: "omt",
    label: "Office Management Technology (OMT)",
    educationLevel: "college",
    programType: "diploma",
  },
  {
    id: "ht",
    label: "Hospitality Technology (HT)",
    educationLevel: "college",
    programType: "diploma",
  },
];

export const COLLEGE_COURSES: Course[] = [
  ...BACHELORS_COURSES,
  ...DIPLOMA_COURSES,
];

export const ALL_COURSES: Course[] = [
  ...SENIOR_HIGH_COURSES,
  ...COLLEGE_COURSES,
];

// ---------------------------------------------------------------------------
// Year levels that are valid for diploma programs (1st and 2nd year only)
// ---------------------------------------------------------------------------
const DIPLOMA_VALID_YEAR_LEVEL_IDS = new Set<string>(["college_1st", "college_2nd"]);

/**
 * Returns the year levels that are compatible with the given course.
 * - SHS courses → Grade 11 and Grade 12 only.
 * - Bachelor's courses → all four college year levels.
 * - Diploma courses → 1st Year and 2nd Year only.
 */
export function getCompatibleYearLevels(course: Course): YearLevel[] {
  if (course.educationLevel === "senior_high") {
    return SENIOR_HIGH_YEAR_LEVELS;
  }
  if (course.programType === "diploma") {
    return COLLEGE_YEAR_LEVELS.filter((yl) =>
      DIPLOMA_VALID_YEAR_LEVEL_IDS.has(yl.id),
    );
  }
  return COLLEGE_YEAR_LEVELS;
}

/**
 * Returns the courses that are compatible with the given year level.
 * - Grade 11 / Grade 12 → SHS strands only.
 * - 3rd Year / 4th Year → Bachelor's programs only (diploma is a 2-year program).
 * - 1st Year / 2nd Year → all college programs (Bachelor's and Diploma).
 */
export function getCompatibleCourses(yearLevel: YearLevel): Course[] {
  if (yearLevel.educationLevel === "senior_high") {
    return SENIOR_HIGH_COURSES;
  }
  if (DIPLOMA_VALID_YEAR_LEVEL_IDS.has(yearLevel.id)) {
    return COLLEGE_COURSES;
  }
  // 3rd Year or 4th Year — only Bachelor's programs apply
  return BACHELORS_COURSES;
}
