"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parser_1 = require("../parser");
const result_1 = require("../../result");
const EN_1 = require("../../utils/EN");
const moment = require("moment");
const general_1 = require("../../utils/general");
class ENDeadlineFormatParser extends parser_1.default {
    constructor() {
        super(...arguments);
        this.PATTERN = new RegExp('(\\W|^)' +
            '(within|in)\\s*' +
            '(' + EN_1.INTEGER_WORDS_PATTERN + '|[0-9]+|an?(?:\\s*few)?|half(?:\\s*an?)?)\\s*' +
            '(seconds?|min(?:ute)?s?|hours?|days?|weeks?|months?|years?)\\s*' +
            '(?=\\W|$)', 'i');
        this.STRICT_PATTERN = new RegExp('(\\W|^)' +
            '(within|in)\\s*' +
            '(' + EN_1.INTEGER_WORDS_PATTERN + '|[0-9]+|an?)\\s*' +
            '(seconds?|minutes?|hours?|days?)\\s*' +
            '(?=\\W|$)', 'i');
        this.NUM_MATCH = 3;
        this.UNIT_MATCH = 4;
        this.TAG = 'ENDeadlineFormatParser';
    }
    pattern() {
        return this.isStrictMode() ? this.STRICT_PATTERN : this.PATTERN;
    }
    extract(text, ref, match, opt) {
        const index = match.index + match[1].length;
        const result = new result_1.ParsedResult({
            text: match[0].substr(match[1].length, match[0].length - match[1].length),
            index,
            ref
        });
        result.tags[this.TAG] = true;
        const num = EN_1.matchInteger(match[this.NUM_MATCH].toLowerCase());
        const matchedUnit = EN_1.matchUnit(match[this.UNIT_MATCH].toLowerCase());
        if (num && matchedUnit && general_1.deadlineCalculations(num, matchedUnit, result, moment(ref))) {
            return result;
        }
        return null;
    }
}
exports.default = ENDeadlineFormatParser;
