import Parser from '../parser';
import { ParsedResult } from '../../result';
import { ParseOptions } from "../../chrono";
export default class ESTimeAgoFormatParser extends Parser {
    private PATTERN;
    private TAG;
    private OTHER_PATTERNS;
    private NUM_MATCH;
    private UNIT_MATCH;
    pattern(): RegExp;
    extract(text: string, ref: Date, match: RegExpExecArray, opt: ParseOptions): ParsedResult | null;
}
