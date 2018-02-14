import Parser from '../parser';
import { ParsedResult } from '../../result';
import { ParseOptions } from "../../chrono";
export default class FRRelativeDateFormatParser extends Parser {
    private PATTERN;
    private MULTIPLIER_GROUP;
    private MODIFIER_1_GROUP;
    private RELATIVE_WORD_GROUP;
    private MODIFIER_2_GROUP;
    private OTHER_PATTERNS;
    private TAG;
    pattern(): RegExp;
    extract(text: string, ref: Date, match: RegExpExecArray, opt: ParseOptions): ParsedResult | null;
}
