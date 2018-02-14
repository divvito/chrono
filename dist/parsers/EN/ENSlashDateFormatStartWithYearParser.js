"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
    Date format with slash "/" between numbers like ENSlashDateFormatParser,
    but this parser expect year before month and date.
    - YYYY/MM/DD
    - YYYY-MM-DD
    - YYYY.MM.DD
*/
const parser_1 = require("../parser");
const result_1 = require("../../result");
const general_1 = require("../../utils/general");
const constants_1 = require("../../constants");
class ENSlashDateFormatStartWithYearParser extends parser_1.default {
    constructor() {
        super(...arguments);
        this.PATTERN = new RegExp('(\\W|^)'
            + '([0-9]{4})[\\-\\.\\/]([0-9]{1,2})[\\-\\.\\/]([0-9]{1,2})'
            + '(?=\\W|$)', 'i');
        this.YEAR_NUMBER_GROUP = 2;
        this.MONTH_NUMBER_GROUP = 3;
        this.DATE_NUMBER_GROUP = 4;
        this.TAG = 'ENSlashDateFormatStartWithYearParser';
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
        const year = parseInt(match[this.YEAR_NUMBER_GROUP], 10);
        const month = parseInt(match[this.MONTH_NUMBER_GROUP], 10);
        const day = parseInt(match[this.DATE_NUMBER_GROUP], 10);
        if (month > 12 || month < 1 || day > 31 || day < 1 || !general_1.checkMonthDaysValid(day, month, year)) {
            return null;
        }
        result.start.assign(constants_1.YEAR, year);
        result.start.assign(constants_1.MONTH, month);
        result.start.assign(constants_1.DAY, day);
        return result;
    }
}
exports.default = ENSlashDateFormatStartWithYearParser;
