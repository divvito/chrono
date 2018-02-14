"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
    Date format with slash "/" (also "-" and ".") between numbers
    - Tuesday 11/3/2015
    - 11/3/2015
    - 11/3
*/
const parser_1 = require("../parser");
const result_1 = require("../../result");
const constants_1 = require("../../constants");
const DE_1 = require("../../utils/DE");
const moment = require("moment");
class DESlashDateFormatParser extends parser_1.default {
    constructor() {
        super(...arguments);
        this.PATTERN = new RegExp('(\\W|^)' +
            '(?:' +
            '(?:am\\s*?)?' +
            '((?:sonntag|so|montag|mo|dienstag|di|mittwoch|mi|donnerstag|do|freitag|fr|samstag|sa))' +
            '\\s*\\,?\\s*' +
            '(?:den\\s*)?' +
            ')?' +
            '([0-3]{0,1}[0-9]{1})[\\/\\.\\-]([0-3]{0,1}[0-9]{1})' +
            '(?:' +
            '[\\/\\.\\-]' +
            '([0-9]{4}\s*\,?\s*|[0-9]{2}\s*\,?\s*)' +
            ')?' +
            '(\\W|$)', 'i');
        this.OPENING_GROUP = 1;
        this.WEEKDAY_GROUP = 2;
        this.DAY_GROUP = 3;
        this.MONTH_GROUP = 4;
        this.YEAR_GROUP = 5;
        this.ENDING_GROUP = 6;
        this.TAG = 'DESlashDateFormatParser';
        this.OTHER_PATTERNS = [
            /^\d\.\d$/,
            /^\d\.\d{1,2}\.\d{1,2}$/
        ];
    }
    pattern() {
        return this.PATTERN;
    }
    extract(text, ref, match, opt) {
        if (match[this.OPENING_GROUP] === '/' || match[this.ENDING_GROUP] === '/') {
            // Long skip, if there is some overlapping like:
            // XX[/YY/ZZ]
            // [XX/YY/]ZZ
            match.index += match[0].length;
            return null;
        }
        const index = match.index + match[this.OPENING_GROUP].length;
        const matchedText = match[0].substr(match[this.OPENING_GROUP].length, match[0].length - match[this.ENDING_GROUP].length);
        const result = new result_1.ParsedResult({
            text: matchedText,
            index,
            ref,
        });
        if (matchedText.match(this.OTHER_PATTERNS[0]) || matchedText.match(this.OTHER_PATTERNS[1]))
            return null;
        // MM/dd -> OK
        // MM.dd -> NG
        if (!match[this.YEAR_GROUP] && match[0].indexOf('/') < 0)
            return null;
        let year = parseInt(match[this.YEAR_GROUP] || moment(ref).year() + '', 10);
        const month = parseInt(match[this.MONTH_GROUP], 10);
        const day = parseInt(match[this.DAY_GROUP], 10);
        if ((month < 1 || month > 12) || (day < 1 || day > 31))
            return null;
        if (year < 100) {
            if (year > 50) {
                year = year + 1900;
            }
            else {
                year = year + 2000;
            }
        }
        result.start.assign(constants_1.DAY, day);
        result.start.assign(constants_1.MONTH, month);
        result.start.assign(constants_1.YEAR, year);
        // Day of week
        if (match[this.WEEKDAY_GROUP]) {
            result.start.assign(constants_1.WEEKDAY, DE_1.WEEKDAY_OFFSET[match[this.WEEKDAY_GROUP].toLowerCase()]);
        }
        result.tags[this.TAG] = true;
        return result;
    }
}
exports.default = DESlashDateFormatParser;
