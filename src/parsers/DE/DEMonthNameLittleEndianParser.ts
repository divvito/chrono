import Parser from '../parser';
import {ParsedResult} from "../../result";
import {ParseOptions} from "../../chrono";
import {DAY, MONTH, WEEKDAY, YEAR} from "../../constants";
import {MONTH_OFFSET, WEEKDAY_OFFSET, yearCalculation} from '../../utils/DE';
import {getAppropriateYear} from "../../utils/general";

export default class DEMonthNameLittleEndianParser extends Parser {
    private PATTERN: RegExp = new RegExp('(\\W|^)' +
        '(?:am\\s*?)?' +
        '(?:(Sonntag|Montag|Dienstag|Mittwoch|Donnerstag|Freitag|Samstag|So|Mo|Di|Mi|Do|Fr|Sa)\\s*,?\\s*)?' +
        '(?:den\\s*)?' +
        '([0-9]{1,2})\\.' +
        '(?:\\s*(?:bis(?:\\s*(?:am|zum))?|\\-|\\–|\\s)\\s*([0-9]{1,2})\\.)?\\s*' +
        '(Jan(?:uar|\\.)?|Feb(?:ruar|\\.)?|Mär(?:z|\\.)?|Maerz|Mrz\\.?|Apr(?:il|\\.)?|Mai|Jun(?:i|\\.)?|Jul(?:i|\\.)?|Aug(?:ust|\\.)?|Sep(?:t|t\\.|tember|\\.)?|Okt(?:ober|\\.)?|Nov(?:ember|\\.)?|Dez(?:ember|\\.)?)' +
        '(?:' +
        ',?\\s*([0-9]{1,4}(?![^\\s]\\d))' +
        '(\\s*[vn]\\.?\\s*C(?:hr)?\\.?)?' +
        ')?' +
        '(?=\\W|$)', 'i'
    );

    private WEEKDAY_GROUP: number = 2;
    private DATE_GROUP: number = 3;
    private DATE_TO_GROUP: number = 4;
    private MONTH_NAME_GROUP: number = 5;
    private YEAR_GROUP: number = 6;
    private YEAR_BE_GROUP: number = 7;


    private TAG: string = 'DEMonthNameLittleEndianParser';

    pattern(): RegExp {
        return this.PATTERN;
    }

    extract(text: string, ref: Date, match: RegExpExecArray, opt: ParseOptions): ParsedResult | null {
        const result: ParsedResult = new ParsedResult({
            text: match[0].substr(match[1].length, match[0].length - match[1].length),
            index: match.index + match[1].length,
            ref
        });

        const month: number = MONTH_OFFSET[match[this.MONTH_NAME_GROUP].toLowerCase()];

        const day: number = parseInt(match[this.DATE_GROUP], 10);

        result.start.assign(DAY, day);
        result.start.assign(MONTH, month);

        let year: number | null = yearCalculation(match[this.YEAR_GROUP], match[this.YEAR_BE_GROUP]);

        if (year !== null) {
            result.start.assign(YEAR, year);
        } else {
            getAppropriateYear(result.start, ref);
        }

        // Weekday component
        if (match[this.WEEKDAY_GROUP]) {
            result.start.assign(WEEKDAY, WEEKDAY_OFFSET[match[this.WEEKDAY_GROUP].toLowerCase()]);
        }

        // Text can be 'range' value. Such as '12 - 13 January 2012'
        if (match[this.DATE_TO_GROUP]) {
            result.end = result.start.clone();
            result.end.assign(DAY, parseInt(match[this.DATE_TO_GROUP], 10));
        }

        result.tags[this.TAG] = true;
        return result;
    }

}