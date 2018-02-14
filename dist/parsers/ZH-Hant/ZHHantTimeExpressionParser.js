"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parser_1 = require("../parser");
const result_1 = require("../../result");
const constants_1 = require("../../constants");
const moment = require("moment");
const ZH_Hant_1 = require("../../utils/ZH-Hant");
class ZHHantTimeExpressionParser extends parser_1.default {
    constructor() {
        super(...arguments);
        this.PATTERN = new RegExp('(?:由|從|自)?' +
            '(?:' +
            '(今|明|聽|昨|尋|琴)(早|朝|晚)|' +
            '(上(?:午|晝)|朝(?:早)|早(?:上)|下(?:午|晝)|晏(?:晝)|晚(?:上)|夜(?:晚)?|中(?:午)|凌(?:晨))|' +
            '(今|明|聽|昨|尋|琴)(?:日|天)' +
            '(?:[\\s,，]*)' +
            '(?:(上(?:午|晝)|朝(?:早)|早(?:上)|下(?:午|晝)|晏(?:晝)|晚(?:上)|夜(?:晚)?|中(?:午)|凌(?:晨)))?' +
            ')?' +
            '(?:[\\s,，]*)' +
            '(?:(\\d+|[' + Object.keys(ZH_Hant_1.NUMBER).join('') + ']+)(?:\\s*)(?:點|時|:|：)' +
            '(?:\\s*)' +
            '(\\d+|半|正|整|[' + Object.keys(ZH_Hant_1.NUMBER).join('') + ']+)?(?:\\s*)(?:分|:|：)?' +
            '(?:\\s*)' +
            '(\\d+|[' + Object.keys(ZH_Hant_1.NUMBER).join('') + ']+)?(?:\\s*)(?:秒)?)' +
            '(?:\\s*(A\.M\.|P\.M\.|AM?|PM?))?', 'i');
        this.END_PATTERN = new RegExp('(?:\\s*(?:到|至|\\-|\\–|\\~|\\〜)\\s*)' +
            '(?:' +
            '(今|明|聽|昨|尋|琴)(早|朝|晚)|' +
            '(上(?:午|晝)|朝(?:早)|早(?:上)|下(?:午|晝)|晏(?:晝)|晚(?:上)|夜(?:晚)?|中(?:午)|凌(?:晨))|' +
            '(今|明|聽|昨|尋|琴)(?:日|天)' +
            '(?:[\\s,，]*)' +
            '(?:(上(?:午|晝)|朝(?:早)|早(?:上)|下(?:午|晝)|晏(?:晝)|晚(?:上)|夜(?:晚)?|中(?:午)|凌(?:晨)))?' +
            ')?' +
            '(?:[\\s,，]*)' +
            '(?:(\\d+|[' + Object.keys(ZH_Hant_1.NUMBER).join('') + ']+)(?:\\s*)(?:點|時|:|：)' +
            '(?:\\s*)' +
            '(\\d+|半|正|整|[' + Object.keys(ZH_Hant_1.NUMBER).join('') + ']+)?(?:\\s*)(?:分|:|：)?' +
            '(?:\\s*)' +
            '(\\d+|[' + Object.keys(ZH_Hant_1.NUMBER).join('') + ']+)?(?:\\s*)(?:秒)?)' +
            '(?:\\s*(A\.M\.|P\.M\.|AM?|PM?))?', 'i');
        this.DAY_GROUP_1 = 1;
        this.ZH_AM_PM_HOUR_GROUP_1 = 2;
        this.ZH_AM_PM_HOUR_GROUP_2 = 3;
        this.DAY_GROUP_3 = 4;
        this.ZH_AM_PM_HOUR_GROUP_3 = 5;
        this.HOUR_GROUP = 6;
        this.MINUTE_GROUP = 7;
        this.SECOND_GROUP = 8;
        this.AM_PM_HOUR_GROUP = 9;
        this.TAG = 'ZHTimeExpressionParser';
        this.OTHER_PATTERNS = [
            /\w/,
            /^\s*([+\-])\s*\d{3,4}$/,
            /^\d+$/
        ];
    }
    pattern() {
        return this.PATTERN;
    }
    extract(text, ref, match, opt) {
        // This pattern can be overlaped Ex. [12] AM, 1[2] AM
        if (match.index > 0 && text[match.index - 1].match(this.OTHER_PATTERNS[0]))
            return null;
        const refMoment = moment(ref);
        const result = new result_1.ParsedResult({
            text: match[0],
            index: match.index,
            ref
        });
        result.tags[this.TAG] = true;
        result.start.imply(constants_1.DAY, refMoment.date());
        result.start.imply(constants_1.MONTH, refMoment.month() + 1);
        result.start.imply(constants_1.YEAR, refMoment.year());
        const startMoment = refMoment.clone();
        if (!this.extractFirstChunk(result, match, refMoment, startMoment)) {
            return null;
        }
        const endMoment = startMoment.clone();
        if (!this.extractSecondChunk(text, result, refMoment, endMoment) && result.text.match(this.OTHER_PATTERNS[2])) {
            return null;
        }
        return result;
    }
    extractFirstChunk(result, match, refMoment, startMoment) {
        this.getDay(match, result.start, refMoment, startMoment);
        const time = this.getTime(match);
        if (!time) {
            return false;
        }
        let [hour, minute, second, meridiem] = time;
        if (second > -1) {
            result.start.assign(constants_1.SECOND, second);
        }
        const gotMeridiem = this.getMeridiem(match, meridiem, hour);
        if (!gotMeridiem) {
            return false;
        }
        [meridiem, hour] = gotMeridiem;
        result.start.assign(constants_1.HOUR, hour);
        result.start.assign(constants_1.MINUTE, minute);
        if (meridiem >= 0) {
            result.start.assign(constants_1.MERIDIEM, meridiem);
        }
        else {
            if (hour < 12) {
                result.start.imply(constants_1.MERIDIEM, 0);
            }
            else {
                result.start.imply(constants_1.MERIDIEM, 1);
            }
        }
        return true;
    }
    extractSecondChunk(text, result, refMoment, endMoment) {
        const match = this.END_PATTERN.exec(text.substring(result.index + result.text.length));
        if (!match) {
            return false;
        }
        // Pattern "YY.YY -XXXX" is more like timezone offset
        if (match[0].match(this.OTHER_PATTERNS[1])) {
            return true;
        }
        if (!result.end) {
            result.end = new result_1.ParsedComponents(undefined, result.start.date());
        }
        this.getDay(match, result.end, refMoment, endMoment);
        const time = this.getTime(match);
        if (!time) {
            return true;
        }
        let [hour, minute, second, meridiem] = time;
        if (second > -1) {
            result.end.assign(constants_1.SECOND, second);
        }
        const gotMeridiem = this.getMeridiem(match, meridiem, hour);
        if (!gotMeridiem) {
            return false;
        }
        [meridiem, hour] = gotMeridiem;
        result.text = result.text + match[0];
        result.end.assign(constants_1.HOUR, hour);
        result.end.assign(constants_1.MINUTE, minute);
        if (meridiem >= 0) {
            result.end.assign(constants_1.MERIDIEM, meridiem);
        }
        else {
            const startAtPM = result.start.isCertain(constants_1.MERIDIEM) && result.start.get(constants_1.MERIDIEM) === 1;
            if (startAtPM && result.start.get(constants_1.HOUR) > hour) {
                // 10pm - 1 (am)
                result.end.imply(constants_1.MERIDIEM, 0);
            }
            else if (hour > 12) {
                result.end.imply(constants_1.MERIDIEM, 1);
            }
        }
        if (result.end.date().getTime() < result.start.date().getTime()) {
            result.end.imply(constants_1.DAY, result.end.get(constants_1.DAY) + 1);
        }
        return true;
    }
    getTime(match) {
        let second = -1;
        let hour;
        let minute = 0;
        let meridiem = -1;
        // ----- Second
        if (match[this.SECOND_GROUP]) {
            second = parseInt(match[this.SECOND_GROUP], 10);
            if (isNaN(second)) {
                second = ZH_Hant_1.zhStringToNumber(match[this.SECOND_GROUP]);
            }
            if (second >= 60)
                return false;
        }
        // ----- Hours
        hour = parseInt(match[this.HOUR_GROUP], 10);
        if (isNaN(hour)) {
            hour = ZH_Hant_1.zhStringToNumber(match[this.HOUR_GROUP]);
        }
        // ----- Minutes
        if (match[this.MINUTE_GROUP]) {
            if (match[this.MINUTE_GROUP] === '半') {
                minute = 30;
            }
            else if (match[this.MINUTE_GROUP] === '正' || match[this.MINUTE_GROUP] === '整') {
                minute = 0;
            }
            else {
                minute = parseInt(match[this.MINUTE_GROUP], 10);
                if (isNaN(minute)) {
                    minute = ZH_Hant_1.zhStringToNumber(match[this.MINUTE_GROUP]);
                }
            }
        }
        else if (hour > 100) {
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
    getDay(match, current, refMoment, targetMoment) {
        // ----- Day
        if (match[this.DAY_GROUP_1]) {
            const day1 = match[this.DAY_GROUP_1];
            if (day1 === '明' || day1 === '聽') {
                // Check not "Tomorrow" on late night
                if (refMoment.hour() > 1) {
                    targetMoment.add(1, 'day');
                }
            }
            else if (day1 === '昨' || day1 === '尋' || day1 === '琴') {
                targetMoment.add(-1, 'day');
            }
            current.assign(constants_1.DAY, targetMoment.date());
            current.assign(constants_1.MONTH, targetMoment.month() + 1);
            current.assign(constants_1.YEAR, targetMoment.year());
        }
        else if (match[this.DAY_GROUP_3]) {
            const day3 = match[this.DAY_GROUP_3];
            if (day3 === '明' || day3 === '聽') {
                targetMoment.add(1, 'day');
            }
            else if (day3 === '昨' || day3 === '尋' || day3 === '琴') {
                targetMoment.add(-1, 'day');
            }
            current.assign(constants_1.DAY, targetMoment.date());
            current.assign(constants_1.MONTH, targetMoment.month() + 1);
            current.assign(constants_1.YEAR, targetMoment.year());
        }
        else {
            current.imply(constants_1.DAY, targetMoment.date());
            current.imply(constants_1.MONTH, targetMoment.month() + 1);
            current.imply(constants_1.YEAR, targetMoment.year());
        }
    }
    getMeridiem(match, meridiem, hour) {
        // ----- AM & PM
        if (match[this.AM_PM_HOUR_GROUP]) {
            if (hour > 12)
                return null;
            const ampm = match[this.AM_PM_HOUR_GROUP][0].toLowerCase();
            if (ampm === 'a') {
                meridiem = 0;
                if (hour === 12)
                    hour = 0;
            }
            else if (ampm === 'p') {
                meridiem = 1;
                if (hour !== 12)
                    hour += 12;
            }
        }
        else if (match[this.ZH_AM_PM_HOUR_GROUP_1]) {
            const ampm = match[this.ZH_AM_PM_HOUR_GROUP_1][0];
            if (ampm === '朝' || ampm === '早') {
                meridiem = 0;
                if (hour === 12)
                    hour = 0;
            }
            else if (ampm === '晚') {
                meridiem = 1;
                if (hour !== 12)
                    hour += 12;
            }
        }
        else if (match[this.ZH_AM_PM_HOUR_GROUP_2]) {
            const ampm = match[this.ZH_AM_PM_HOUR_GROUP_2][0];
            if (ampm === '上' || ampm === '朝' || ampm === '早' || ampm === '凌') {
                meridiem = 0;
                if (hour === 12)
                    hour = 0;
            }
            else if (ampm === '下' || ampm === '晏' || ampm === '晚') {
                meridiem = 1;
                if (hour !== 12)
                    hour += 12;
            }
        }
        else if (match[this.ZH_AM_PM_HOUR_GROUP_3]) {
            const ampm = match[this.ZH_AM_PM_HOUR_GROUP_3][0];
            if (ampm === '上' || ampm === '朝' || ampm === '早' || ampm === '凌') {
                meridiem = 0;
                if (hour === 12)
                    hour = 0;
            }
            else if (ampm === '下' || ampm === '晏' || ampm === '晚') {
                meridiem = 1;
                if (hour !== 12)
                    hour += 12;
            }
        }
        return [meridiem, hour];
    }
}
exports.default = ZHHantTimeExpressionParser;
