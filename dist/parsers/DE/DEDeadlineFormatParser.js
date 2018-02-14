"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const moment = require("moment");
const parser_1 = require("../parser");
const result_1 = require("../../result");
const DE_1 = require("../../utils/DE");
const general_1 = require("../../utils/general");
class DEDeadlineFormatParser extends parser_1.default {
    constructor() {
        super(...arguments);
        this.PATTERN = new RegExp('(\\W|^)' +
            '(in|nach)\\s*' +
            '(' + DE_1.INTEGER_WORDS_PATTERN + '|[0-9]+|einigen|eine[rm]\\s*halben|eine[rm])\\s*' +
            '(sekunden?|min(?:ute)?n?|stunden?|tag(?:en)?|wochen?|monat(?:en)?|jahr(?:en)?)\\s*' +
            '(?=\\W|$)', 'i');
        this.STRICT_PATTERN = new RegExp('(\\W|^)' +
            '(in|nach)\\s*' +
            '(' + DE_1.INTEGER_WORDS_PATTERN + '|[0-9]+|eine(?:r|m)?)\\s*' +
            '(sekunden?|minuten?|stunden?|tag(?:en)?)\\s*' +
            '(?=\\W|$)', 'i');
        this.TAG = 'DEDeadlineFormatParser';
    }
    pattern() {
        return this.isStrictMode() ? this.STRICT_PATTERN : this.PATTERN;
    }
    extract(text, ref, match, opt) {
        const index = match.index + match[1].length;
        const matchedText = match[0].substr(match[1].length, match[0].length - match[1].length);
        const result = new result_1.ParsedResult({
            text: matchedText,
            index,
            ref
        });
        result.tags[this.TAG] = true;
        let num = DE_1.matchInteger(match[3].toLowerCase());
        const matchedUnit = DE_1.matchUnit(match[4].toLowerCase());
        if (num && matchedUnit && general_1.deadlineCalculations(num, matchedUnit, result, moment(ref))) {
            return result;
        }
        return null;
    }
}
exports.default = DEDeadlineFormatParser;
