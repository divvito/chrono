import Parser from '../parser';
import { ParsedResult } from "../../result";
import { ParseOptions } from "../../chrono";
export default class DEMonthNameParser extends Parser {
    private PATTERN;
    private MONTH_NAME_GROUP;
    private YEAR_GROUP;
    private YEAR_BE_GROUP;
    private YEAR_GROUP2;
    private YEAR_BE_GROUP2;
    private TAG;
    pattern(): RegExp;
    extract(text: string, ref: Date, match: RegExpExecArray, opt: ParseOptions): ParsedResult | null;
}
