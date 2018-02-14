import { NameMap, UnitOfTime } from "../constants";
export declare const WEEKDAY_OFFSET: NameMap;
export declare const MONTH_OFFSET: NameMap;
export declare const INTEGER_WORDS_PATTERN: string;
export declare const INTEGER_WORDS: NameMap;
export declare const yearCalculation: (year: string, yearBe: string) => number;
export declare const matchInteger: (text: string) => number;
export declare const matchUnit: (text: string) => UnitOfTime;
