import Parser from '../parser';
import { ParsedResult } from '../../result';
import { ParseOptions } from "../../chrono";
import { Config } from "../../options";
export default class ENSlashDateFormatParser extends Parser {
    private PATTERN;
    private OPENING_GROUP;
    private ENDING_GROUP;
    private WEEKDAY_GROUP;
    private FIRST_NUMBERS_GROUP;
    private SECOND_NUMBERS_GROUP;
    private YEAR_GROUP;
    private TAG;
    private MONTH_GROUP;
    private DAY_GROUP;
    private OTHER_PATTERNS;
    constructor(config?: Config);
    pattern(): RegExp;
    extract(text: string, ref: Date, match: RegExpExecArray, opt: ParseOptions): ParsedResult | null;
}
