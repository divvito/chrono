/*
    Date format with slash "/" (also "-" and ".") between numbers
    - Tuesday 11/3/2015
    - 11/3/2015
    - 11/3
*/
import Parser from '../parser';
import {ParsedResult} from "../../result";
import {ParseOptions} from "../../chrono";
import {DAY, MONTH, WEEKDAY, YEAR} from "../../constants";
import {WEEKDAY_OFFSET} from '../../utils/DE';
import * as moment from 'moment';

export default class DESlashDateFormatParser extends Parser {
    private PATTERN: RegExp = new RegExp('(\\W|^)' +
        '(?:' +
        '(?:am\\s*?)?' +
        '((?:sonntag|so|montag|mo|dienstag|di|mittwoch|mi|donnerstag|do|freitag|fr|samstag|sa))' +
        '\\s*\\,?\\s*' +
        '(?:den\\s*)?' +
        ')?' +
        '([0-3]{0,1}[0-9]{1})[\\/\\.\\-]([0-3]{0,1}[0-9]{1})' +
        '(?:' +
        '[\\/\\.\\-]' +
        '([0-9]{4}\s*\,?\s*|[0-9]{2}\s*\,?\s*)' +
        ')?' +
        '(\\W|$)', 'i');

    private OPENING_GROUP: number = 1;
    private WEEKDAY_GROUP: number = 2;
    private DAY_GROUP: number = 3;
    private MONTH_GROUP: number = 4;
    private YEAR_GROUP: number = 5;
    private ENDING_GROUP: number = 6;

    private TAG: string = 'DESlashDateFormatParser';

    private OTHER_PATTERNS: RegExp[] = [
        /^\d\.\d$/,
        /^\d\.\d{1,2}\.\d{1,2}$/
    ];

    pattern(): RegExp {
        return this.PATTERN;
    }

    extract(text: string, ref: Date, match: RegExpExecArray, opt: ParseOptions): ParsedResult | null {
        if (match[this.OPENING_GROUP] === '/' || match[this.ENDING_GROUP] === '/') {
            // Long skip, if there is some overlapping like:
            // XX[/YY/ZZ]
            // [XX/YY/]ZZ
            match.index += match[0].length;
            return null;
        }

        const index: number = match.index + match[this.OPENING_GROUP].length;
        const matchedText: string = match[0].substr(match[this.OPENING_GROUP].length, match[0].length - match[this.ENDING_GROUP].length);

        const result: ParsedResult = new ParsedResult({
            text: matchedText,
            index,
            ref,
        });

        if (matchedText.match(this.OTHER_PATTERNS[0]) || matchedText.match(this.OTHER_PATTERNS[1])) return null;

        // MM/dd -> OK
        // MM.dd -> NG
        if (!match[this.YEAR_GROUP] && match[0].indexOf('/') < 0) return null;

        let year: number = parseInt(match[this.YEAR_GROUP] || moment(ref).year() + '', 10);
        const month: number = parseInt(match[this.MONTH_GROUP], 10);
        const day: number = parseInt(match[this.DAY_GROUP], 10);

        if ((month < 1 || month > 12) || (day < 1 || day > 31)) return null;

        if (year < 100) {
            if (year > 50) {
                year = year + 1900;
            } else {
                year = year + 2000;
            }
        }

        result.start.assign(DAY, day);
        result.start.assign(MONTH, month);
        result.start.assign(YEAR, year);

        // Day of week
        if (match[this.WEEKDAY_GROUP]) {
            result.start.assign(WEEKDAY, WEEKDAY_OFFSET[match[this.WEEKDAY_GROUP].toLowerCase()]);
        }

        result.tags[this.TAG] = true;
        return result;
    }
}
