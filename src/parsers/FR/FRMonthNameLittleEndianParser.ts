import Parser from '../parser';
import {ParsedResult} from '../../result';
import {ParseOptions} from "../../chrono";
import {MONTH_OFFSET, WEEKDAY_OFFSET, yearCalculation} from "../../utils/FR";
import {DAY, MONTH, WEEKDAY, YEAR} from "../../constants";
import {getAppropriateYear} from "../../utils/general";

export default class FRMonthNameLittleEndianParser extends Parser {
    private PATTERN: RegExp = new RegExp('(\\W|^)' +
        '(?:(Dimanche|Lundi|Mardi|mercredi|Jeudi|Vendredi|Samedi|Dim|Lun|Mar|Mer|Jeu|Ven|Sam)\\s*,?\\s*)?' +
        '([0-9]{1,2}|1er)' +
        '(?:\\s*(?:au|\\-|\\–|jusqu\'au?|\\s)\\s*([0-9]{1,2})(?:er)?)?\\s*(?:de)?\\s*' +
        '(Jan(?:vier|\\.)?|F[ée]v(?:rier|\\.)?|Mars|Avr(?:il|\\.)?|Mai|Juin|Juil(?:let|\\.)?|Ao[uû]t|Sept(?:embre|\\.)?|Oct(?:obre|\\.)?|Nov(?:embre|\\.)?|d[ée]c(?:embre|\\.)?)' +
        '(?:\\s*(\\s*[0-9]{1,4}(?![^\\s]\\d))(?:\\s*(AC|[ap]\\.?\\s*c(?:h(?:r)?)?\\.?\\s*n\\.?))?)?' +
        '(?=\\W|$)', 'i'
    );

    private WEEKDAY_GROUP: number = 2;
    private DATE_GROUP: number = 3;
    private DATE_TO_GROUP: number = 4;
    private MONTH_NAME_GROUP: number = 5;
    private YEAR_GROUP: number = 6;
    private YEAR_BE_GROUP: number = 7;

    private TAG: string = 'FRMonthNameLittleEndianParser';

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

        const day: number = parseInt(match[this.DATE_GROUP], 10);

        if (!day) {
            return null;
        }

        result.start.assign(DAY, day);
        result.start.assign(MONTH, month);

        let year: number | null = yearCalculation(match[this.YEAR_GROUP], match[this.YEAR_BE_GROUP]);

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
            const endDate = parseInt(match[this.DATE_TO_GROUP], 10);

            if (endDate) {
                result.end = result.start.clone();
                result.end.assign(DAY, endDate);
            }
        }

        return result;
    }
}