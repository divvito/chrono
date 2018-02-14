"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parser_1 = require("../parser");
const result_1 = require("../../result");
const constants_1 = require("../../constants");
class ENCasualTimeParser extends parser_1.default {
    constructor() {
        super(...arguments);
        this.PATTERN = /(\W|^)((this)?\s*(morning|afternoon|evening|noon))/i;
        this.TIME_MATCH = 4;
        this.TIME_MATCH_ALT = 3;
        this.TAG = 'ENCasualTimeParser';
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
        const matchedText = (match[this.TIME_MATCH] || match[this.TIME_MATCH_ALT]).toLowerCase();
        if (matchedText == "afternoon") {
            result.start.imply(constants_1.HOUR, opt.afternoon);
        }
        else if (matchedText == "evening") {
            result.start.imply(constants_1.HOUR, opt.evening);
        }
        else if (matchedText == "morning") {
            result.start.imply(constants_1.HOUR, opt.morning);
        }
        else if (matchedText == "noon") {
            result.start.imply(constants_1.HOUR, opt.noon);
        }
        return result;
    }
}
exports.default = ENCasualTimeParser;
