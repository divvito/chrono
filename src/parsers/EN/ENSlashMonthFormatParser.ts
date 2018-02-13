/*
    Month/Year date format with slash "/" (also "-" and ".") between numbers 
    - 11/05
    - 06/2005
*/

import Parser from '../parser';
import {ParsedResult} from '../../result';
import {ParseOptions} from "../../chrono";
import {DAY, HOUR, MONTH, YEAR} from "../../constants";

export default class ENSlashMonthFormatParser extends Parser {
    private PATTERN: RegExp = new RegExp('(^|[^\\d/]\\s+|[^\\w\\s])' +
        '([0-9]|0[1-9]|1[012])/([0-9]{4})' +
        '([^\\d/]|$)', 'i');

    private OPENING_GROUP: number = 1;
    private ENDING_GROUP: number = 4;
    private MONTH_GROUP: number = 2;
    private YEAR_GROUP: number = 3;

    private TAG: string = 'ENSlashMonthFormatParser';

    pattern(): RegExp {
        return this.PATTERN;
    }

    extract(text: string, ref: Date, match: RegExpExecArray, opt: ParseOptions): ParsedResult | null {
        const index: number = match.index + match[this.OPENING_GROUP].length;
        const result: ParsedResult = new ParsedResult({
            text: match[0].substr(match[this.OPENING_GROUP].length, match[0].length - (1 + match[this.ENDING_GROUP].length)).trim(),
            index,
            ref
        });

        result.tags[this.TAG] = true;

        result.start.imply(DAY, 1);
        result.start.assign(MONTH, parseInt(match[this.MONTH_GROUP], 10));
        result.start.assign(YEAR, parseInt(match[this.YEAR_GROUP], 10));


        return result;
    }
}