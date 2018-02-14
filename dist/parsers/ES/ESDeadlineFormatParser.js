"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parser_1 = require("../parser");
const result_1 = require("../../result");
const moment = require("moment");
const general_1 = require("../../utils/general");
const ES_1 = require("../../utils/ES");
class ESDeadlineFormatParser extends parser_1.default {
    constructor() {
        super(...arguments);
        this.PATTERN = /(\W|^)(dentro\s*de|en)\s*([0-9]+|medi[oa]|una?)\s*(minutos?|horas?|d[ií]as?)\s*(?=(?:\W|$))/i;
        this.NUM_MATCH = 3;
        this.UNIT_MATCH = 4;
        this.TAG = 'ESDeadlineFormatParser';
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
        const num = ES_1.matchNumber(match[this.NUM_MATCH].toLowerCase());
        const matchedUnit = ES_1.matchUnit(match[this.UNIT_MATCH].toLowerCase());
        if (num && matchedUnit && general_1.deadlineCalculations(num, matchedUnit, result, moment(ref))) {
            return result;
        }
        return null;
    }
}
exports.default = ESDeadlineFormatParser;
