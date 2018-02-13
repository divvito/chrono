/*
    ISO 8601
    http://www.w3.org/TR/NOTE-datetime
    - YYYY-MM-DD
    - YYYY-MM-DDThh:mmTZD
    - YYYY-MM-DDThh:mm:ssTZD
    - YYYY-MM-DDThh:mm:ss.sTZD 
    - TZD = (Z or +hh:mm or -hh:mm)
*/
import Parser from '../parser';
import {ParsedResult} from '../../result';
import {ParseOptions} from "../../chrono";
import {DAY, HOUR, MILLISECOND, MINUTE, MONTH, SECOND, TIMEZONE_OFFSET, YEAR} from "../../constants";

export default class ENISOFormatParser extends Parser {
    private PATTERN: RegExp = new RegExp('(\\W|^)'
        + '([0-9]{4})\\-([0-9]{1,2})\\-([0-9]{1,2})'
        + '(?:T' //..
        + '([0-9]{1,2}):([0-9]{1,2})' // hh:mm
        + '(?::([0-9]{1,2})(?:\\.(\\d{1,4}))?)?' // :ss.s
        + '(?:Z|([+-]\\d{2}):?(\\d{2})?)?' // TZD (Z or ±hh:mm or ±hhmm or ±hh)
        + ')?'  //..
        + '(?=\\W|$)', 'i');

    private YEAR_NUMBER_GROUP: number = 2;
    private MONTH_NUMBER_GROUP: number = 3;
    private DATE_NUMBER_GROUP: number = 4;
    private HOUR_NUMBER_GROUP: number = 5;
    private MINUTE_NUMBER_GROUP: number = 6;
    private SECOND_NUMBER_GROUP: number = 7;
    private MILLISECOND_NUMBER_GROUP: number = 8;
    private TZD_HOUR_OFFSET_GROUP: number = 9;
    private TZD_MINUTE_OFFSET_GROUP: number = 10;

    private TAG: string = 'ENISOFormatParser';

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

        result.start.assign(YEAR, parseInt(match[this.YEAR_NUMBER_GROUP], 10));
        result.start.assign(MONTH, parseInt(match[this.MONTH_NUMBER_GROUP], 10));
        result.start.assign(DAY, parseInt(match[this.DATE_NUMBER_GROUP], 10));

        if (result.start.get(MONTH) > 12 || result.start.get(MONTH) < 1 ||
            result.start.get(DAY) > 31 || result.start.get(DAY) < 1) {
            return null;
        }

        if (match[this.HOUR_NUMBER_GROUP] != null) {
            result.start.assign(HOUR, parseInt(match[this.HOUR_NUMBER_GROUP], 10));
            result.start.assign(MINUTE, parseInt(match[this.MINUTE_NUMBER_GROUP], 10));

            if (match[this.SECOND_NUMBER_GROUP] != null) {
                result.start.assign(SECOND, parseInt(match[this.SECOND_NUMBER_GROUP],10));
            }

            if (match[this.MILLISECOND_NUMBER_GROUP] != null) {
                result.start.assign(MILLISECOND, parseInt(match[this.MILLISECOND_NUMBER_GROUP], 10));
            }

            if (match[this.TZD_HOUR_OFFSET_GROUP] == null) {
                result.start.assign(TIMEZONE_OFFSET, 0);
            } else {
                let minuteOffset: number = 0;
                const hourOffset: number = parseInt(match[this.TZD_HOUR_OFFSET_GROUP], 10);
                if (match[this.TZD_MINUTE_OFFSET_GROUP] != null)
                    minuteOffset = parseInt(match[this.TZD_MINUTE_OFFSET_GROUP], 10);

                let offset: number = hourOffset * 60;
                if (offset < 0) {
                    offset -= minuteOffset;
                } else {
                    offset += minuteOffset;
                }

                result.start.assign(TIMEZONE_OFFSET, offset);
            }
        }

        return result;
    }
}