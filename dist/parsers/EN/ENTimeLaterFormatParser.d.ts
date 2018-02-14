import Parser from '../parser';
import { ParsedResult } from '../../result';
import { ParseOptions } from "../../chrono";
export default class ENTimeLaterFormatParser extends Parser {
    private PATTERN;
    private STRICT_PATTERN;
    private TAG;
    private OTHER_PATTERNS;
    pattern(): RegExp;
    extract(text: string, ref: Date, match: RegExpExecArray, opt: ParseOptions): ParsedResult | null;
}
