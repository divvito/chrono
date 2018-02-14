"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parser_1 = require("../parser");
const result_1 = require("../../result");
const moment = require("moment");
const general_1 = require("../../utils/general");
const FR_1 = require("../../utils/FR");
class FRDeadlineFormatParser extends parser_1.default {
    constructor() {
        super(...arguments);
        this.PATTERN = new RegExp('(\\W|^)' +
            '(dans|en)\\s*' +
            '(' + FR_1.INTEGER_WORDS_PATTERN + '|[0-9]+|une?|(?:\\s*quelques)?|demi(?:\\s*|-?)?)\\s*' +
            '(secondes?|min(?:ute)?s?|heures?|jours?|semaines?|mois|années?)\\s*' +
            '(?=\\W|$)', 'i');
        this.STRICT_PATTERN = new RegExp('(\\W|^)' +
            '(dans|en)\\s*' +
            '(' + FR_1.INTEGER_WORDS_PATTERN + '|[0-9]+|un?)\\s*' +
            '(secondes?|minutes?|heures?|jours?)\\s*' +
            '(?=\\W|$)', 'i');
        this.NUM_MATCH = 3;
        this.UNIT_MATCH = 4;
        this.TAG = 'FRDeadlineFormatParser';
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
        const num = FR_1.matchNumber(match[this.NUM_MATCH].toLowerCase());
        const matchedUnit = FR_1.matchUnit(match[this.UNIT_MATCH].toLowerCase());
        if (num && matchedUnit && general_1.deadlineCalculations(num, matchedUnit, result, moment(ref))) {
            return result;
        }
        return null;
    }
}
exports.default = FRDeadlineFormatParser;
