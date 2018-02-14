"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parser_1 = require("../parser");
const result_1 = require("../../result");
const constants_1 = require("../../constants");
const DE_1 = require("../../utils/DE");
const moment = require("moment");
var MODE;
(function (MODE) {
    MODE[MODE["TIME"] = 0] = "TIME";
    MODE[MODE["DATE"] = 1] = "DATE";
    MODE[MODE["WEEK"] = 2] = "WEEK";
    MODE[MODE["NONE"] = 3] = "NONE";
})(MODE || (MODE = {}));
class DETimeAgoFormatParser extends parser_1.default {
    constructor() {
        super(...arguments);
        this.PATTERN = new RegExp('' +
            '(\\W|^)vor\\s*' +
            '(' + DE_1.INTEGER_WORDS_PATTERN + '|[0-9]+|einigen|eine[rm]\\s*halben|eine[rm])\\s*' +
            '(sekunden?|min(?:ute)?n?|stunden?|wochen?|tag(?:en)?|monat(?:en)?|jahr(?:en)?)\\s*' +
            '(?=(?:\\W|$))', 'i');
        this.STRICT_PATTERN = new RegExp('' +
            '(\\W|^)vor\\s*' +
            '([0-9]+|eine(?:r|m))\\s*' +
            '(sekunden?|minuten?|stunden?|tag(?:en)?)' +
            '(?=(?:\\W|$))', 'i');
        this.TAG = 'DETimeAgoFormatParser';
    }
    pattern() {
        return this.isStrictMode() ? this.STRICT_PATTERN : this.PATTERN;
    }
    extract(text, ref, match, opt) {
        if (match.index > 0 && text[match.index - 1].match(/\w/))
            return null;
        const matchedText = match[0].substr(match[1].length, match[0].length - match[1].length);
        const index = match.index + match[1].length;
        const result = new result_1.ParsedResult({
            text: matchedText,
            index,
            ref
        });
        const matchedUnit = DE_1.matchUnit(match[3].toLowerCase());
        if (matchedUnit) {
            const num = DE_1.matchInteger(match[2].toLowerCase());
            const momentRef = moment(ref);
            let mode = MODE.NONE;
            switch (matchedUnit) {
                case constants_1.HOUR:
                    momentRef.add(-num, 'hour');
                    mode = MODE.TIME;
                    break;
                case constants_1.MINUTE:
                    momentRef.add(-num, 'minute');
                    mode = MODE.TIME;
                    break;
                case constants_1.SECOND:
                    momentRef.add(-num, 'second');
                    mode = MODE.TIME;
                    break;
                case constants_1.DAY:
                    momentRef.add(-num, 'd');
                    mode = MODE.DATE;
                    break;
                case constants_1.MONTH:
                    momentRef.add(-num, 'month');
                    mode = MODE.DATE;
                    break;
                case constants_1.YEAR:
                    momentRef.add(-num, 'year');
                    mode = MODE.DATE;
                    break;
                case constants_1.WEEK:
                    momentRef.add(-num, 'week');
                    mode = MODE.WEEK;
                    break;
            }
            if (mode !== MODE.NONE) {
                result.tags[this.TAG] = true;
                switch (mode) {
                    case MODE.WEEK:
                        result.start.imply(constants_1.DAY, momentRef.date());
                        result.start.imply(constants_1.MONTH, momentRef.month() + 1);
                        result.start.imply(constants_1.YEAR, momentRef.year());
                        result.start.imply(constants_1.WEEKDAY, momentRef.day());
                        break;
                    case MODE.DATE:
                        result.start.assign(constants_1.DAY, momentRef.date());
                        result.start.assign(constants_1.MONTH, momentRef.month() + 1);
                        result.start.assign(constants_1.YEAR, momentRef.year());
                        break;
                    case MODE.TIME:
                        result.start.imply(constants_1.DAY, momentRef.date());
                        result.start.imply(constants_1.MONTH, momentRef.month() + 1);
                        result.start.imply(constants_1.YEAR, momentRef.year());
                        result.start.assign(constants_1.HOUR, momentRef.hour());
                        result.start.assign(constants_1.MINUTE, momentRef.minute());
                        result.start.assign(constants_1.SECOND, momentRef.second());
                        break;
                }
                return result;
            }
        }
        return null;
    }
}
exports.default = DETimeAgoFormatParser;
