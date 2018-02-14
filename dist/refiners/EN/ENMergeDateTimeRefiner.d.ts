import Refiner from '../refiner';
import { ParsedComponents, ParsedResult } from "../../result";
import { ParseOptions } from "../../chrono";
export declare abstract class MergeDateTimeRefiner extends Refiner {
    abstract TAG: string;
    abstract PATTERN: RegExp;
    refine(text: string, results: ParsedResult[], opt: ParseOptions): ParsedResult[];
    private isAbleToMerge(text, result1, result2);
    private mergeResult(text, dateResult, timeResult);
    static isDateOnly(result: ParsedResult): boolean;
    static isTimeOnly(result: ParsedResult): boolean;
    static mergeDateTimeValues(dateComponent: ParsedComponents, timeComponent: ParsedComponents): ParsedComponents;
}
export default class ENMergeDateTimeRefiner extends MergeDateTimeRefiner {
    TAG: string;
    PATTERN: RegExp;
}
