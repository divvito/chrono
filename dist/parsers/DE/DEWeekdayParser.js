"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parser_1 = require("../parser");
const result_1 = require("../../result");
const DE_1 = require("../../utils/DE");
const moment = require("moment");
const constants_1 = require("../../constants");
class DEWeekdayParser extends parser_1.default {
    constructor() {
        super(...arguments);
        this.PATTERN = new RegExp('(\\W|^)' +
            '(?:(?:\\,|\\(|\\（)\\s*)?' +
            '(?:a[mn]\\s*?)?' +
            '(?:(diese[mn]|letzte[mn]|n(?:ä|ae)chste[mn])\\s*)?' +
            '(' + Object.keys(DE_1.WEEKDAY_OFFSET).join('|') + ')' +
            '(?:\\s*(?:\\,|\\)|\\）))?' +
            '(?:\\s*(diese|letzte|n(?:ä|ae)chste)\\s*woche)?' +
            '(?=\\W|$)', 'i');
        this.PREFIX_GROUP = 2;
        this.WEEKDAY_GROUP = 3;
        this.POSTFIX_GROUP = 4;
        this.OTHER_PATTERNS = [
            /letzte/,
            /n(?:ä|ae)chste/,
            /diese/
        ];
        this.TAG = 'DEWeekdayParser';
    }
    pattern() {
        return this.PATTERN;
    }
    extract(text, ref, match, opt) {
        const index = match.index + match[1].length;
        const matchedText = match[0].substr(match[1].length, match[0].length - match[1].length);
        const result = new result_1.ParsedResult({
            text: matchedText,
            index,
            ref,
        });
        const offset = DE_1.WEEKDAY_OFFSET[match[this.WEEKDAY_GROUP].toLowerCase()];
        if (offset === undefined)
            return null;
        const startMoment = moment(ref);
        const prefix = match[this.PREFIX_GROUP];
        const postfix = match[this.POSTFIX_GROUP];
        const refOffset = startMoment.day();
        const norm = (prefix || postfix || '').toLowerCase();
        if (this.OTHER_PATTERNS[0].test(norm)) {
            startMoment.day(offset - 7);
        }
        else if (this.OTHER_PATTERNS[1].test(norm)) {
            startMoment.day(offset + 7);
        }
        else if (this.OTHER_PATTERNS[2].test(norm)) {
            if (opt.forwardDate && refOffset > offset) {
                startMoment.day(offset + 7);
            }
            else {
                startMoment.day(offset);
            }
        }
        else {
            const calcOffset = offset - refOffset;
            const absOffset = Math.abs(calcOffset);
            if (opt.forwardDate && refOffset > offset) {
                startMoment.day(offset + 7);
            }
            else if (!opt.forwardDate && Math.abs(calcOffset - 7) < absOffset) {
                startMoment.day(offset - 7);
            }
            else if (!opt.forwardDate && Math.abs(calcOffset + 7) < absOffset) {
                startMoment.day(offset + 7);
            }
            else {
                startMoment.day(offset);
            }
        }
        result.tags[this.TAG] = true;
        result.start.assign(constants_1.WEEKDAY, offset);
        result.start.imply(constants_1.DAY, startMoment.date());
        result.start.imply(constants_1.MONTH, startMoment.month() + 1);
        result.start.imply(constants_1.YEAR, startMoment.year());
        return result;
    }
}
exports.default = DEWeekdayParser;
