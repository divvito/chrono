import * as moment from "moment";
import { UnitOfTime } from "../constants";
import { ParsedComponents, ParsedResult } from "../result";
export declare const getAppropriateYear: (current: ParsedComponents, ref: Date) => void;
export declare const deadlineCalculations: (num: number, unit: UnitOfTime, result: ParsedResult, momentRef: moment.Moment) => boolean;
export declare const checkMonthDaysValid: (day: number, month: number, year: number) => boolean;
export declare enum Modifier {
    LAST = 0,
    THIS = 1,
    NEXT = 2,
    UNKNOWN = 3,
}
export declare const updateParsedComponent: (result: ParsedResult, ref: Date, offset: number, modifier: Modifier) => void;
