/*
    
    The parser for parsing month name and year.
    
    EX. 
        - January
        - January 2012
        - January, 2012
*/
import Parser from '../parser';
import {ParsedResult} from '../../result';
import {ParseOptions} from "../../chrono";
import {MONTH_OFFSET, yearCalculation} from "../../utils/EN";
import {DAY, MONTH, YEAR} from "../../constants";
import {getAppropriateYear} from "../../utils/general";

export default class ENMonthNameParser extends Parser {
    private PATTERN: RegExp = new RegExp('(^|\\D\\s+|[^\\w\\s])' +
        '(Jan\\.?|January|Feb\\.?|February|Mar\\.?|March|Apr\\.?|April|May\\.?|Jun\\.?|June|Jul\\.?|July|Aug\\.?|August|Sep\\.?|Sept\\.?|September|Oct\\.?|October|Nov\\.?|November|Dec\\.?|December)' +
        '\\s*' +
        '(?:' +
        '[,-]?\\s*([0-9]{4})(\\s*BE|AD|BC)?' +
        ')?' +
        '(?=[^\\s\\w]|\\s+[^0-9]|\\s+$|$)', 'i');

    private MONTH_NAME_GROUP: number = 2;
    private YEAR_GROUP: number = 3;
    private YEAR_BE_GROUP: number = 4;

    private TAG: string = 'ENMonthNameParser';

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

        result.start.assign(DAY, 1);
        result.start.assign(MONTH, month);

        let year: number | null = yearCalculation(
            match[this.YEAR_GROUP],
            match[this.YEAR_BE_GROUP]
        );

        if (year) {
            result.start.assign(YEAR, year);
        } else {
            getAppropriateYear(result.start, ref);
        }


        return result;
    }
}