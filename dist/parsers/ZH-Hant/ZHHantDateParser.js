"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const moment = require("moment");
const parser_1 = require("../parser");
const result_1 = require("../../result");
const constants_1 = require("../../constants");
const ZH_Hant_1 = require("../../utils/ZH-Hant");
class ZHHantDateParser extends parser_1.default {
    constructor() {
        super(...arguments);
        this.PATTERN = new RegExp('(\\d{2,4}|[' + Object.keys(ZH_Hant_1.NUMBER).join('') + ']{2,4})?' +
            '(?:\\s*)' +
            '(?:年)?' +
            '(?:[\\s|,|，]*)' +
            '(\\d{1,2}|[' + Object.keys(ZH_Hant_1.NUMBER).join('') + ']{1,2})' +
            '(?:\\s*)' +
            '(?:月)' +
            '(?:\\s*)' +
            '(\\d{1,2}|[' + Object.keys(ZH_Hant_1.NUMBER).join('') + ']{1,2})?' +
            '(?:\\s*)' +
            '(?:日|號)?');
        this.YEAR_GROUP = 1;
        this.MONTH_GROUP = 2;
        this.DAY_GROUP = 3;
        this.TAG = 'ZHDateParser';
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
        result.tags[this.TAG] = true;
        const startMoment = moment(ref);
        const matchedMonth = match[this.MONTH_GROUP];
        const matchedDay = match[this.DAY_GROUP];
        const matchedYear = match[this.YEAR_GROUP];
        let month = parseInt(matchedMonth, 10);
        if (isNaN(month)) {
            month = ZH_Hant_1.zhStringToNumber(matchedMonth);
        }
        result.start.assign(constants_1.MONTH, month);
        if (matchedDay) {
            let day = parseInt(matchedDay, 10);
            if (isNaN(day)) {
                day = ZH_Hant_1.zhStringToNumber(matchedDay);
            }
            result.start.assign(constants_1.DAY, day);
        }
        else {
            result.start.assign(constants_1.DAY, startMoment.date());
        }
        if (matchedYear) {
            let year = parseInt(matchedYear, 10);
            if (isNaN(year)) {
                year = ZH_Hant_1.zhStringToYear(matchedYear);
            }
            result.start.assign(constants_1.YEAR, year);
        }
        else {
            result.start.assign(constants_1.YEAR, startMoment.year());
        }
        return result;
    }
}
exports.default = ZHHantDateParser;
