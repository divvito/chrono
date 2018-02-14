import Parser from '../parser';
import { ParsedResult } from '../../result';
import { ParseOptions } from "../../chrono";
export default class ZHHantDateParser extends Parser {
    private PATTERN;
    private YEAR_GROUP;
    private MONTH_GROUP;
    private DAY_GROUP;
    private TAG;
    pattern(): RegExp;
    extract(text: string, ref: Date, match: RegExpExecArray, opt: ParseOptions): ParsedResult | null;
}
