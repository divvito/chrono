import Parser from '../parser';
import { ParsedResult } from "../../result";
import { ParseOptions } from "../../chrono";
export default class DECasualDateParser extends Parser {
    private PATTERN;
    private OTHER_PATTERNS;
    private TAG;
    pattern(): RegExp;
    extract(text: string, ref: Date, match: RegExpExecArray, opt: ParseOptions): ParsedResult | null;
}
