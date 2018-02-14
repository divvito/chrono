"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
    
    The parser for parsing month name and year.
    
    EX.
        - January
        - January 2012
        - January, 2012
*/
const parser_1 = require("../parser");
const result_1 = require("../../result");
const EN_1 = require("../../utils/EN");
const constants_1 = require("../../constants");
const general_1 = require("../../utils/general");
class ENMonthNameParser extends parser_1.default {
    constructor() {
        super(...arguments);
        this.PATTERN = new RegExp('(^|\\D\\s+|[^\\w\\s])' +
            '(Jan\\.?|January|Feb\\.?|February|Mar\\.?|March|Apr\\.?|April|May\\.?|Jun\\.?|June|Jul\\.?|July|Aug\\.?|August|Sep\\.?|Sept\\.?|September|Oct\\.?|October|Nov\\.?|November|Dec\\.?|December)' +
            '\\s*' +
            '(?:' +
            '[,-]?\\s*([0-9]{4})(\\s*BE|AD|BC)?' +
            ')?' +
            '(?=[^\\s\\w]|\\s+[^0-9]|\\s+$|$)', 'i');
        this.MONTH_NAME_GROUP = 2;
        this.YEAR_GROUP = 3;
        this.YEAR_BE_GROUP = 4;
        this.TAG = 'ENMonthNameParser';
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
        result.start.assign(constants_1.DAY, 1);
        result.start.assign(constants_1.MONTH, month);
        let year = EN_1.yearCalculation(match[this.YEAR_GROUP], match[this.YEAR_BE_GROUP]);
        if (year) {
            result.start.assign(constants_1.YEAR, year);
        }
        else {
            general_1.getAppropriateYear(result.start, ref);
        }
        return result;
    }
}
exports.default = ENMonthNameParser;
