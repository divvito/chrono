"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const moment = require("moment");
const parser_1 = require("../parser");
const result_1 = require("../../result");
const constants_1 = require("../../constants");
class ENCasualDateParser extends parser_1.default {
    constructor() {
        super(...arguments);
        this.PATTERN = /(\W|^)(now|today|tonight|last\s*night|(?:tomorrow|tmr|yesterday)\s*|tomorrow|tmr|yesterday)(?=\W|$)/i;
        this.OTHER_PATTERNS = [
            /^tomorrow|^tmr/,
            /^yesterday/,
            /last\s*night/
        ];
        this.TAG = 'ENCasualDateParser';
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
        const refMoment = moment(ref);
        const startMoment = refMoment.clone();
        const matchedText = result.text.toLowerCase();
        if (matchedText === 'tonight') {
            // Normally means this coming midnight
            result.start.imply(constants_1.HOUR, 22);
            result.start.imply(constants_1.MERIDIEM, 1);
        }
        else if (this.OTHER_PATTERNS[0].test(matchedText)) {
            // Check not "Tomorrow" on late night
            if (refMoment.hour() > 1) {
                startMoment.add(1, 'day');
            }
        }
        else if (this.OTHER_PATTERNS[1].test(matchedText)) {
            startMoment.add(-1, 'day');
        }
        else if (matchedText.match(this.OTHER_PATTERNS[2])) {
            result.start.imply(constants_1.HOUR, 0);
            if (refMoment.hour() > 6) {
                startMoment.add(-1, 'day');
            }
        }
        else if (matchedText.match("now")) {
            result.start.assign(constants_1.HOUR, refMoment.hour());
            result.start.assign(constants_1.MINUTE, refMoment.minute());
            result.start.assign(constants_1.SECOND, refMoment.second());
            result.start.assign(constants_1.MILLISECOND, refMoment.millisecond());
        }
        result.start.assign(constants_1.DAY, startMoment.date());
        result.start.assign(constants_1.MONTH, startMoment.month() + 1);
        result.start.assign(constants_1.YEAR, startMoment.year());
        result.tags[this.TAG] = true;
        return result;
    }
}
exports.default = ENCasualDateParser;
