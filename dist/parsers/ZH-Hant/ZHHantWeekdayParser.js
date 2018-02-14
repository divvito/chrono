"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parser_1 = require("../parser");
const result_1 = require("../../result");
const ZH_Hant_1 = require("../../utils/ZH-Hant");
const general_1 = require("../../utils/general");
class ZHHantWeekdayParser extends parser_1.default {
    constructor() {
        super(...arguments);
        this.PATTERN = new RegExp('(上|今|下|這|呢)?' +
            '(?:個)?' +
            '(?:星期|禮拜)' +
            '(' + Object.keys(ZH_Hant_1.WEEKDAY_OFFSET).join('|') + ')');
        this.PREFIX_GROUP = 1;
        this.WEEKDAY_GROUP = 2;
        this.TAG = 'ZHWeekdayParser';
    }
    pattern() {
        return this.PATTERN;
    }
    extract(text, ref, match, opt) {
        const index = match.index;
        const matchedText = match[0];
        const result = new result_1.ParsedResult({
            text: matchedText,
            index,
            ref,
        });
        const offset = ZH_Hant_1.WEEKDAY_OFFSET[(match[this.WEEKDAY_GROUP] || '').toLowerCase()];
        if (offset === undefined)
            return null;
        const norm = (match[this.PREFIX_GROUP] || '').toLowerCase();
        let modifier = general_1.Modifier.UNKNOWN;
        if (norm == '今' || norm == '這' || norm == '呢') {
            modifier = general_1.Modifier.THIS;
        }
        else if (norm === '上') {
            modifier = general_1.Modifier.LAST;
        }
        else if (norm == '下') {
            modifier = general_1.Modifier.NEXT;
        }
        result.tags[this.TAG] = true;
        general_1.updateParsedComponent(result, ref, offset, modifier);
        return result;
    }
}
exports.default = ZHHantWeekdayParser;
