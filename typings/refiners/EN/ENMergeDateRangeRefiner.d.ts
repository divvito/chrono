import Refiner from '../refiner';
import { ParsedResult } from "../../result";
import { ParseOptions } from "../../chrono";
export declare abstract class MergeDateRangeRefiner extends Refiner {
    abstract TAG: string;
    abstract PATTERN: RegExp;
    refine(text: string, results: ParsedResult[], opt: ParseOptions): ParsedResult[];
    private isAbleToMerge(text, result1, result2);
    private isWeekdayResult(result);
    private mergeResult(text, fromResult, toResult);
    private mergeValues(from, to);
}
export default class ENMergeDateRangeRefiner extends MergeDateRangeRefiner {
    TAG: string;
    PATTERN: RegExp;
}
