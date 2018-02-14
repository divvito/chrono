"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const moment = require("moment");
const parser_1 = require("../parser");
const result_1 = require("../../result");
const constants_1 = require("../../constants");
class JPCasualDateParser extends parser_1.default {
    constructor() {
        super(...arguments);
        this.PATTERN = /今日|当日|昨日|明日|今夜|今夕|今晩|今朝/i;
        this.TAG = 'JPCasualDateParser';
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
        const matchedText = result.text;
        if (matchedText === '今夜' || matchedText === '今夕' || matchedText === '今晩') {
            // Normally means this coming midnight
            result.start.imply(constants_1.HOUR, 22);
            result.start.imply(constants_1.MERIDIEM, 1);
        }
        else if (matchedText === '明日') {
            // Check not "Tomorrow" on late night
            if (refMoment.hour() > 4) {
                startMoment.add(1, 'day');
            }
        }
        else if (matchedText === '昨日') {
            startMoment.add(-1, 'day');
        }
        else if (matchedText.match("今朝")) {
            result.start.imply(constants_1.HOUR, 6);
            result.start.imply(constants_1.MERIDIEM, 0);
        }
        result.start.assign(constants_1.DAY, startMoment.date());
        result.start.assign(constants_1.MONTH, startMoment.month() + 1);
        result.start.assign(constants_1.YEAR, startMoment.year());
        result.tags[this.TAG] = true;
        return result;
    }
}
exports.default = JPCasualDateParser;
