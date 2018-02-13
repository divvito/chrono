import Parser from '../parser';
import {ParsedComponents, ParsedResult} from "../../result";
import {ParseOptions} from "../../chrono";
import {DAY, HOUR, MERIDIEM, MINUTE, MONTH, SECOND, YEAR} from "../../constants";
import * as moment from "moment";
import {Moment} from "moment";

type Time = [number, number, number, number];

export default class FRTimeExpressionParser extends Parser {
    private PATTERN: RegExp = new RegExp("(^|\\s|T)" +
        "(?:(?:[àa])\\s*)?" +
        "(\\d{1,2}(?:h)?|midi|minuit)" +
        "(?:" +
        "(?:\\.|\\:|\\：|h)(\\d{1,2})(?:m)?" +
        "(?:" +
        "(?:\\:|\\：|m)(\\d{0,2})(?:s)?" +
        ")?" +
        ")?" +
        "(?:\\s*(A\\.M\\.|P\\.M\\.|AM?|PM?))?" +
        "(?=\\W|$)", 'i'
    );

    private END_PATTERN: RegExp = new RegExp("^\\s*" +
        "(\\-|\\–|\\~|\\〜|[àa]|\\?)\\s*" +
        "(\\d{1,2}(?:h)?)" +
        "(?:" +
        "(?:\\.|\\:|\\：|h)(\\d{1,2})(?:m)?" +
        "(?:" +
        "(?:\\.|\\:|\\：|m)(\\d{1,2})(?:s)?" +
        ")?" +
        ")?" +
        "(?:\\s*(A\\.M\\.|P\\.M\\.|AM?|PM?))?" +
        "(?=\\W|$)", 'i'
    );

    private HOUR_GROUP = 2;
    private MINUTE_GROUP = 3;
    private SECOND_GROUP = 4;
    private AM_PM_HOUR_GROUP = 5;

    private TAG: string = 'FRTimeExpressionParser';

    private OTHER_PATTERNS: RegExp[] = [
        /\w/,
        /^\s*([+\-])\s*\d{3,4}$/,
        /^\d+$/
    ];

    pattern(): RegExp {
        return this.PATTERN;
    }

    extract(text: string, ref: Date, match: RegExpExecArray, opt: ParseOptions): ParsedResult | null {
        // This pattern can be overlaped Ex. [12] AM, 1[2] AM
        if (match.index > 0 && text[match.index - 1].match(this.OTHER_PATTERNS[0])) return null;

        const refMoment: Moment = moment(ref);

        const result: ParsedResult = new ParsedResult({
            text: match[0].substring(match[1].length),
            index: match.index + match[1].length,
            ref
        });

        result.tags[this.TAG] = true;

        result.start.imply(DAY, refMoment.date());
        result.start.imply(MONTH, refMoment.month() + 1);
        result.start.imply(YEAR, refMoment.year());

        if (!this.extractFirstChunk(result, match)) {
            return null;
        }

        if (!this.extractSecondChunk(text, result) && result.text.match(this.OTHER_PATTERNS[2])) {
            return null;
        }

        return result;
    }

    private extractFirstChunk(result: ParsedResult, match: RegExpExecArray): boolean {
        const time: Time | false = this.getTime(match);
        if (!time) {
            return false;
        }

        let [hour, minute, second, meridiem]: Time = time;

        if (second > -1) {
            result.start.assign(SECOND, second);
        }


        // ----- AM & PM
        if (match[this.AM_PM_HOUR_GROUP]) {
            if (hour > 12) return false;
            const ampm: string = match[this.AM_PM_HOUR_GROUP][0].toLowerCase();
            if (ampm === 'a') {
                meridiem = 0;
                if (hour === 12) hour = 0;
            } else if (ampm === 'p') {
                meridiem = 1;
                if (hour !== 12) hour += 12;
            }
        }

        result.start.assign(HOUR, hour);
        result.start.assign(MINUTE, minute);

        if (meridiem >= 0) {
            result.start.assign(MERIDIEM, meridiem);
        } else {
            if (hour < 12) {
                result.start.imply(MERIDIEM, 0);
            } else {
                result.start.imply(MERIDIEM, 1);
            }
        }

        return true;
    }

    private extractSecondChunk(text: string, result: ParsedResult): boolean {
        const match: RegExpExecArray | null = this.END_PATTERN.exec(text.substring(result.index + result.text.length));

        if (!match) {
            return false;
        }

        // Pattern "YY.YY -XXXX" is more like timezone offset
        if (match[0].match(this.OTHER_PATTERNS[1])) {
            return true;
        }

        const time: Time | false = this.getTime(match);
        if (!time) {
            return true;
        }

        let [hour, minute, second, meridiem]: Time = time;

        if (!result.end) {
            result.end = new ParsedComponents(undefined, result.start.date());
        }

        if (second > -1) {
            result.end.assign(SECOND, second);
        }

        // ----- AM & PM
        if (match[this.AM_PM_HOUR_GROUP]) {

            if (hour > 12) return false;

            const ampm: string = match[this.AM_PM_HOUR_GROUP][0].toLowerCase();
            if (ampm === 'a') {
                meridiem = 0;
                if (hour === 12) {
                    hour = 0;
                    if (!result.end.isCertain(DAY)) {
                        result.end.imply(DAY, result.end.get(DAY) + 1);
                    }
                }
            }

            if (ampm === 'p') {
                meridiem = 1;
                if (hour !== 12) hour += 12;
            }

            if (!result.start.isCertain(MERIDIEM)) {
                if (meridiem === 0) {
                    result.start.imply(MERIDIEM, 0);

                    if (result.start.get(HOUR) === 12) {
                        result.start.assign(HOUR, 0);
                    }
                } else {
                    result.start.imply(MERIDIEM, 1);

                    if (result.start.get(HOUR) !== 12) {
                        result.start.assign(HOUR, result.start.get(HOUR) + 12);
                    }
                }
            }
        }

        result.text = result.text + match[0];
        result.end.assign(HOUR, hour);
        result.end.assign(MINUTE, minute);
        if (meridiem >= 0) {
            result.end.assign(MERIDIEM, meridiem);
        } else {
            const startAtPM: boolean = result.start.isCertain(MERIDIEM) && result.start.get(MERIDIEM) === 1;
            if (startAtPM && result.start.get(HOUR) > hour) {
                // 10pm - 1 (am)
                result.end.imply(MERIDIEM, 0);

            } else if (hour > 12) {
                result.end.imply(MERIDIEM, 1);
            }
        }

        if (result.end.date().getTime() < result.start.date().getTime()) {
            result.end.imply(DAY, result.end.get(DAY) + 1)
        }

        return true;
    }

    private getTime(match: RegExpExecArray): Time | false {
        let second: number = -1;
        let hour: number = 0;
        let minute: number = 0;
        let meridiem: number = -1;

        // ----- Second
        if (match[this.SECOND_GROUP]) {
            second = parseInt(match[this.SECOND_GROUP], 10);
            if (second >= 60) return false;
        }

        // ----- Hours
        if (match[this.HOUR_GROUP].toLowerCase() === 'midi') {
            meridiem = 1;
            hour = 12;
        } else if (match[this.HOUR_GROUP].toLowerCase() === 'minuit') {
            meridiem = 0;
            hour = 0;
        } else {
            hour = parseInt(match[this.HOUR_GROUP], 10);
        }

        // ----- Minutes
        if (match[this.MINUTE_GROUP]) {
            minute = parseInt(match[this.MINUTE_GROUP], 10);
        } else if (hour > 100) {
            minute = hour % 100;
            hour = Math.floor(hour / 100);
        }

        if (minute >= 60) {
            return false;
        }

        if (hour > 24) {
            return false;
        }
        if (hour >= 12) {
            meridiem = 1;
        }

        return [hour, minute, second, meridiem];
    }
}