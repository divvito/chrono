import Parser from '../parser';
import { ParsedResult } from '../../result';
import { ParseOptions } from "../../chrono";
export default class ENMonthNameParser extends Parser {
    private PATTERN;
    private MONTH_NAME_GROUP;
    private YEAR_GROUP;
    private YEAR_BE_GROUP;
    private TAG;
    pattern(): RegExp;
    extract(text: string, ref: Date, match: RegExpExecArray, opt: ParseOptions): ParsedResult | null;
}
