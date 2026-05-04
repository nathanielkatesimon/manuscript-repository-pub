"use client";

/**
 * useYearLevelAndCourse
 *
 * A reusable React hook that provides a synchronized pair of "year level" and
 * "course" selection fields.
 *
 * Behaviour
 * ---------
 * - When a year level is selected the list of available courses is narrowed to
 *   those that are valid for that level (e.g. selecting Grade 11 shows only
 *   Senior High strands; selecting 3rd Year shows only Bachelor's programs).
 * - When a course is selected the year level is automatically set to the
 *   default for that course **only if no year level is already selected**
 *   (Grade 11 for SHS strands; 1st Year for college programs).
 *   If a year level is already chosen it is preserved.
 * - If the current course becomes incompatible with a newly selected year level
 *   it is reset to `null` automatically.
 *
 * Usage
 * -----
 * ```tsx
 * const {
 *   yearLevel,        // currently selected YearLevel | null
 *   course,           // currently selected Course | null
 *   setYearLevel,     // (yl: YearLevel | null) => void
 *   setCourse,        // (c: Course | null) => void
 *   yearLevelOptions, // YearLevel[] — always all year levels
 *   courseOptions,    // Course[]    — filtered based on selected year level
 * } = useYearLevelAndCourse();
 * ```
 *
 * This hook is a pure data-layer module — it carries no JSX and can be used
 * with any UI library.
 */

import { useMemo, useState } from "react";

import {
  ALL_COURSES,
  ALL_YEAR_LEVELS,
  COLLEGE_YEAR_LEVELS,
  Course,
  SENIOR_HIGH_YEAR_LEVELS,
  YearLevel,
  getCompatibleCourses,
} from "@/lib/yearLevelCourseData";

export interface UseYearLevelAndCourseReturn {
  /** The currently selected year level, or `null` if none is selected. */
  yearLevel: YearLevel | null;
  /** The currently selected course, or `null` if none is selected. */
  course: Course | null;
  /**
   * Set the active year level.
   * - Filters the available courses to those compatible with the new level.
   * - Resets the selected course if it is no longer compatible.
   */
  setYearLevel: (yearLevel: YearLevel | null) => void;
  /**
   * Set the active course.
   * - Auto-selects the default year level for the chosen course **only when no
   *   year level is currently selected**: Grade 11 for SHS strands; 1st Year
   *   for college programs.
   * - If a year level is already selected it is left unchanged.
   */
  setCourse: (course: Course | null) => void;
  /**
   * Year level options to display in the UI.
   * Always returns all year levels regardless of the selected course.
   */
  yearLevelOptions: YearLevel[];
  /**
   * Course options to display in the UI.
   * When no year level is selected all courses are returned.
   * When a year level is selected only compatible courses are returned.
   */
  courseOptions: Course[];
}

export function useYearLevelAndCourse(): UseYearLevelAndCourseReturn {
  const [yearLevel, setYearLevelState] = useState<YearLevel | null>(null);
  const [course, setCourseState] = useState<Course | null>(null);

  // -------------------------------------------------------------------
  // Derived options
  // -------------------------------------------------------------------

  // Year level options always show every level — the course setter handles
  // auto-selection rather than narrowing the list.
  const yearLevelOptions = ALL_YEAR_LEVELS;

  const courseOptions = useMemo<Course[]>(() => {
    if (!yearLevel) return ALL_COURSES;
    return getCompatibleCourses(yearLevel);
  }, [yearLevel]);

  // -------------------------------------------------------------------
  // Setters
  // -------------------------------------------------------------------

  const setYearLevel = (newYearLevel: YearLevel | null) => {
    setYearLevelState(newYearLevel);

    if (course && newYearLevel) {
      const stillValid = getCompatibleCourses(newYearLevel).some(
        (c) => c.id === course.id,
      );
      if (!stillValid) {
        setCourseState(null);
      }
    }
  };

  const setCourse = (newCourse: Course | null) => {
    setCourseState(newCourse);

    if (newCourse) {
      // Only auto-select a default year level when none is currently chosen.
      // If a year level is already selected, leave it as-is.
      if (!yearLevel) {
        const defaultYearLevel =
          newCourse.educationLevel === "senior_high"
            ? SENIOR_HIGH_YEAR_LEVELS[0]   // grade_11
            : COLLEGE_YEAR_LEVELS[0];      // college_1st
        setYearLevelState(defaultYearLevel);
      }
    } else {
      setYearLevelState(null);
    }
  };

  return {
    yearLevel,
    course,
    setYearLevel,
    setCourse,
    yearLevelOptions,
    courseOptions,
  };
}
