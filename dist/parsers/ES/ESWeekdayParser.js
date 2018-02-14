"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parser_1 = require("../parser");
const result_1 = require("../../result");
const ES_1 = require("../../utils/ES");
const general_1 = require("../../utils/general");
class ESWeekdayParser extends parser_1.default {
    constructor() {
        super(...arguments);
        this.PATTERN = new RegExp('(\\W|^)' +
            '(?:(?:\\,|\\(|\\（)\\s*)?' +
            '(?:(este|pasado|pr[oó]ximo)\\s*)?' +
            '(' + Object.keys(ES_1.WEEKDAY_OFFSET).join('|') + ')' +
            '(?:\\s*(?:\\,|\\)|\\）))?' +
            '(?:\\s*(este|pasado|pr[óo]ximo)\\s*week)?' +
            '(?=\\W|$)', 'i');
        this.PREFIX_GROUP = 2;
        this.WEEKDAY_GROUP = 3;
        this.POSTFIX_GROUP = 4;
        this.TAG = 'ESWeekdayParser';
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
        const offset = ES_1.WEEKDAY_OFFSET[match[this.WEEKDAY_GROUP].toLowerCase()];
        if (offset === undefined)
            return null;
        const prefix = match[this.PREFIX_GROUP];
        const postfix = match[this.POSTFIX_GROUP];
        const norm = (prefix || postfix || '').toLowerCase();
        let modifier = general_1.Modifier.UNKNOWN;
        if (norm == 'este') {
            modifier = general_1.Modifier.THIS;
        }
        else if (norm === 'pasado') {
            modifier = general_1.Modifier.LAST;
        }
        else if (norm == 'próximo' || norm == 'proximo') {
            modifier = general_1.Modifier.NEXT;
        }
        result.tags[this.TAG] = true;
        general_1.updateParsedComponent(result, ref, offset, modifier);
        return result;
    }
}
exports.default = ESWeekdayParser;
