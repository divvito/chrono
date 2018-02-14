import { COMPONENT_NAME } from "./result";
export declare const HOUR: COMPONENT_NAME;
export declare const MINUTE: COMPONENT_NAME;
export declare const SECOND: COMPONENT_NAME;
export declare const MILLISECOND: COMPONENT_NAME;
export declare const MERIDIEM: COMPONENT_NAME;
export declare const DAY: COMPONENT_NAME;
export declare const MONTH: COMPONENT_NAME;
export declare const YEAR: COMPONENT_NAME;
export declare const WEEKDAY: COMPONENT_NAME;
export declare const TIMEZONE_OFFSET: COMPONENT_NAME;
export declare const WEEK: UnitOfTime;
export declare type NameMap = {
    [k: string]: number;
};
export declare type UnitOfTime = 'hour' | 'minute' | 'second' | 'millisecond' | 'day' | 'month' | 'year' | 'week';
export declare type UnitRegexMap = {
    [k in UnitOfTime]?: RegExp;
};
