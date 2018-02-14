"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parser_1 = require("../parser");
const result_1 = require("../../result");
const constants_1 = require("../../constants");
const DE_1 = require("../../utils/DE");
const general_1 = require("../../utils/general");
class DEMonthNameLittleEndianParser extends parser_1.default {
    constructor() {
        super(...arguments);
        this.PATTERN = new RegExp('(\\W|^)' +
            '(?:am\\s*?)?' +
            '(?:(Sonntag|Montag|Dienstag|Mittwoch|Donnerstag|Freitag|Samstag|So|Mo|Di|Mi|Do|Fr|Sa)\\s*,?\\s*)?' +
            '(?:den\\s*)?' +
            '([0-9]{1,2})\\.' +
            '(?:\\s*(?:bis(?:\\s*(?:am|zum))?|\\-|\\–|\\s)\\s*([0-9]{1,2})\\.)?\\s*' +
            '(Jan(?:uar|\\.)?|Feb(?:ruar|\\.)?|Mär(?:z|\\.)?|Maerz|Mrz\\.?|Apr(?:il|\\.)?|Mai|Jun(?:i|\\.)?|Jul(?:i|\\.)?|Aug(?:ust|\\.)?|Sep(?:t|t\\.|tember|\\.)?|Okt(?:ober|\\.)?|Nov(?:ember|\\.)?|Dez(?:ember|\\.)?)' +
            '(?:' +
            ',?\\s*([0-9]{1,4}(?![^\\s]\\d))' +
            '(\\s*[vn]\\.?\\s*C(?:hr)?\\.?)?' +
            ')?' +
            '(?=\\W|$)', 'i');
        this.WEEKDAY_GROUP = 2;
        this.DATE_GROUP = 3;
        this.DATE_TO_GROUP = 4;
        this.MONTH_NAME_GROUP = 5;
        this.YEAR_GROUP = 6;
        this.YEAR_BE_GROUP = 7;
        this.TAG = 'DEMonthNameLittleEndianParser';
    }
    pattern() {
        return this.PATTERN;
    }
    extract(text, ref, match, opt) {
        const result = new result_1.ParsedResult({
            text: match[0].substr(match[1].length, match[0].length - match[1].length),
            index: match.index + match[1].length,
            ref
        });
        const month = DE_1.MONTH_OFFSET[match[this.MONTH_NAME_GROUP].toLowerCase()];
        const day = parseInt(match[this.DATE_GROUP], 10);
        result.start.assign(constants_1.DAY, day);
        result.start.assign(constants_1.MONTH, month);
        let year = DE_1.yearCalculation(match[this.YEAR_GROUP], match[this.YEAR_BE_GROUP]);
        if (year !== null) {
            result.start.assign(constants_1.YEAR, year);
        }
        else {
            general_1.getAppropriateYear(result.start, ref);
        }
        // Weekday component
        if (match[this.WEEKDAY_GROUP]) {
            result.start.assign(constants_1.WEEKDAY, DE_1.WEEKDAY_OFFSET[match[this.WEEKDAY_GROUP].toLowerCase()]);
        }
        // Text can be 'range' value. Such as '12 - 13 January 2012'
        if (match[this.DATE_TO_GROUP]) {
            result.end = result.start.clone();
            result.end.assign(constants_1.DAY, parseInt(match[this.DATE_TO_GROUP], 10));
        }
        result.tags[this.TAG] = true;
        return result;
    }
}
exports.default = DEMonthNameLittleEndianParser;
