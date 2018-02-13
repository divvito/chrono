import * as moment from "moment";
import {Moment} from "moment";
import Parser from '../parser';
import {ParsedResult} from '../../result';
import {ParseOptions} from "../../chrono";
import {DAY, HOUR, MERIDIEM, MILLISECOND, MINUTE, MONTH, SECOND, YEAR} from "../../constants";

export default class ZHHantCasualDateParser extends Parser {
    private PATTERN: RegExp = new RegExp(
        '(而家|立(?:刻|即)|即刻)|' +
        '(今|明|聽|昨|尋|琴)(早|朝|晚)|' +
        '(上(?:午|晝)|朝(?:早)|早(?:上)|下(?:午|晝)|晏(?:晝)|晚(?:上)|夜(?:晚)?|中(?:午)|凌(?:晨))|' +
        '(今|明|聽|昨|尋|琴)(?:日|天)' +
        '(?:[\\s|,|，]*)' +
        '(?:(上(?:午|晝)|朝(?:早)|早(?:上)|下(?:午|晝)|晏(?:晝)|晚(?:上)|夜(?:晚)?|中(?:午)|凌(?:晨)))?', 'i');

    private NOW_GROUP: number = 1;
    private DAY_GROUP_1: number = 2;
    private TIME_GROUP_1: number = 3;
    private TIME_GROUP_2: number = 4;
    private DAY_GROUP_3: number = 5;
    private TIME_GROUP_3: number = 6;


    private TAG: string = 'ZHCasualDateParser';

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

        if (match[this.NOW_GROUP]) {
            result.start.imply(HOUR, refMoment.hour());
            result.start.imply(MINUTE, refMoment.minute());
            result.start.imply(SECOND, refMoment.second());
            result.start.imply(MILLISECOND, refMoment.millisecond());
        } else if (match[this.DAY_GROUP_1]) {
            const day1: string = match[this.DAY_GROUP_1];
            const time1: string = match[this.TIME_GROUP_1];

            if (day1 === '明' || day1 === '聽') {
                // Check not "Tomorrow" on late night
                if (refMoment.hour() > 1) {
                    startMoment.add(1, 'day');
                }
            } else if (day1 === '昨' || day1 === '尋' || day1 === '琴') {
                startMoment.add(-1, 'day');
            }
            if (time1 === '早' || time1 === '朝') {
                result.start.imply(HOUR, 6);
            } else if (time1 === '晚') {
                result.start.imply(HOUR, 22);
                result.start.imply(MERIDIEM, 1);
            }
        } else if (match[this.TIME_GROUP_2]) {
            const timeString2: string = match[this.TIME_GROUP_2];
            const time2: string = timeString2[0];
            if (time2 === '早' || time2 === '朝' || time2 === '上') {
                result.start.imply(HOUR, 6);
            } else if (time2 === '下' || time2 === '晏') {
                result.start.imply(HOUR, 15);
                result.start.imply(MERIDIEM, 1);
            } else if (time2 === '中') {
                result.start.imply(HOUR, 12);
                result.start.imply(MERIDIEM, 1);
            } else if (time2 === '夜' || time2 === '晚') {
                result.start.imply(HOUR, 22);
                result.start.imply(MERIDIEM, 1);
            } else if (time2 === '凌') {
                result.start.imply(HOUR, 0);
            }

        } else if (match[this.DAY_GROUP_3]) {
            const day3: string = match[this.DAY_GROUP_3];

            if (day3 === '明' || day3 === '聽') {
                // Check not "Tomorrow" on late night
                if (refMoment.hour() > 1) {
                    startMoment.add(1, 'day');
                }
            } else if (day3 === '昨' || day3 === '尋' || day3 === '琴') {
                startMoment.add(-1, 'day');
            }


            const timeString3: string = match[this.TIME_GROUP_3];
            if (timeString3) {
                const time3: string = timeString3[0];
                if (time3 === '早' || time3 === '朝' || time3 === '上') {
                    result.start.imply(HOUR, 6);
                } else if (time3 === '下' || time3 === '晏') {
                    result.start.imply(HOUR, 15);
                    result.start.imply(MERIDIEM, 1);
                } else if (time3 === '中') {
                    result.start.imply(HOUR, 12);
                    result.start.imply(MERIDIEM, 1);
                } else if (time3 === '夜' || time3 === '晚') {
                    result.start.imply(HOUR, 22);
                    result.start.imply(MERIDIEM, 1);
                } else if (time3 === '凌') {
                    result.start.imply(HOUR, 0);
                }
            }
        }

        result.start.assign(DAY, startMoment.date());
        result.start.assign(MONTH, startMoment.month() + 1);
        result.start.assign(YEAR, startMoment.year());
        result.tags[this.TAG] = true;

        return result;
    }
}