"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const moment = require("moment");
const parser_1 = require("../parser");
const result_1 = require("../../result");
const constants_1 = require("../../constants");
class FRCasualDateParser extends parser_1.default {
    constructor() {
        super(...arguments);
        this.PATTERN = /(\W|^)(maintenant|aujourd'hui|ajd|cette\s*nuit|la\s*veille|(demain|hier)(\s*(matin|soir|aprem|après-midi))?|ce\s*(matin|soir)|cet\s*(après-midi|aprem))(?=\W|$)/i;
        this.OTHER_PATTERNS = [
            /demain/,
            /hier/,
            /cette\s*nuit/,
            /la\s*veille/,
            /après-midi|aprem/,
            /soir/,
            /matin/,
            /maintenant/
        ];
        this.TAG = 'FRCasualDateParser';
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
        if (matchedText.match(this.OTHER_PATTERNS[0])) {
            if (refMoment.hour() > 1) {
                startMoment.add(1, 'day');
            }
        }
        else if (matchedText.match(this.OTHER_PATTERNS[1])) {
            startMoment.add(-1, 'day');
        }
        else if (matchedText.match(this.OTHER_PATTERNS[2])) {
            result.start.imply(constants_1.HOUR, 22);
            result.start.imply(constants_1.MERIDIEM, 1);
        }
        else if (matchedText.match(this.OTHER_PATTERNS[3])) {
            result.start.imply(constants_1.HOUR, 0);
            if (refMoment.hour() > 6) {
                startMoment.add(-1, 'day');
            }
        }
        else if (matchedText.match(this.OTHER_PATTERNS[4])) {
            result.start.imply(constants_1.HOUR, 14);
        }
        else if (matchedText.match(this.OTHER_PATTERNS[5])) {
            result.start.imply(constants_1.HOUR, 18);
        }
        else if (matchedText.match(this.OTHER_PATTERNS[6])) {
            result.start.imply(constants_1.HOUR, 8);
        }
        else if (matchedText.match(this.OTHER_PATTERNS[7])) {
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
exports.default = FRCasualDateParser;
