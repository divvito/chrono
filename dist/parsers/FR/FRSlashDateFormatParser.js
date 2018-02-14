"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
    Date format with slash "/" (also "-" and ".") between numbers
    - Martes 3/11/2015
    - 3/11/2015
    - 3/11
*/
const parser_1 = require("../parser");
const result_1 = require("../../result");
const constants_1 = require("../../constants");
const FR_1 = require("../../utils/FR");
const general_1 = require("../../utils/general");
const moment = require("moment");
class FRSlashDateFormatParser extends parser_1.default {
    constructor() {
        super(...arguments);
        this.PATTERN = new RegExp('(\\W|^)' +
            '(?:' +
            '((?:dimanche|dim|lundi|lun|mardi|mar|mercredi|mer|jeudi|jeu|vendredi|ven|samedi|sam|le))' +
            '\\s*\\,?\\s*' +
            ')?' +
            '([0-3]{0,1}[0-9]{1})[\\/\\.\\-]([0-3]{0,1}[0-9]{1})' +
            '(?:' +
            '[\\/\\.\\-]' +
            '([0-9]{4}\s*\,?\s*|[0-9]{2}\s*\,?\s*)' +
            ')?' +
            '(\\W|$)', 'i');
        this.OPENING_GROUP = 1;
        this.ENDING_GROUP = 6;
        this.WEEKDAY_GROUP = 2;
        this.MONTH_GROUP = 4;
        this.DAY_GROUP = 3;
        this.YEAR_GROUP = 5;
        this.TAG = 'FRSlashDateFormatParser';
        this.OTHER_PATTERNS = [
            /^\d\.\d$/,
            /^\d\.\d{1,2}\.\d{1,2}$/
        ];
    }
    pattern() {
        return this.PATTERN;
    }
    extract(text, ref, match, opt) {
        if (match[this.OPENING_GROUP] == '/' || match[this.ENDING_GROUP] == '/') {
            // Long skip, if there is some overlapping like:
            // XX[/YY/ZZ]
            // [XX/YY/]ZZ
            match.index += match[0].length;
            return null;
        }
        const index = match.index + match[1].length;
        const result = new result_1.ParsedResult({
            text: match[0].substr(match[this.OPENING_GROUP].length, match[0].length - match[this.ENDING_GROUP].length),
            index,
            ref
        });
        result.tags[this.TAG] = true;
        const matchedText = result.text.toLowerCase();
        if (matchedText.match(this.OTHER_PATTERNS[0]) || matchedText.match(this.OTHER_PATTERNS[1])) {
            return null;
        }
        // MM/dd -> OK
        // MM.dd -> NG
        if (!match[this.YEAR_GROUP] && match[0].indexOf('/') < 0) {
            return null;
        }
        let year = match[this.YEAR_GROUP] ? parseInt(match[this.YEAR_GROUP], 10) : moment(ref).year();
        let month = parseInt(match[this.MONTH_GROUP], 10);
        let day = parseInt(match[this.DAY_GROUP], 10);
        if (month < 1 || day < 1 || day > 31) {
            return null;
        }
        if (year < 100) {
            year = year + 2000;
        }
        if (month > 12) {
            if (month <= 31 && day <= 12 && general_1.checkMonthDaysValid(month, day, year)) {
                [month, day] = [day, month];
            }
            else {
                return null;
            }
        }
        result.start.assign(constants_1.DAY, day);
        result.start.assign(constants_1.MONTH, month);
        if (match[this.YEAR_GROUP]) {
            result.start.assign(constants_1.YEAR, year);
        }
        else {
            general_1.getAppropriateYear(result.start, ref);
        }
        if (match[this.WEEKDAY_GROUP]) {
            result.start.assign(constants_1.WEEKDAY, FR_1.WEEKDAY_OFFSET[match[this.WEEKDAY_GROUP].toLowerCase()]);
        }
        return result;
    }
}
exports.default = FRSlashDateFormatParser;
