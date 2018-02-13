import Parser from '../parser';
import {ParsedResult} from "../../result";
import {ParseOptions} from "../../chrono";
import {DAY, MONTH, YEAR} from "../../constants";
import {MONTH_OFFSET, yearCalculation} from '../../utils/DE';
import {getAppropriateYear} from "../../utils/general";

export default class DEMonthNameParser extends Parser {
    private PATTERN: RegExp = new RegExp('(^|\\D\\s+|[^\\w\\s])' +
        '(Jan\\.?|Januar|Feb\\.?|Februar|Mär\\.?|M(?:ä|ae)rz|Mrz\\.?|Apr\\.?|April|Mai\\.?|Jun\\.?|Juni|Jul\\.?|Juli|Aug\\.?|August|Sep\\.?|Sept\\.?|September|Okt\\.?|Oktober|Nov\\.?|November|Dez\\.?|Dezember)' +
        '\\s*' +
        '(?:' +
        ',?\\s*(?:([0-9]{4})(\\s*[vn]\\.?\\s*C(?:hr)?\\.?)?|([0-9]{1,4})\\s*([vn]\\.?\\s*C(?:hr)?\\.?))' +
        ')?' +
        '(?=[^\\s\\w]|$)', 'i');

    private MONTH_NAME_GROUP: number = 2;
    private YEAR_GROUP: number = 3;
    private YEAR_BE_GROUP: number = 4;
    private YEAR_GROUP2: number = 5;
    private YEAR_BE_GROUP2: number = 6;

    private TAG: string = 'DEMonthNameParser';

    pattern(): RegExp {
        return this.PATTERN;
    }

    extract(text: string, ref: Date, match: RegExpExecArray, opt: ParseOptions): ParsedResult | null {
        const result: ParsedResult = new ParsedResult({
            text: match[0].substr(match[1].length, match[0].length - match[1].length),
            index: match.index + match[1].length,
            ref: ref,
        });


        const month = MONTH_OFFSET[match[this.MONTH_NAME_GROUP].toLowerCase()];

        result.start.imply(DAY, 1);
        result.start.assign(MONTH, month);

        let year: number | null = yearCalculation(match[this.YEAR_GROUP] || match[this.YEAR_GROUP2], match[this.YEAR_BE_GROUP] || match[this.YEAR_BE_GROUP2]);

        if (year !== null) {
            result.start.assign(YEAR, year);
        } else {
            getAppropriateYear(result.start, ref);
        }

        result.tags[this.TAG] = true;
        return result;
    }
}

