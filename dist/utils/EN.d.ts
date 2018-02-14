import { NameMap, UnitOfTime } from "../constants";
export declare const WEEKDAY_OFFSET: NameMap;
export declare const MONTH_OFFSET: NameMap;
export declare const INTEGER_WORDS: NameMap;
export declare const INTEGER_WORDS_PATTERN: string;
export declare const ORDINAL_WORDS: NameMap;
export declare const ORDINAL_WORDS_PATTERN: string;
export declare const TIME_UNIT_PATTERN: string;
export declare const TIME_UNIT_STRICT_PATTERN: string;
export declare type FragmentName = 'hour' | 'minute' | 'second' | 'week' | 'd' | 'month' | 'year';
export declare type FragmentMap = {
    [k in FragmentName]?: number;
};
export declare const extractDateTimeUnitFragments: (timeunitText: string) => FragmentMap;
export declare const matchInteger: (text: string) => number;
export declare const matchUnit: (text: string) => UnitOfTime;
export declare const yearCalculation: (year: string, maybeYearBe?: string) => number;
