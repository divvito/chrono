/*
    Date format with slash "/" between numbers like ENSlashDateFormatParser,
    but this parser expect year before month and date. 
    - YYYY/MM/DD
    - YYYY-MM-DD
    - YYYY.MM.DD
*/
import Parser from '../parser';
import {ParsedResult} from '../../result';
import {ParseOptions} from "../../chrono";
import {checkMonthDaysValid} from "../../utils/general";
import {DAY, MONTH, YEAR} from "../../constants";

export default class ENSlashDateFormatStartWithYearParser extends Parser {
    private PATTERN: RegExp = new RegExp('(\\W|^)'
        + '([0-9]{4})[\\-\\.\\/]([0-9]{1,2})[\\-\\.\\/]([0-9]{1,2})'
        + '(?=\\W|$)', 'i');

    private YEAR_NUMBER_GROUP: number = 2;
    private MONTH_NUMBER_GROUP: number = 3;
    private DATE_NUMBER_GROUP: number = 4;

    private TAG: string = 'ENSlashDateFormatStartWithYearParser';

    pattern(): RegExp {
        return this.PATTERN;
    }

    extract(text: string, ref: Date, match: RegExpExecArray, opt: ParseOptions): ParsedResult | null {
        const index: number = match.index + match[1].length;
        const result: ParsedResult = new ParsedResult({
            text: match[0].substr(match[1].length),
            index,
            ref
        });

        result.tags[this.TAG] = true;

        const year: number = parseInt(match[this.YEAR_NUMBER_GROUP], 10);
        const month: number = parseInt(match[this.MONTH_NUMBER_GROUP], 10);
        const day: number = parseInt(match[this.DATE_NUMBER_GROUP], 10);

        if (month > 12 || month < 1 || day > 31 || day < 1 || !checkMonthDaysValid(day, month, year)) {
            return null;
        }

        result.start.assign(YEAR, year);
        result.start.assign(MONTH, month);
        result.start.assign(DAY, day);

        return result;
    }
}