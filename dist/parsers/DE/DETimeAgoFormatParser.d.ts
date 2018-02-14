import Parser from '../parser';
import { ParsedResult } from "../../result";
import { ParseOptions } from "../../chrono";
export default class DETimeAgoFormatParser extends Parser {
    private PATTERN;
    private STRICT_PATTERN;
    private TAG;
    pattern(): RegExp;
    extract(text: string, ref: Date, match: RegExpExecArray, opt: ParseOptions): ParsedResult | null;
}
