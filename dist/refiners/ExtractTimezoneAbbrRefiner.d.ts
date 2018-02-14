import Refiner from './refiner';
import { ParsedResult } from "../result";
import { ParseOptions } from "../chrono";
export default class ExtractTimezoneAbbrRefiner extends Refiner {
    private TAG;
    private TIMEZONE_NAME_PATTERN;
    private TIMEZONE_ABBR_MAP;
    refine(text: string, results: ParsedResult[], opt: ParseOptions): ParsedResult[];
}
