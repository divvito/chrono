"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parser_1 = require("../parser");
const result_1 = require("../../result");
const constants_1 = require("../../constants");
const EN_1 = require("../../utils/EN");
const moment = require("moment");
class ENTimeLaterFormatParser extends parser_1.default {
    constructor() {
        super(...arguments);
        this.PATTERN = new RegExp('' +
            '(\\W|^)' +
            '(' + EN_1.TIME_UNIT_PATTERN + ')' +
            '(?:later|after|from now|henceforth|forward|out)(?=(?:\\W|$))', 'i');
        this.STRICT_PATTERN = new RegExp('' +
            '(\\W|^)' +
            '(' + EN_1.TIME_UNIT_STRICT_PATTERN + ')' +
            '(?:later|from now)(?=(?:\\W|$))', 'i');
        this.TAG = 'ENTimeLaterFormatParser';
        this.OTHER_PATTERNS = [
            /\w/
        ];
    }
    pattern() {
        return this.isStrictMode() ? this.STRICT_PATTERN : this.PATTERN;
    }
    extract(text, ref, match, opt) {
        if (match.index > 0 && text[match.index - 1].match(this.OTHER_PATTERNS[0]))
            return null;
        const index = match.index + match[1].length;
        const result = new result_1.ParsedResult({
            text: match[0].substr(match[1].length, match[0].length - match[1].length),
            index,
            ref
        });
        result.tags[this.TAG] = true;
        const momentRef = moment(ref);
        const fragments = EN_1.extractDateTimeUnitFragments(match[2]);
        Object.keys(fragments).forEach((fragment) => {
            momentRef.add(fragments[fragment], fragment);
        });
        if ((fragments['hour'] || 0) > 0 || (fragments['minute'] || 0) > 0 || (fragments['second'] || 0) > 0) {
            result.start.assign(constants_1.HOUR, momentRef.hour());
            result.start.assign(constants_1.MINUTE, momentRef.minute());
            result.start.assign(constants_1.SECOND, momentRef.second());
        }
        if ((fragments['d'] || 0) > 0 || (fragments['month'] || 0) > 0 || (fragments['year'] || 0) > 0) {
            result.start.assign(constants_1.DAY, momentRef.date());
            result.start.assign(constants_1.MONTH, momentRef.month() + 1);
            result.start.assign(constants_1.YEAR, momentRef.year());
        }
        else {
            if ((fragments['week'] || 0) > 0) {
                result.start.imply(constants_1.WEEKDAY, momentRef.day());
            }
            result.start.imply(constants_1.DAY, momentRef.date());
            result.start.imply(constants_1.MONTH, momentRef.month() + 1);
            result.start.imply(constants_1.YEAR, momentRef.year());
        }
        return result;
    }
}
exports.default = ENTimeLaterFormatParser;
