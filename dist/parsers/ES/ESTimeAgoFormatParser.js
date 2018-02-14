"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parser_1 = require("../parser");
const result_1 = require("../../result");
const constants_1 = require("../../constants");
const ES_1 = require("../../utils/ES");
const moment = require("moment");
var Mode;
(function (Mode) {
    Mode[Mode["NONE"] = 0] = "NONE";
    Mode[Mode["TIME"] = 1] = "TIME";
    Mode[Mode["WEEK"] = 2] = "WEEK";
    Mode[Mode["DATE"] = 3] = "DATE";
})(Mode || (Mode = {}));
class ESTimeAgoFormatParser extends parser_1.default {
    constructor() {
        super(...arguments);
        this.PATTERN = /(\W|^)hace\s*([0-9]+|medi[oa]|una?)\s*(minutos?|horas?|semanas?|d[ií]as?|mes(es)?|años?)(?=(?:\W|$))/i;
        this.TAG = 'ESTimeAgoFormatParser';
        this.OTHER_PATTERNS = [
            /\w/
        ];
        this.NUM_MATCH = 2;
        this.UNIT_MATCH = 3;
    }
    pattern() {
        return this.PATTERN;
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
        const num = ES_1.matchNumber(match[this.NUM_MATCH]);
        const matchedUnit = ES_1.matchUnit(match[this.UNIT_MATCH].toLowerCase());
        let mode = Mode.NONE;
        const momentRef = moment(ref);
        switch (matchedUnit) {
            case constants_1.HOUR:
                momentRef.add(-num, 'hour');
                mode = Mode.TIME;
                break;
            case constants_1.MINUTE:
                momentRef.add(-num, 'minute');
                mode = Mode.TIME;
                break;
            case constants_1.WEEK:
                momentRef.add(-num, 'week');
                mode = Mode.WEEK;
                break;
            case constants_1.DAY:
                momentRef.add(-num, 'd');
                mode = Mode.DATE;
                break;
            case constants_1.MONTH:
                momentRef.add(-num, 'month');
                mode = Mode.DATE;
                break;
            case constants_1.YEAR:
                momentRef.add(-num, 'year');
                mode = Mode.DATE;
                break;
            default:
                return null;
        }
        switch (mode) {
            case Mode.TIME:
                result.start.imply(constants_1.DAY, momentRef.date());
                result.start.imply(constants_1.MONTH, momentRef.month() + 1);
                result.start.imply(constants_1.YEAR, momentRef.year());
                result.start.assign(constants_1.HOUR, momentRef.hour());
                result.start.assign(constants_1.MINUTE, momentRef.minute());
                break;
            case Mode.DATE:
                result.start.assign(constants_1.DAY, momentRef.date());
                result.start.assign(constants_1.MONTH, momentRef.month() + 1);
                result.start.assign(constants_1.YEAR, momentRef.year());
                break;
            case Mode.WEEK:
                result.start.imply(constants_1.DAY, momentRef.date());
                result.start.imply(constants_1.MONTH, momentRef.month() + 1);
                result.start.imply(constants_1.YEAR, momentRef.year());
                result.start.imply(constants_1.WEEKDAY, momentRef.day());
                break;
            default:
                return null;
        }
        return result;
    }
}
exports.default = ESTimeAgoFormatParser;
