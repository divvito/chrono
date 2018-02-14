"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parser_1 = require("../parser");
const result_1 = require("../../result");
const EN_1 = require("../../utils/EN");
const moment = require("moment");
const constants_1 = require("../../constants");
class ENRelativeDateFormatParser extends parser_1.default {
    constructor() {
        super(...arguments);
        this.PATTERN = new RegExp('(\\W|^)' +
            '(this|next|last|past)\\s*' +
            '(' + EN_1.INTEGER_WORDS_PATTERN + '|[0-9]+|few|half(?:\\s*an?)?)?\\s*' +
            '(seconds?|min(?:ute)?s?|hours?|days?|weeks?|months?|years?)(?=\\s*)' +
            '(?=\\W|$)', 'i');
        this.MODIFIER_WORD_GROUP = 2;
        this.MULTIPLIER_WORD_GROUP = 3;
        this.RELATIVE_WORD_GROUP = 4;
        this.OTHER_PATTERNS = [
            /^next/,
            /^this/
        ];
        this.TAG = 'ENRelativeDateFormatParser';
    }
    pattern() {
        return this.PATTERN;
    }
    extract(text, ref, match, opt) {
        const index = match.index + match[1].length;
        const result = new result_1.ParsedResult({
            text: match[0].substr(match[1].length, match[0].length - match[1].length),
            index,
            ref
        });
        result.tags[this.TAG] = true;
        const matchedUnit = match[this.RELATIVE_WORD_GROUP].toLowerCase();
        const unit = EN_1.matchUnit(matchedUnit);
        if (!unit) {
            return null;
        }
        const matchedMultiplier = match[this.MULTIPLIER_WORD_GROUP];
        const matchedModifier = match[this.MODIFIER_WORD_GROUP].toLowerCase();
        const momentRef = moment(ref);
        const num = EN_1.matchInteger(matchedMultiplier);
        if (matchedModifier.match(this.OTHER_PATTERNS[1])) {
            if (matchedMultiplier) {
                return null;
            }
            switch (unit) {
                case constants_1.WEEK:
                    momentRef.set('weekday', 0);
                    result.start.imply(constants_1.DAY, momentRef.date());
                    result.start.imply(constants_1.MONTH, momentRef.month() + 1);
                    result.start.imply(constants_1.YEAR, momentRef.year());
                    break;
                case constants_1.MONTH:
                    momentRef.set('date', 1);
                    result.start.imply(constants_1.DAY, momentRef.date());
                    result.start.assign(constants_1.MONTH, momentRef.month() + 1);
                    result.start.assign(constants_1.YEAR, momentRef.year());
                    break;
                case constants_1.YEAR:
                    momentRef.set('dayOfYear', 1);
                    result.start.imply(constants_1.DAY, momentRef.date());
                    result.start.imply(constants_1.MONTH, momentRef.month() + 1);
                    result.start.assign(constants_1.YEAR, momentRef.year());
                    break;
            }
        }
        else {
            const modifier = matchedModifier.match(this.OTHER_PATTERNS[0]) ? 1 : -1;
            const offset = modifier * (num || 1);
            let timeMode = false;
            switch (unit) {
                case constants_1.SECOND:
                    timeMode = true;
                    momentRef.add(offset, 'second');
                    result.start.imply(constants_1.MINUTE, momentRef.minute());
                    result.start.imply(constants_1.SECOND, momentRef.second());
                    break;
                case constants_1.MINUTE:
                    timeMode = true;
                    momentRef.add(offset, 'minute');
                    result.start.assign(constants_1.MINUTE, momentRef.minute());
                    result.start.imply(constants_1.SECOND, momentRef.second());
                    break;
                case constants_1.HOUR:
                    timeMode = true;
                    momentRef.add(offset, 'hour');
                    result.start.imply(constants_1.MINUTE, momentRef.minute());
                    result.start.imply(constants_1.SECOND, momentRef.second());
                    break;
                case constants_1.DAY:
                    momentRef.add(offset, 'd');
                    result.start.assign(constants_1.YEAR, momentRef.year());
                    result.start.assign(constants_1.MONTH, momentRef.month() + 1);
                    result.start.assign(constants_1.DAY, momentRef.date());
                    break;
                case constants_1.WEEK:
                    momentRef.add(offset * 7, 'd');
                    result.start.imply(constants_1.MONTH, momentRef.month() + 1);
                    result.start.imply(constants_1.YEAR, momentRef.year());
                    result.start.imply(constants_1.DAY, momentRef.date());
                    break;
                case constants_1.MONTH:
                    momentRef.add(offset, 'month');
                    momentRef.set('date', 1);
                    result.start.assign(constants_1.YEAR, momentRef.year());
                    result.start.assign(constants_1.MONTH, momentRef.month() + 1);
                    result.start.imply(constants_1.DAY, momentRef.date());
                    break;
                case constants_1.YEAR:
                    momentRef.add(offset, 'year');
                    momentRef.set('dayOfYear', 1);
                    result.start.imply(constants_1.DAY, momentRef.date());
                    result.start.imply(constants_1.MONTH, momentRef.month() + 1);
                    result.start.assign(constants_1.YEAR, momentRef.year());
                    break;
                default:
                    return null;
            }
            if (timeMode) {
                result.start.assign(constants_1.HOUR, momentRef.hour());
                result.start.assign(constants_1.YEAR, momentRef.year());
                result.start.assign(constants_1.MONTH, momentRef.month() + 1);
                result.start.assign(constants_1.DAY, momentRef.date());
            }
        }
        return result;
    }
}
exports.default = ENRelativeDateFormatParser;
