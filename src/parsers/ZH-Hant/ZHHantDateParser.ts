import * as moment from "moment";
import {Moment} from "moment";
import Parser from '../parser';
import {ParsedResult} from '../../result';
import {ParseOptions} from "../../chrono";
import {DAY, MONTH, YEAR} from "../../constants";
import {NUMBER, zhStringToNumber, zhStringToYear} from "../../utils/ZH-Hant";

export default class ZHHantDateParser extends Parser {
    private PATTERN: RegExp = new RegExp(
        '(\\d{2,4}|[' + Object.keys(NUMBER).join('') + ']{2,4})?' +
        '(?:\\s*)' +
        '(?:年)?' +
        '(?:[\\s|,|，]*)' +
        '(\\d{1,2}|[' + Object.keys(NUMBER).join('') + ']{1,2})' +
        '(?:\\s*)' +
        '(?:月)' +
        '(?:\\s*)' +
        '(\\d{1,2}|[' + Object.keys(NUMBER).join('') + ']{1,2})?' +
        '(?:\\s*)' +
        '(?:日|號)?'
    );

    private YEAR_GROUP: number = 1;
    private MONTH_GROUP: number = 2;
    private DAY_GROUP: number = 3;


    private TAG: string = 'ZHDateParser';

    pattern(): RegExp {
        return this.PATTERN;
    }

    extract(text: string, ref: Date, match: RegExpExecArray, opt: ParseOptions): ParsedResult | null {
        const index: number = match.index;
        const result: ParsedResult = new ParsedResult({
            text: match[0],
            index,
            ref
        });

        result.tags[this.TAG] = true;

        const startMoment: Moment = moment(ref);
        const matchedMonth = match[this.MONTH_GROUP];
        const matchedDay = match[this.DAY_GROUP];
        const matchedYear = match[this.YEAR_GROUP];

        let month: number = parseInt(matchedMonth, 10);
        if (isNaN(month)) {
            month = zhStringToNumber(matchedMonth);
        }

        result.start.assign(MONTH, month);

        if (matchedDay) {
            let day: number = parseInt(matchedDay, 10);
            if (isNaN(day)) {
                day = zhStringToNumber(matchedDay);
            }
            result.start.assign(DAY, day);
        } else {
            result.start.assign(DAY, startMoment.date());
        }

        if (matchedYear) {
            let year: number = parseInt(matchedYear, 10);
            if (isNaN(year)) {
                year = zhStringToYear(matchedYear);
            }
            result.start.assign(YEAR, year);
        } else {
            result.start.assign(YEAR, startMoment.year());
        }

        return result;
    }
}