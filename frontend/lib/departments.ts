/**
 * Centralized list of departments/tracks used across select fields
 * in the manuscript repository.
 */

export const DEPARTMENTS = [
  "Computer Studies",
  "Business",
  "Culinary",
  "TVL",
  "Academic",
] as const;

export type Department = (typeof DEPARTMENTS)[number];
