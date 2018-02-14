"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const moment = require("moment");
const parser_1 = require("../parser");
const result_1 = require("../../result");
const constants_1 = require("../../constants");
class ZHHantCasualDateParser extends parser_1.default {
    constructor() {
        super(...arguments);
        this.PATTERN = new RegExp('(而家|立(?:刻|即)|即刻)|' +
            '(今|明|聽|昨|尋|琴)(早|朝|晚)|' +
            '(上(?:午|晝)|朝(?:早)|早(?:上)|下(?:午|晝)|晏(?:晝)|晚(?:上)|夜(?:晚)?|中(?:午)|凌(?:晨))|' +
            '(今|明|聽|昨|尋|琴)(?:日|天)' +
            '(?:[\\s|,|，]*)' +
            '(?:(上(?:午|晝)|朝(?:早)|早(?:上)|下(?:午|晝)|晏(?:晝)|晚(?:上)|夜(?:晚)?|中(?:午)|凌(?:晨)))?', 'i');
        this.NOW_GROUP = 1;
        this.DAY_GROUP_1 = 2;
        this.TIME_GROUP_1 = 3;
        this.TIME_GROUP_2 = 4;
        this.DAY_GROUP_3 = 5;
        this.TIME_GROUP_3 = 6;
        this.TAG = 'ZHCasualDateParser';
    }
    pattern() {
        return this.PATTERN;
    }
    extract(text, ref, match, opt) {
        const index = match.index;
        const result = new result_1.ParsedResult({
            text: match[0],
            index,
            ref
        });
        const refMoment = moment(ref);
        const startMoment = refMoment.clone();
        if (match[this.NOW_GROUP]) {
            result.start.imply(constants_1.HOUR, refMoment.hour());
            result.start.imply(constants_1.MINUTE, refMoment.minute());
            result.start.imply(constants_1.SECOND, refMoment.second());
            result.start.imply(constants_1.MILLISECOND, refMoment.millisecond());
        }
        else if (match[this.DAY_GROUP_1]) {
            const day1 = match[this.DAY_GROUP_1];
            const time1 = match[this.TIME_GROUP_1];
            if (day1 === '明' || day1 === '聽') {
                // Check not "Tomorrow" on late night
                if (refMoment.hour() > 1) {
                    startMoment.add(1, 'day');
                }
            }
            else if (day1 === '昨' || day1 === '尋' || day1 === '琴') {
                startMoment.add(-1, 'day');
            }
            if (time1 === '早' || time1 === '朝') {
                result.start.imply(constants_1.HOUR, 6);
            }
            else if (time1 === '晚') {
                result.start.imply(constants_1.HOUR, 22);
                result.start.imply(constants_1.MERIDIEM, 1);
            }
        }
        else if (match[this.TIME_GROUP_2]) {
            const timeString2 = match[this.TIME_GROUP_2];
            const time2 = timeString2[0];
            if (time2 === '早' || time2 === '朝' || time2 === '上') {
                result.start.imply(constants_1.HOUR, 6);
            }
            else if (time2 === '下' || time2 === '晏') {
                result.start.imply(constants_1.HOUR, 15);
                result.start.imply(constants_1.MERIDIEM, 1);
            }
            else if (time2 === '中') {
                result.start.imply(constants_1.HOUR, 12);
                result.start.imply(constants_1.MERIDIEM, 1);
            }
            else if (time2 === '夜' || time2 === '晚') {
                result.start.imply(constants_1.HOUR, 22);
                result.start.imply(constants_1.MERIDIEM, 1);
            }
            else if (time2 === '凌') {
                result.start.imply(constants_1.HOUR, 0);
            }
        }
        else if (match[this.DAY_GROUP_3]) {
            const day3 = match[this.DAY_GROUP_3];
            if (day3 === '明' || day3 === '聽') {
                // Check not "Tomorrow" on late night
                if (refMoment.hour() > 1) {
                    startMoment.add(1, 'day');
                }
            }
            else if (day3 === '昨' || day3 === '尋' || day3 === '琴') {
                startMoment.add(-1, 'day');
            }
            const timeString3 = match[this.TIME_GROUP_3];
            if (timeString3) {
                const time3 = timeString3[0];
                if (time3 === '早' || time3 === '朝' || time3 === '上') {
                    result.start.imply(constants_1.HOUR, 6);
                }
                else if (time3 === '下' || time3 === '晏') {
                    result.start.imply(constants_1.HOUR, 15);
                    result.start.imply(constants_1.MERIDIEM, 1);
                }
                else if (time3 === '中') {
                    result.start.imply(constants_1.HOUR, 12);
                    result.start.imply(constants_1.MERIDIEM, 1);
                }
                else if (time3 === '夜' || time3 === '晚') {
                    result.start.imply(constants_1.HOUR, 22);
                    result.start.imply(constants_1.MERIDIEM, 1);
                }
                else if (time3 === '凌') {
                    result.start.imply(constants_1.HOUR, 0);
                }
            }
        }
        result.start.assign(constants_1.DAY, startMoment.date());
        result.start.assign(constants_1.MONTH, startMoment.month() + 1);
        result.start.assign(constants_1.YEAR, startMoment.year());
        result.tags[this.TAG] = true;
        return result;
    }
}
exports.default = ZHHantCasualDateParser;
