import Parser from '../parser';
import { ParsedResult } from "../../result";
import { ParseOptions } from "../../chrono";
export default class ZHHantWeekdayParser extends Parser {
    private PATTERN;
    private PREFIX_GROUP;
    private WEEKDAY_GROUP;
    private TAG;
    pattern(): RegExp;
    extract(text: string, ref: Date, match: RegExpExecArray, opt: ParseOptions): ParsedResult | null;
}
