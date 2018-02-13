import * as moment from "moment";
import {Moment} from "moment";
import Parser from '../parser';
import {ParsedResult} from '../../result';
import {ParseOptions} from "../../chrono";
import {DAY, HOUR, MERIDIEM, MONTH, YEAR} from "../../constants";

export default class JPCasualDateParser extends Parser {
    private PATTERN: RegExp = /今日|当日|昨日|明日|今夜|今夕|今晩|今朝/i;

    private TAG: string = 'JPCasualDateParser';

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

        const refMoment: Moment = moment(ref);
        const startMoment: Moment = refMoment.clone();
        const matchedText = result.text;

        if (matchedText === '今夜' || matchedText === '今夕' || matchedText === '今晩') {
            // Normally means this coming midnight
            result.start.imply(HOUR, 22);
            result.start.imply(MERIDIEM, 1);
        } else if (matchedText === '明日') {
            // Check not "Tomorrow" on late night
            if (refMoment.hour() > 4) {
                startMoment.add(1, 'day');
            }
        } else if (matchedText === '昨日') {
            startMoment.add(-1, 'day');
        } else if (matchedText.match("今朝")) {

            result.start.imply(HOUR, 6);
            result.start.imply(MERIDIEM, 0);
        }

        result.start.assign(DAY, startMoment.date());
        result.start.assign(MONTH, startMoment.month() + 1);
        result.start.assign(YEAR, startMoment.year());
        result.tags[this.TAG] = true;

        return result;
    }
}