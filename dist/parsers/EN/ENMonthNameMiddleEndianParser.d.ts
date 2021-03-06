import Parser from '../parser';
import { ParsedResult } from '../../result';
import { ParseOptions } from "../../chrono";
export default class ENMonthNameMiddleEndianParser extends Parser {
    private PATTERN;
    private WEEKDAY_GROUP;
    private MONTH_NAME_GROUP;
    private DATE_GROUP;
    private DATE_NUM_GROUP;
    private DATE_TO_GROUP;
    private DATE_TO_NUM_GROUP;
    private YEAR_GROUP;
    private YEAR_BE_GROUP;
    private YEAR_GROUP2;
    private YEAR_BE_GROUP2;
    private TAG;
    pattern(): RegExp;
    extract(text: string, ref: Date, match: RegExpExecArray, opt: ParseOptions): ParsedResult | null;
}
