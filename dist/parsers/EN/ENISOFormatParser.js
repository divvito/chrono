"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
    ISO 8601
    http://www.w3.org/TR/NOTE-datetime
    - YYYY-MM-DD
    - YYYY-MM-DDThh:mmTZD
    - YYYY-MM-DDThh:mm:ssTZD
    - YYYY-MM-DDThh:mm:ss.sTZD
    - TZD = (Z or +hh:mm or -hh:mm)
*/
const parser_1 = require("../parser");
const result_1 = require("../../result");
const constants_1 = require("../../constants");
class ENISOFormatParser extends parser_1.default {
    constructor() {
        super(...arguments);
        this.PATTERN = new RegExp('(\\W|^)'
            + '([0-9]{4})\\-([0-9]{1,2})\\-([0-9]{1,2})'
            + '(?:T' //..
            + '([0-9]{1,2}):([0-9]{1,2})' // hh:mm
            + '(?::([0-9]{1,2})(?:\\.(\\d{1,4}))?)?' // :ss.s
            + '(?:Z|([+-]\\d{2}):?(\\d{2})?)?' // TZD (Z or ±hh:mm or ±hhmm or ±hh)
            + ')?' //..
            + '(?=\\W|$)', 'i');
        this.YEAR_NUMBER_GROUP = 2;
        this.MONTH_NUMBER_GROUP = 3;
        this.DATE_NUMBER_GROUP = 4;
        this.HOUR_NUMBER_GROUP = 5;
        this.MINUTE_NUMBER_GROUP = 6;
        this.SECOND_NUMBER_GROUP = 7;
        this.MILLISECOND_NUMBER_GROUP = 8;
        this.TZD_HOUR_OFFSET_GROUP = 9;
        this.TZD_MINUTE_OFFSET_GROUP = 10;
        this.TAG = 'ENISOFormatParser';
    }
    pattern() {
        return this.PATTERN;
    }
    extract(text, ref, match, opt) {
        const index = match.index + match[1].length;
        const result = new result_1.ParsedResult({
            text: match[0].substr(match[1].length),
            index,
            ref
        });
        result.tags[this.TAG] = true;
        result.start.assign(constants_1.YEAR, parseInt(match[this.YEAR_NUMBER_GROUP], 10));
        result.start.assign(constants_1.MONTH, parseInt(match[this.MONTH_NUMBER_GROUP], 10));
        result.start.assign(constants_1.DAY, parseInt(match[this.DATE_NUMBER_GROUP], 10));
        if (result.start.get(constants_1.MONTH) > 12 || result.start.get(constants_1.MONTH) < 1 ||
            result.start.get(constants_1.DAY) > 31 || result.start.get(constants_1.DAY) < 1) {
            return null;
        }
        if (match[this.HOUR_NUMBER_GROUP] != null) {
            result.start.assign(constants_1.HOUR, parseInt(match[this.HOUR_NUMBER_GROUP], 10));
            result.start.assign(constants_1.MINUTE, parseInt(match[this.MINUTE_NUMBER_GROUP], 10));
            if (match[this.SECOND_NUMBER_GROUP] != null) {
                result.start.assign(constants_1.SECOND, parseInt(match[this.SECOND_NUMBER_GROUP], 10));
            }
            if (match[this.MILLISECOND_NUMBER_GROUP] != null) {
                result.start.assign(constants_1.MILLISECOND, parseInt(match[this.MILLISECOND_NUMBER_GROUP], 10));
            }
            if (match[this.TZD_HOUR_OFFSET_GROUP] == null) {
                result.start.assign(constants_1.TIMEZONE_OFFSET, 0);
            }
            else {
                let minuteOffset = 0;
                const hourOffset = parseInt(match[this.TZD_HOUR_OFFSET_GROUP], 10);
                if (match[this.TZD_MINUTE_OFFSET_GROUP] != null)
                    minuteOffset = parseInt(match[this.TZD_MINUTE_OFFSET_GROUP], 10);
                let offset = hourOffset * 60;
                if (offset < 0) {
                    offset -= minuteOffset;
                }
                else {
                    offset += minuteOffset;
                }
                result.start.assign(constants_1.TIMEZONE_OFFSET, offset);
            }
        }
        return result;
    }
}
exports.default = ENISOFormatParser;
