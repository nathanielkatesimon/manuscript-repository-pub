/**
 * Data definitions for year levels and courses used in the manuscript repository.
 *
 * Education is split into two tracks:
 *   - Senior High School (SHS): Grade 11 and Grade 12, with Academic and TVL strands.
 *   - College: 1st Year to 4th Year for Bachelor's programs;
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
  /** SHS courses carry a track label (Academic or TVL). */
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

/** Senior High School — Academic Track strands */
export const ACADEMIC_TRACK_COURSES: Course[] = [
  {
    id: "stem",
    label: "STEM (Science, Technology, Engineering, and Mathematics)",
    educationLevel: "senior_high",
    track: "Academic",
  },
  {
    id: "abm",
    label: "ABM (Accountancy, Business and Management)",
    educationLevel: "senior_high",
    track: "Academic",
  },
  {
    id: "humss",
    label: "HUMSS (Humanities and Social Sciences)",
    educationLevel: "senior_high",
    track: "Academic",
  },
  {
    id: "gas",
    label: "GAS (General Academic Strand)",
    educationLevel: "senior_high",
    track: "Academic",
  },
];

/** Senior High School — TVL (Technical-Vocational-Livelihood) Track strands */
export const TVL_TRACK_COURSES: Course[] = [
  {
    id: "tvl_ict",
    label: "TVL — Information and Communications Technology (ICT)",
    educationLevel: "senior_high",
    track: "TVL",
  },
  {
    id: "tvl_he",
    label: "TVL — Home Economics (HE)",
    educationLevel: "senior_high",
    track: "TVL",
  },
  {
    id: "tvl_ia",
    label: "TVL — Industrial Arts (IA)",
    educationLevel: "senior_high",
    track: "TVL",
  },
  {
    id: "tvl_afa",
    label: "TVL — Agri-Fishery Arts (AFA)",
    educationLevel: "senior_high",
    track: "TVL",
  },
];

export const SENIOR_HIGH_COURSES: Course[] = [
  ...ACADEMIC_TRACK_COURSES,
  ...TVL_TRACK_COURSES,
];

/** College — Bachelor's degree programs (up to 4 years) */
export const BACHELORS_COURSES: Course[] = [
  {
    id: "bscs",
    label: "BS Computer Science",
    educationLevel: "college",
    programType: "bachelors",
  },
  {
    id: "bsit",
    label: "BS Information Technology",
    educationLevel: "college",
    programType: "bachelors",
  },
  {
    id: "bsed",
    label: "BS Education",
    educationLevel: "college",
    programType: "bachelors",
  },
  {
    id: "bsba",
    label: "BS Business Administration",
    educationLevel: "college",
    programType: "bachelors",
  },
  {
    id: "bsn",
    label: "BS Nursing",
    educationLevel: "college",
    programType: "bachelors",
  },
  {
    id: "bsece",
    label: "BS Electronics and Communications Engineering",
    educationLevel: "college",
    programType: "bachelors",
  },
  {
    id: "bsce",
    label: "BS Civil Engineering",
    educationLevel: "college",
    programType: "bachelors",
  },
];

/** College — Diploma programs (2 years, available in 1st and 2nd Year only) */
export const DIPLOMA_COURSES: Course[] = [
  {
    id: "dip_ict",
    label: "Diploma in Information and Communications Technology",
    educationLevel: "college",
    programType: "diploma",
  },
  {
    id: "dip_ba",
    label: "Diploma in Business Administration",
    educationLevel: "college",
    programType: "diploma",
  },
  {
    id: "dip_ht",
    label: "Diploma in Hospitality and Tourism",
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
