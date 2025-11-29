export const STUDENT_TYPE_LIST = ["DNC", "USH"] as const;

export const FPT_TYPE_LIST = ["FPT", "FPT_EXTEND", "FIS", "FIS_HCM"] as const;

export type StudentType = typeof STUDENT_TYPE_LIST[number];

export type FPTType = typeof FPT_TYPE_LIST[number];

export type CrawledDataType = StudentType | FPTType;