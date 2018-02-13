import Parser from '../parser';
import {ParsedComponents, ParsedResult} from "../../result";
import {ParseOptions} from "../../chrono";
import {DAY, HOUR, MERIDIEM, MINUTE, MONTH, SECOND, YEAR} from "../../constants";
import * as moment from "moment";
import {Moment} from "moment";
import {NUMBER, zhStringToNumber} from "../../utils/ZH-Hant";

type Time = [number, number, number, number];

export default class ZHHantTimeExpressionParser extends Parser {
    private PATTERN: RegExp = new RegExp('(?:由|從|自)?' +
        '(?:' +
        '(今|明|聽|昨|尋|琴)(早|朝|晚)|' +
        '(上(?:午|晝)|朝(?:早)|早(?:上)|下(?:午|晝)|晏(?:晝)|晚(?:上)|夜(?:晚)?|中(?:午)|凌(?:晨))|' +
        '(今|明|聽|昨|尋|琴)(?:日|天)' +
        '(?:[\\s,，]*)' +
        '(?:(上(?:午|晝)|朝(?:早)|早(?:上)|下(?:午|晝)|晏(?:晝)|晚(?:上)|夜(?:晚)?|中(?:午)|凌(?:晨)))?' +
        ')?' +
        '(?:[\\s,，]*)' +
        '(?:(\\d+|[' + Object.keys(NUMBER).join('') + ']+)(?:\\s*)(?:點|時|:|：)' +
        '(?:\\s*)' +
        '(\\d+|半|正|整|[' + Object.keys(NUMBER).join('') + ']+)?(?:\\s*)(?:分|:|：)?' +
        '(?:\\s*)' +
        '(\\d+|[' + Object.keys(NUMBER).join('') + ']+)?(?:\\s*)(?:秒)?)' +
        '(?:\\s*(A\.M\.|P\.M\.|AM?|PM?))?', 'i');

    private END_PATTERN: RegExp = new RegExp('(?:\\s*(?:到|至|\\-|\\–|\\~|\\〜)\\s*)' +
        '(?:' +
        '(今|明|聽|昨|尋|琴)(早|朝|晚)|' +
        '(上(?:午|晝)|朝(?:早)|早(?:上)|下(?:午|晝)|晏(?:晝)|晚(?:上)|夜(?:晚)?|中(?:午)|凌(?:晨))|' +
        '(今|明|聽|昨|尋|琴)(?:日|天)' +
        '(?:[\\s,，]*)' +
        '(?:(上(?:午|晝)|朝(?:早)|早(?:上)|下(?:午|晝)|晏(?:晝)|晚(?:上)|夜(?:晚)?|中(?:午)|凌(?:晨)))?' +
        ')?' +
        '(?:[\\s,，]*)' +
        '(?:(\\d+|[' + Object.keys(NUMBER).join('') + ']+)(?:\\s*)(?:點|時|:|：)' +
        '(?:\\s*)' +
        '(\\d+|半|正|整|[' + Object.keys(NUMBER).join('') + ']+)?(?:\\s*)(?:分|:|：)?' +
        '(?:\\s*)' +
        '(\\d+|[' + Object.keys(NUMBER).join('') + ']+)?(?:\\s*)(?:秒)?)' +
        '(?:\\s*(A\.M\.|P\.M\.|AM?|PM?))?', 'i');

    private DAY_GROUP_1: number = 1;
    private ZH_AM_PM_HOUR_GROUP_1: number = 2;
    private ZH_AM_PM_HOUR_GROUP_2: number = 3;
    private DAY_GROUP_3: number = 4;
    private ZH_AM_PM_HOUR_GROUP_3: number = 5;
    private HOUR_GROUP: number = 6;
    private MINUTE_GROUP: number = 7;
    private SECOND_GROUP: number = 8;
    private AM_PM_HOUR_GROUP: number = 9;

    private TAG: string = 'ZHTimeExpressionParser';

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
            text: match[0],
            index: match.index,
            ref
        });

        result.tags[this.TAG] = true;

        result.start.imply(DAY, refMoment.date());
        result.start.imply(MONTH, refMoment.month() + 1);
        result.start.imply(YEAR, refMoment.year());

        const startMoment: Moment = refMoment.clone();

        if (!this.extractFirstChunk(result, match, refMoment, startMoment)) {
            return null;
        }

        const endMoment = startMoment.clone();

        if (!this.extractSecondChunk(text, result, refMoment, endMoment) && result.text.match(this.OTHER_PATTERNS[2])) {
            return null;
        }

        return result;
    }

    private extractFirstChunk(result: ParsedResult, match: RegExpExecArray, refMoment: Moment, startMoment: Moment): boolean {
        this.getDay(match, result.start, refMoment, startMoment);

        const time: Time | false = this.getTime(match);
        if (!time) {
            return false;
        }

        let [hour, minute, second, meridiem]: Time = time;

        if (second > -1) {
            result.start.assign(SECOND, second);
        }

        const gotMeridiem: [number, number] | null = this.getMeridiem(match, meridiem, hour);
        if (!gotMeridiem) {
            return false;
        }

        [meridiem, hour] = gotMeridiem;

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

    private extractSecondChunk(text: string, result: ParsedResult, refMoment: Moment, endMoment: Moment): boolean {
        const match: RegExpExecArray | null = this.END_PATTERN.exec(text.substring(result.index + result.text.length));

        if (!match) {
            return false;
        }

        // Pattern "YY.YY -XXXX" is more like timezone offset
        if (match[0].match(this.OTHER_PATTERNS[1])) {
            return true;
        }

        if (!result.end) {
            result.end = new ParsedComponents(undefined, result.start.date());
        }

        this.getDay(match, result.end, refMoment, endMoment);

        const time: Time | false = this.getTime(match);
        if (!time) {
            return true;
        }

        let [hour, minute, second, meridiem]: Time = time;

        if (second > -1) {
            result.end.assign(SECOND, second);
        }

        const gotMeridiem: [number, number] | null = this.getMeridiem(match, meridiem, hour);
        if (!gotMeridiem) {
            return false;
        }

        [meridiem, hour] = gotMeridiem;

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
        let hour: number;
        let minute: number = 0;
        let meridiem: number = -1;

        // ----- Second
        if (match[this.SECOND_GROUP]) {
            second = parseInt(match[this.SECOND_GROUP], 10);
            if (isNaN(second)) {
                second = zhStringToNumber(match[this.SECOND_GROUP]);
            }
            if (second >= 60) return false;
        }

        // ----- Hours
        hour = parseInt(match[this.HOUR_GROUP], 10);
        if (isNaN(hour)) {
            hour = zhStringToNumber(match[this.HOUR_GROUP]);
        }

        // ----- Minutes
        if (match[this.MINUTE_GROUP]) {
            if (match[this.MINUTE_GROUP] === '半') {
                minute = 30;
            } else if (match[this.MINUTE_GROUP] === '正' || match[this.MINUTE_GROUP] === '整') {
                minute = 0;
            } else {
                minute = parseInt(match[this.MINUTE_GROUP], 10);
                if (isNaN(minute)) {
                    minute = zhStringToNumber(match[this.MINUTE_GROUP]);
                }
            }
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

    private getDay(match: RegExpExecArray, current: ParsedComponents, refMoment: Moment, targetMoment: Moment): void {
        // ----- Day
        if (match[this.DAY_GROUP_1]) {
            const day1: string = match[this.DAY_GROUP_1];
            if (day1 === '明' || day1 === '聽') {
                // Check not "Tomorrow" on late night
                if(refMoment.hour() > 1) {
                    targetMoment.add(1, 'day');
                }
            } else if (day1 === '昨' || day1 === '尋' || day1 === '琴') {
                targetMoment.add(-1, 'day');
            }
            current.assign(DAY, targetMoment.date());
            current.assign(MONTH, targetMoment.month() + 1);
            current.assign(YEAR, targetMoment.year());
        } else if (match[this.DAY_GROUP_3]) {
            const day3: string = match[this.DAY_GROUP_3];
            if (day3 === '明' || day3 === '聽') {
                targetMoment.add(1, 'day');
            } else if (day3 === '昨' || day3 === '尋' || day3 === '琴') {
                targetMoment.add(-1, 'day');
            }
            current.assign(DAY, targetMoment.date());
            current.assign(MONTH, targetMoment.month() + 1);
            current.assign(YEAR, targetMoment.year());
        } else {
            current.imply(DAY, targetMoment.date());
            current.imply(MONTH, targetMoment.month() + 1);
            current.imply(YEAR, targetMoment.year());
        }
    }

    private getMeridiem(match: RegExpExecArray, meridiem: number, hour: number): [number, number] | null {
        // ----- AM & PM
        if (match[this.AM_PM_HOUR_GROUP]) {
            if (hour > 12) return null;
            const ampm: string = match[this.AM_PM_HOUR_GROUP][0].toLowerCase();
            if (ampm === 'a') {
                meridiem = 0;
                if (hour === 12) hour = 0;
            } else if (ampm === 'p') {
                meridiem = 1;
                if (hour !== 12) hour += 12;
            }
        } else if (match[this.ZH_AM_PM_HOUR_GROUP_1]) {
            const ampm: string = match[this.ZH_AM_PM_HOUR_GROUP_1][0];
            if (ampm === '朝' || ampm === '早') {
                meridiem = 0;
                if (hour === 12) hour = 0;
            } else if (ampm === '晚') {
                meridiem = 1;
                if (hour !== 12) hour += 12;
            }
        } else if (match[this.ZH_AM_PM_HOUR_GROUP_2]) {
            const ampm: string = match[this.ZH_AM_PM_HOUR_GROUP_2][0];
            if (ampm === '上' || ampm === '朝' || ampm === '早' || ampm === '凌') {
                meridiem = 0;
                if (hour === 12) hour = 0;
            } else if (ampm === '下' || ampm === '晏' || ampm === '晚') {
                meridiem = 1;
                if (hour !== 12) hour += 12;
            }
        } else if (match[this.ZH_AM_PM_HOUR_GROUP_3]) {
            const ampm: string = match[this.ZH_AM_PM_HOUR_GROUP_3][0];
            if (ampm === '上' || ampm === '朝' || ampm === '早' || ampm === '凌') {
                meridiem = 0;
                if (hour === 12) hour = 0;
            } else if (ampm === '下' || ampm === '晏' || ampm === '晚') {
                meridiem = 1;
                if (hour !== 12) hour += 12;
            }
        }

        return [meridiem, hour];
    }
}