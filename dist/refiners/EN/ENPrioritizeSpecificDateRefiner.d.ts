import Refiner from '../refiner';
import { ParsedResult } from "../../result";
import { ParseOptions } from "../../chrono";
export default class ENPrioritizeSpecificDateRefiner extends Refiner {
    private TAG;
    private PATTERN;
    refine(text: string, results: ParsedResult[], opt: ParseOptions): ParsedResult[];
    private isMoreSpecific(prevResult, currResult);
    private isAbleToMerge(text, prevResult, currResult);
    private mergeResult(text, specificResult, nonSpecificResult);
}
