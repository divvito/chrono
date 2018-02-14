"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parser_1 = require("../parser");
const result_1 = require("../../result");
const constants_1 = require("../../constants");
const moment = require("moment");
class FRTimeExpressionParser extends parser_1.default {
    constructor() {
        super(...arguments);
        this.PATTERN = new RegExp("(^|\\s|T)" +
            "(?:(?:[àa])\\s*)?" +
            "(\\d{1,2}(?:h)?|midi|minuit)" +
            "(?:" +
            "(?:\\.|\\:|\\：|h)(\\d{1,2})(?:m)?" +
            "(?:" +
            "(?:\\:|\\：|m)(\\d{0,2})(?:s)?" +
            ")?" +
            ")?" +
            "(?:\\s*(A\\.M\\.|P\\.M\\.|AM?|PM?))?" +
            "(?=\\W|$)", 'i');
        this.END_PATTERN = new RegExp("^\\s*" +
            "(\\-|\\–|\\~|\\〜|[àa]|\\?)\\s*" +
            "(\\d{1,2}(?:h)?)" +
            "(?:" +
            "(?:\\.|\\:|\\：|h)(\\d{1,2})(?:m)?" +
            "(?:" +
            "(?:\\.|\\:|\\：|m)(\\d{1,2})(?:s)?" +
            ")?" +
            ")?" +
            "(?:\\s*(A\\.M\\.|P\\.M\\.|AM?|PM?))?" +
            "(?=\\W|$)", 'i');
        this.HOUR_GROUP = 2;
        this.MINUTE_GROUP = 3;
        this.SECOND_GROUP = 4;
        this.AM_PM_HOUR_GROUP = 5;
        this.TAG = 'FRTimeExpressionParser';
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
            text: match[0].substring(match[1].length),
            index: match.index + match[1].length,
            ref
        });
        result.tags[this.TAG] = true;
        result.start.imply(constants_1.DAY, refMoment.date());
        result.start.imply(constants_1.MONTH, refMoment.month() + 1);
        result.start.imply(constants_1.YEAR, refMoment.year());
        if (!this.extractFirstChunk(result, match)) {
            return null;
        }
        if (!this.extractSecondChunk(text, result) && result.text.match(this.OTHER_PATTERNS[2])) {
            return null;
        }
        return result;
    }
    extractFirstChunk(result, match) {
        const time = this.getTime(match);
        if (!time) {
            return false;
        }
        let [hour, minute, second, meridiem] = time;
        if (second > -1) {
            result.start.assign(constants_1.SECOND, second);
        }
        // ----- AM & PM
        if (match[this.AM_PM_HOUR_GROUP]) {
            if (hour > 12)
                return false;
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
    extractSecondChunk(text, result) {
        const match = this.END_PATTERN.exec(text.substring(result.index + result.text.length));
        if (!match) {
            return false;
        }
        // Pattern "YY.YY -XXXX" is more like timezone offset
        if (match[0].match(this.OTHER_PATTERNS[1])) {
            return true;
        }
        const time = this.getTime(match);
        if (!time) {
            return true;
        }
        let [hour, minute, second, meridiem] = time;
        if (!result.end) {
            result.end = new result_1.ParsedComponents(undefined, result.start.date());
        }
        if (second > -1) {
            result.end.assign(constants_1.SECOND, second);
        }
        // ----- AM & PM
        if (match[this.AM_PM_HOUR_GROUP]) {
            if (hour > 12)
                return false;
            const ampm = match[this.AM_PM_HOUR_GROUP][0].toLowerCase();
            if (ampm === 'a') {
                meridiem = 0;
                if (hour === 12) {
                    hour = 0;
                    if (!result.end.isCertain(constants_1.DAY)) {
                        result.end.imply(constants_1.DAY, result.end.get(constants_1.DAY) + 1);
                    }
                }
            }
            if (ampm === 'p') {
                meridiem = 1;
                if (hour !== 12)
                    hour += 12;
            }
            if (!result.start.isCertain(constants_1.MERIDIEM)) {
                if (meridiem === 0) {
                    result.start.imply(constants_1.MERIDIEM, 0);
                    if (result.start.get(constants_1.HOUR) === 12) {
                        result.start.assign(constants_1.HOUR, 0);
                    }
                }
                else {
                    result.start.imply(constants_1.MERIDIEM, 1);
                    if (result.start.get(constants_1.HOUR) !== 12) {
                        result.start.assign(constants_1.HOUR, result.start.get(constants_1.HOUR) + 12);
                    }
                }
            }
        }
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
        let hour = 0;
        let minute = 0;
        let meridiem = -1;
        // ----- Second
        if (match[this.SECOND_GROUP]) {
            second = parseInt(match[this.SECOND_GROUP], 10);
            if (second >= 60)
                return false;
        }
        // ----- Hours
        if (match[this.HOUR_GROUP].toLowerCase() === 'midi') {
            meridiem = 1;
            hour = 12;
        }
        else if (match[this.HOUR_GROUP].toLowerCase() === 'minuit') {
            meridiem = 0;
            hour = 0;
        }
        else {
            hour = parseInt(match[this.HOUR_GROUP], 10);
        }
        // ----- Minutes
        if (match[this.MINUTE_GROUP]) {
            minute = parseInt(match[this.MINUTE_GROUP], 10);
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
}
exports.default = FRTimeExpressionParser;
