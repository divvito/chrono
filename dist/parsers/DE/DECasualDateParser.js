"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const moment = require("moment");
const parser_1 = require("../parser");
const result_1 = require("../../result");
const constants_1 = require("../../constants");
class DECasualDateParser extends parser_1.default {
    constructor() {
        super(...arguments);
        this.PATTERN = new RegExp('(\\W|^)(' +
            'jetzt|' +
            '(?:heute|diesen)\\s*(morgen|vormittag|mittag|nachmittag|abend)|' +
            '(?:heute|diese)\\s*nacht|' +
            'heute|' +
            '(?:(?:ü|ue)ber)?morgen(?:\\s*(morgen|vormittag|mittag|nachmittag|abend|nacht))?|' +
            '(?:vor)?gestern(?:\\s*(morgen|vormittag|mittag|nachmittag|abend|nacht))?|' +
            'letzte\\s*nacht' +
            ')(?=\\W|$)', 'i');
        this.OTHER_PATTERNS = [
            /(?:heute|diese)\s*nacht/,
            /^(?:ü|ue)bermorgen/,
            /^morgen/,
            /^gestern/,
            /^vorgestern/,
            /letzte\s*nacht/
        ];
        this.TAG = 'DECasualDateParser';
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
        const matchedText = result.text.toLowerCase();
        let refMoment = moment(ref);
        let startMoment = refMoment.clone();
        if (this.OTHER_PATTERNS[0].test(matchedText)) {
            // Normally means this coming midnight
            result.start.imply(constants_1.HOUR, 22);
            result.start.imply(constants_1.MERIDIEM, 1);
        }
        else if (this.OTHER_PATTERNS[1].test(matchedText)) {
            startMoment.add(refMoment.hour() > 1 ? 2 : 1, 'day');
        }
        else if (this.OTHER_PATTERNS[2].test(matchedText)) {
            // Check not "Tomorrow" on late night
            if (refMoment.hour() > 1) {
                startMoment.add(1, 'day');
            }
        }
        else if (this.OTHER_PATTERNS[3].test(matchedText)) {
            startMoment.add(-1, 'day');
        }
        else if (this.OTHER_PATTERNS[4].test(matchedText)) {
            startMoment.add(-2, 'day');
        }
        else if (this.OTHER_PATTERNS[5].test(matchedText)) {
            result.start.imply(constants_1.HOUR, 0);
            if (refMoment.hour() > 6) {
                startMoment.add(-1, 'day');
            }
        }
        else if (matchedText === 'jetzt') {
            result.start.imply(constants_1.HOUR, refMoment.hour());
            result.start.imply(constants_1.MINUTE, refMoment.minute());
            result.start.imply(constants_1.SECOND, refMoment.second());
            result.start.imply(constants_1.MILLISECOND, refMoment.millisecond());
        }
        const secondMatch = match[3] || match[4] || match[5];
        if (secondMatch) {
            switch (secondMatch.toLowerCase()) {
                case 'morgen':
                    result.start.imply(constants_1.HOUR, 6);
                    break;
                case 'vormittag':
                    result.start.imply(constants_1.HOUR, 9);
                    break;
                case 'mittag':
                    result.start.imply(constants_1.HOUR, 12);
                    break;
                case 'nachmittag':
                    result.start.imply(constants_1.HOUR, 15);
                    result.start.imply(constants_1.MERIDIEM, 1);
                    break;
                case 'abend':
                    result.start.imply(constants_1.HOUR, 18);
                    result.start.imply(constants_1.MERIDIEM, 1);
                    break;
                case 'nacht':
                    result.start.imply(constants_1.HOUR, 0);
                    break;
            }
        }
        result.start.assign(constants_1.DAY, startMoment.date());
        result.start.assign(constants_1.MONTH, startMoment.month() + 1);
        result.start.assign(constants_1.YEAR, startMoment.year());
        result.tags[this.TAG] = true;
        return result;
    }
}
exports.default = DECasualDateParser;
