/*
    Date format with slash "/" (also "-" and ".") between numbers
    - Martes 3/11/2015
    - 3/11/2015
    - 3/11
*/

import Parser from '../parser';
import {ParsedResult} from '../../result';
import {ParseOptions} from "../../chrono";
import {DAY, MONTH, WEEKDAY, YEAR} from "../../constants";
import {WEEKDAY_OFFSET} from "../../utils/ES";
import {checkMonthDaysValid} from "../../utils/general";
import * as moment from 'moment';

export default class ESSlashDateFormatParser extends Parser {
    private PATTERN: RegExp = new RegExp('(\\W|^)' +
        '(?:' +
        '((?:domingo|dom|lunes|lun|martes|mar|mi[ée]rcoles|mie|jueves|jue|viernes|vie|s[áa]bado|sab))' +
        '\\s*\\,?\\s*' +
        ')?' +
        '([0-1]{0,1}[0-9]{1})[\\/\\.\\-]([0-3]{0,1}[0-9]{1})' +
        '(?:' +
        '[\\/\\.\\-]' +
        '([0-9]{4}\s*\,?\s*|[0-9]{2}\s*\,?\s*)' +
        ')?' +
        '(\\W|$)', 'i');

    private OPENING_GROUP: number = 1;
    private ENDING_GROUP: number = 6;

    private WEEKDAY_GROUP: number = 2;
    private MONTH_GROUP: number = 4;
    private DAY_GROUP: number = 3;
    private YEAR_GROUP: number = 5;

    private TAG: string = 'ESSlashDateFormatParser';

    private OTHER_PATTERNS: RegExp[] = [
        /^\d\.\d$/,
        /^\d\.\d{1,2}\.\d{1,2}$/
    ];

    pattern(): RegExp {
        return this.PATTERN;
    }

    extract(text: string, ref: Date, match: RegExpExecArray, opt: ParseOptions): ParsedResult | null {
        if (match[this.OPENING_GROUP] == '/' || match[this.ENDING_GROUP] == '/') {
            // Long skip, if there is some overlapping like:
            // XX[/YY/ZZ]
            // [XX/YY/]ZZ
            match.index += match[0].length;
            return null;
        }

        const index: number = match.index + match[1].length;
        const result: ParsedResult = new ParsedResult({
            text: match[0].substr(match[this.OPENING_GROUP].length, match[0].length - match[this.ENDING_GROUP].length),
            index,
            ref
        });

        result.tags[this.TAG] = true;
        const matchedText: string = result.text.toLowerCase();

        if (matchedText.match(this.OTHER_PATTERNS[0]) || matchedText.match(this.OTHER_PATTERNS[1])) {
            return null;
        }

        // MM/dd -> OK
        // MM.dd -> NG
        if (!match[this.YEAR_GROUP] && match[0].indexOf('/') < 0) {
            return null;
        }

        let year: number = match[this.YEAR_GROUP] ? parseInt(match[this.YEAR_GROUP], 10) : moment(ref).year();
        let month: number = parseInt(match[this.MONTH_GROUP], 10);
        let day: number = parseInt(match[this.DAY_GROUP], 10);

        if (month < 1 || day < 1 || day > 31) {
            return null
        }

        if (year < 100) {
            if (year > 50) {
                year = year + 1900;
            } else {
                year = year + 2000;
            }
        }

        if (month > 12) {
            if (month <= 31 && day <= 12 && checkMonthDaysValid(month, day, year)) {
                [month, day] = [day, month];
            } else {
                return null;
            }
        }

        result.start.assign(DAY, day);
        result.start.assign(MONTH, month);
        if (match[this.YEAR_GROUP]) {
            result.start.assign(YEAR, year);
        } else {
            result.start.imply(YEAR, year);
        }

        if (match[this.WEEKDAY_GROUP]) {
            result.start.assign(WEEKDAY, WEEKDAY_OFFSET[match[this.WEEKDAY_GROUP].toLowerCase()]);
        }

        return result;
    }
}