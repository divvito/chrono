import Parser from '../parser';
import { ParsedResult } from '../../result';
import { ParseOptions } from "../../chrono";
export default class ESSlashDateFormatParser extends Parser {
    private PATTERN;
    private OPENING_GROUP;
    private ENDING_GROUP;
    private WEEKDAY_GROUP;
    private MONTH_GROUP;
    private DAY_GROUP;
    private YEAR_GROUP;
    private TAG;
    private OTHER_PATTERNS;
    pattern(): RegExp;
    extract(text: string, ref: Date, match: RegExpExecArray, opt: ParseOptions): ParsedResult | null;
}
