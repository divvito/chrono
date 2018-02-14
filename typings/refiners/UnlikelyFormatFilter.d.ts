import { Filter } from './refiner';
import { ParsedResult } from "../result";
import { ParseOptions } from "../chrono";
export default class UnlikelyFormatFilter extends Filter {
    private REGEX;
    isValid(text: string, result: ParsedResult, opt: ParseOptions): boolean;
}
