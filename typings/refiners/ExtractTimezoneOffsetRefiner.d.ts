import Refiner from './refiner';
import { ParsedResult } from "../result";
import { ParseOptions } from "../chrono";
export default class ExtractTimezoneOffsetRefiner extends Refiner {
    private TAG;
    private TIMEZONE_OFFSET_PATTERN;
    private TIMEZONE_OFFSET_SIGN_GROUP;
    private TIMEZONE_OFFSET_HOUR_OFFSET_GROUP;
    private TIMEZONE_OFFSET_MINUTE_OFFSET_GROUP;
    refine(text: string, results: ParsedResult[], opt: ParseOptions): ParsedResult[];
}
