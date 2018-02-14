"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*

    The parser for parsing US's date format that begin with month's name.

    EX.
        - January 13
        - January 13, 2012
        - January 13 - 15, 2012
        - Tuesday, January 13, 2012

    Watch out for:
        - January 12:00
        - January 12.44
        - January 1222344
*/
const parser_1 = require("../parser");
const result_1 = require("../../result");
const EN_1 = require("../../utils/EN");
const constants_1 = require("../../constants");
const general_1 = require("../../utils/general");
class ENMonthNameMiddleEndianParser extends parser_1.default {
    constructor() {
        super(...arguments);
        this.PATTERN = new RegExp('(\\W|^)' +
            '(?:' +
            '(?:on\\s*?)?' +
            '(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sun\\.?|Mon\\.?|Tue\\.?|Wed\\.?|Thu\\.?|Fri\\.?|Sat\\.?)' +
            '\\s*,?\\s*)?' +
            '(Jan\\.?|January|Feb\\.?|February|Mar\\.?|March|Apr\\.?|April|May\\.?|Jun\\.?|June|Jul\\.?|July|Aug\\.?|August|Sep\\.?|Sept\\.?|September|Oct\\.?|October|Nov\\.?|November|Dec\\.?|December)' +
            '(?:-|\/|\\s*,?\\s*)' +
            '(([0-9]{1,2})(?:st|nd|rd|th)?|' + EN_1.ORDINAL_WORDS_PATTERN + ')(?!\\s*(?:am|pm))\\s*' + '' +
            '(?:' +
            '(?:to|\\-)\\s*' +
            '(([0-9]{1,2})(?:st|nd|rd|th)?| ' + EN_1.ORDINAL_WORDS_PATTERN + ')\\s*' +
            ')?' +
            '(?:' +
            '(?:-|\/|\\s*,?\\s*)' +
            '(?:([0-9]{4})\\s*(BE|AD|BC)?|([0-9]{1,4})\\s*(AD|BC))\\s*' +
            ')?' +
            '(?=\\W|$)(?!\\:\\d)', 'i');
        this.WEEKDAY_GROUP = 2;
        this.MONTH_NAME_GROUP = 3;
        this.DATE_GROUP = 4;
        this.DATE_NUM_GROUP = 5;
        this.DATE_TO_GROUP = 6;
        this.DATE_TO_NUM_GROUP = 7;
        this.YEAR_GROUP = 8;
        this.YEAR_BE_GROUP = 9;
        this.YEAR_GROUP2 = 10;
        this.YEAR_BE_GROUP2 = 11;
        this.TAG = 'ENMonthNameMiddleEndianParser';
    }
    pattern() {
        return this.PATTERN;
    }
    extract(text, ref, match, opt) {
        const index = match.index + match[1].length;
        const result = new result_1.ParsedResult({
            text: match[0].substr(match[1].length, match[0].length - match[1].length),
            index,
            ref
        });
        result.tags[this.TAG] = true;
        const month = EN_1.MONTH_OFFSET[match[this.MONTH_NAME_GROUP].toLowerCase()];
        if (!(month || month === 0)) {
            return null;
        }
        const day = match[this.DATE_NUM_GROUP] ?
            parseInt(match[this.DATE_NUM_GROUP], 10) :
            EN_1.ORDINAL_WORDS[match[this.DATE_GROUP].trim().replace('-', ' ').toLowerCase()];
        if (!day) {
            return null;
        }
        result.start.assign(constants_1.DAY, day);
        result.start.assign(constants_1.MONTH, month);
        let year = EN_1.yearCalculation(match[this.YEAR_GROUP] || match[this.YEAR_GROUP2], match[this.YEAR_BE_GROUP] || match[this.YEAR_BE_GROUP2]);
        if (year) {
            result.start.assign(constants_1.YEAR, year);
        }
        else {
            general_1.getAppropriateYear(result.start, ref);
        }
        // Weekday component
        if (match[this.WEEKDAY_GROUP]) {
            const weekday = EN_1.WEEKDAY_OFFSET[match[this.WEEKDAY_GROUP].toLowerCase()];
            if (weekday || weekday === 0) {
                result.start.assign(constants_1.WEEKDAY, weekday);
            }
        }
        // Text can be 'range' value. Such as '12 - 13 January 2012'
        if (match[this.DATE_TO_GROUP]) {
            const endDate = match[this.DATE_TO_NUM_GROUP] ?
                parseInt(match[this.DATE_TO_NUM_GROUP], 10) :
                EN_1.ORDINAL_WORDS[match[this.DATE_TO_GROUP].trim().replace('-', ' ').toLowerCase()];
            if (endDate) {
                result.end = result.start.clone();
                result.end.assign(constants_1.DAY, endDate);
            }
        }
        return result;
    }
}
exports.default = ENMonthNameMiddleEndianParser;
