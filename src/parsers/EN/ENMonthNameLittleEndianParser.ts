import Parser from '../parser';
import {ParsedResult} from '../../result';
import {ParseOptions} from "../../chrono";
import {MONTH_OFFSET, ORDINAL_WORDS, ORDINAL_WORDS_PATTERN, WEEKDAY_OFFSET, yearCalculation} from "../../utils/EN";
import {DAY, MONTH, WEEKDAY, YEAR} from "../../constants";
import {getAppropriateYear} from "../../utils/general";

export default class ENMonthNameLittleEndianParser extends Parser {
    private PATTERN: RegExp = new RegExp('(\\W|^)' +
        '(?:on\\s*?)?' +
        '(?:(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sun|Mon|Tue|Wed|Thu|Fri|Sat)\\s*,?\\s*)?' +
        '(([0-9]{1,2})(?:st|nd|rd|th)?|' + ORDINAL_WORDS_PATTERN + ')' +
        '(?:\\s*' +
        '(?:to|\\-|\\–|until|through|till|\\s)\\s*' +
        '(([0-9]{1,2})(?:st|nd|rd|th)?|' + ORDINAL_WORDS_PATTERN + ')' +
        ')?' +
        '(?:-|\/|\\s*(?:of)?\\s*)' +
        '(Jan(?:uary|\\.)?|Feb(?:ruary|\\.)?|Mar(?:ch|\\.)?|Apr(?:il|\\.)?|May|Jun(?:e|\\.)?|Jul(?:y|\\.)?|Aug(?:ust|\\.)?|Sep(?:tember|\\.)?|Oct(?:ober|\\.)?|Nov(?:ember|\\.)?|Dec(?:ember|\\.)?)' +
        '(?:' +
        '(?:-|\/|,?\\s*)' +
        '((?:' +
        '[1-9][0-9]{0,3}\\s*(?:BE|AD|BC)|' +
        '[1-2][0-9]{3}' +
        ')(?![^\\s]\\d))' +
        ')?' +
        '(?=\\W|$)', 'i'
    );

    private WEEKDAY_GROUP: number = 2;
    private DATE_GROUP: number = 3;
    private DATE_NUM_GROUP: number = 4;
    private DATE_TO_GROUP: number = 5;
    private DATE_TO_NUM_GROUP: number = 6;
    private MONTH_NAME_GROUP: number = 7;
    private YEAR_GROUP: number = 8;

    private TAG: string = 'ENMonthNameLittleEndianParser';

    pattern(): RegExp {
        return this.PATTERN;
    }

    extract(text: string, ref: Date, match: RegExpExecArray, opt: ParseOptions): ParsedResult | null {
        const index: number = match.index + match[1].length;
        const result: ParsedResult = new ParsedResult({
            text: match[0].substr(match[1].length, match[0].length - match[1].length),
            index,
            ref
        });

        result.tags[this.TAG] = true;

        const month: number = MONTH_OFFSET[match[this.MONTH_NAME_GROUP].toLowerCase()];

        if (!(month || month === 0)) {
            return null;
        }

        const day: number = match[this.DATE_NUM_GROUP] ?
            parseInt(match[this.DATE_NUM_GROUP], 10) :
            ORDINAL_WORDS[match[this.DATE_GROUP].trim().replace('-', ' ').toLowerCase()];


        if (!day) {
            return null;
        }

        result.start.assign(DAY, day);
        result.start.assign(MONTH, month);

        let year: number | null = yearCalculation(match[this.YEAR_GROUP]);


        if (year) {
            result.start.assign(YEAR, year);
        } else {
            getAppropriateYear(result.start, ref);
        }

        // Weekday component
        if (match[this.WEEKDAY_GROUP]) {
            const weekday: number = WEEKDAY_OFFSET[match[this.WEEKDAY_GROUP].toLowerCase()];
            if (weekday || weekday === 0) {
                result.start.assign(WEEKDAY, weekday);
            }
        }

        // Text can be 'range' value. Such as '12 - 13 January 2012'
        if (match[this.DATE_TO_GROUP]) {
            const endDate = match[this.DATE_TO_NUM_GROUP] ?
                parseInt(match[this.DATE_TO_NUM_GROUP], 10) :
                ORDINAL_WORDS[match[this.DATE_TO_GROUP].trim().replace('-', ' ').toLowerCase()];

            if (endDate) {
                result.end = result.start.clone();
                result.end.assign(DAY, endDate);
            }
        }

        return result;
    }
}

