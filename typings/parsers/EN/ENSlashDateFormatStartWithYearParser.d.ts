import Parser from '../parser';
import { ParsedResult } from '../../result';
import { ParseOptions } from "../../chrono";
export default class ENSlashDateFormatStartWithYearParser extends Parser {
    private PATTERN;
    private YEAR_NUMBER_GROUP;
    private MONTH_NUMBER_GROUP;
    private DATE_NUMBER_GROUP;
    private TAG;
    pattern(): RegExp;
    extract(text: string, ref: Date, match: RegExpExecArray, opt: ParseOptions): ParsedResult | null;
}
