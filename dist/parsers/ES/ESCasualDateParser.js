"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const moment = require("moment");
const parser_1 = require("../parser");
const result_1 = require("../../result");
const constants_1 = require("../../constants");
/*
  Valid patterns:
  - esta mañana -> today in the morning
  - esta tarde -> today in the afternoon/evening
  - esta noche -> tonight
  - ayer por la mañana -> yesterday in the morning
  - ayer por la tarde -> yesterday in the afternoon/evening
  - ayer por la noche -> yesterday at night
  - mañana por la mañana -> tomorrow in the morning
  - mañana por la tarde -> tomorrow in the afternoon/evening
  - mañana por la noche -> tomorrow at night
  - anoche -> tomorrow at night
  - hoy -> today
  - ayer -> yesterday
  - mañana -> tomorrow
 */
class ESCasualDateParser extends parser_1.default {
    constructor() {
        super(...arguments);
        this.PATTERN = /(\W|^)(ahora|esta\s*(mañana|tarde|noche)|(ayer|mañana)\s*por\s*la\s*(mañana|tarde|noche)|hoy|mañana|ayer|anoche)(?=\W|$)/i;
        this.OTHER_PATTERNS = [
            /por\s*la/,
            /ahora/
        ];
        this.TAG = 'ESCasualDateParser';
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
        if (matchedText === 'mañana') {
            // Check not "Tomorrow" on late night
            if (refMoment.hour() > 1) {
                startMoment.add(1, 'day');
            }
        }
        else if (matchedText === 'ayer') {
            startMoment.add(-1, 'day');
        }
        else if (matchedText === 'anoche') {
            result.start.imply(constants_1.HOUR, 0);
            if (refMoment.hour() > 6) {
                startMoment.add(-1, 'day');
            }
        }
        else if (matchedText.match("esta")) {
            const secondMatch = match[3].toLowerCase();
            if (secondMatch === "tarde") {
                result.start.imply(constants_1.HOUR, 18);
            }
            else if (secondMatch === "mañana") {
                result.start.imply(constants_1.HOUR, 6);
            }
            else if (secondMatch === "noche") {
                // Normally means this coming midnight
                result.start.imply(constants_1.HOUR, 22);
                result.start.imply(constants_1.MERIDIEM, 1);
            }
        }
        else if (matchedText.match(this.OTHER_PATTERNS[0])) {
            const firstMatch = match[4].toLowerCase();
            if (firstMatch === 'ayer') {
                startMoment.add(-1, 'day');
            }
            else if (firstMatch === 'mañana') {
                startMoment.add(1, 'day');
            }
            const secondMatch = match[5].toLowerCase();
            if (secondMatch === "tarde") {
                result.start.imply(constants_1.HOUR, 18);
            }
            else if (secondMatch === "mañana") {
                result.start.imply(constants_1.HOUR, 9);
            }
            else if (secondMatch === "noche") {
                // Normally means this coming midnight
                result.start.imply(constants_1.HOUR, 22);
                result.start.imply(constants_1.MERIDIEM, 1);
            }
        }
        else if (matchedText.match(this.OTHER_PATTERNS[1])) {
            result.start.imply(constants_1.HOUR, refMoment.hour());
            result.start.imply(constants_1.MINUTE, refMoment.minute());
            result.start.imply(constants_1.SECOND, refMoment.second());
            result.start.imply(constants_1.MILLISECOND, refMoment.millisecond());
        }
        result.start.assign(constants_1.DAY, startMoment.date());
        result.start.assign(constants_1.MONTH, startMoment.month() + 1);
        result.start.assign(constants_1.YEAR, startMoment.year());
        result.tags[this.TAG] = true;
        return result;
    }
}
exports.default = ESCasualDateParser;
