import Parser from '../parser';
import { ParsedResult } from '../../result';
import { ParseOptions } from "../../chrono";
export default class ENISOFormatParser extends Parser {
    private PATTERN;
    private YEAR_NUMBER_GROUP;
    private MONTH_NUMBER_GROUP;
    private DATE_NUMBER_GROUP;
    private HOUR_NUMBER_GROUP;
    private MINUTE_NUMBER_GROUP;
    private SECOND_NUMBER_GROUP;
    private MILLISECOND_NUMBER_GROUP;
    private TZD_HOUR_OFFSET_GROUP;
    private TZD_MINUTE_OFFSET_GROUP;
    private TAG;
    pattern(): RegExp;
    extract(text: string, ref: Date, match: RegExpExecArray, opt: ParseOptions): ParsedResult | null;
}
