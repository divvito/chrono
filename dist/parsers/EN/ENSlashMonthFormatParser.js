"use strict";
/*
    Month/Year date format with slash "/" (also "-" and ".") between numbers
    - 11/05
    - 06/2005
*/
Object.defineProperty(exports, "__esModule", { value: true });
const parser_1 = require("../parser");
const result_1 = require("../../result");
const constants_1 = require("../../constants");
class ENSlashMonthFormatParser extends parser_1.default {
    constructor() {
        super(...arguments);
        this.PATTERN = new RegExp('(^|[^\\d/]\\s+|[^\\w\\s])' +
            '([0-9]|0[1-9]|1[012])/([0-9]{4})' +
            '([^\\d/]|$)', 'i');
        this.OPENING_GROUP = 1;
        this.ENDING_GROUP = 4;
        this.MONTH_GROUP = 2;
        this.YEAR_GROUP = 3;
        this.TAG = 'ENSlashMonthFormatParser';
    }
    pattern() {
        return this.PATTERN;
    }
    extract(text, ref, match, opt) {
        const index = match.index + match[this.OPENING_GROUP].length;
        const result = new result_1.ParsedResult({
            text: match[0].substr(match[this.OPENING_GROUP].length, match[0].length - (1 + match[this.ENDING_GROUP].length)).trim(),
            index,
            ref
        });
        result.tags[this.TAG] = true;
        result.start.imply(constants_1.DAY, 1);
        result.start.assign(constants_1.MONTH, parseInt(match[this.MONTH_GROUP], 10));
        result.start.assign(constants_1.YEAR, parseInt(match[this.YEAR_GROUP], 10));
        return result;
    }
}
exports.default = ENSlashMonthFormatParser;
