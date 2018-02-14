import Parser from '../parser';
import { ParsedResult } from '../../result';
import { ParseOptions } from "../../chrono";
export default class ENRelativeDateFormatParser extends Parser {
    private PATTERN;
    private MODIFIER_WORD_GROUP;
    private MULTIPLIER_WORD_GROUP;
    private RELATIVE_WORD_GROUP;
    private OTHER_PATTERNS;
    private TAG;
    pattern(): RegExp;
    extract(text: string, ref: Date, match: RegExpExecArray, opt: ParseOptions): ParsedResult | null;
}
