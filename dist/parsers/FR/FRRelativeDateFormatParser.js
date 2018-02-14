"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const moment = require("moment");
const parser_1 = require("../parser");
const result_1 = require("../../result");
const FR_1 = require("../../utils/FR");
const constants_1 = require("../../constants");
// Force load fr localization data from moment for the locale files to be linkded durning browserify.
// NOTE: The function moment.defineLocale() also has a side effect that it change global locale
//  We also need to save and restore the previous locale (see. moment.js, loadLocale)
const originalLocale = moment.locale();
const ignored = require('moment/locale/fr');
moment.locale(originalLocale);
class FRRelativeDateFormatParser extends parser_1.default {
    constructor() {
        super(...arguments);
        this.PATTERN = new RegExp('(\\W|^)' +
            '(?:les?|la|l\'|du|des?)\\s*' +
            '(' + FR_1.INTEGER_WORDS_PATTERN + '|\\d+)?\\s*' +
            '(prochaine?s?|derni[eè]re?s?|pass[ée]e?s?|pr[ée]c[ée]dents?|suivante?s?)?\\s*' +
            '(secondes?|min(?:ute)?s?|heures?|jours?|semaines?|mois|trimestres?|années?)\\s*' +
            '(prochaine?s?|derni[eè]re?s?|pass[ée]e?s?|pr[ée]c[ée]dents?|suivante?s?)?' +
            '(?=\\W|$)', 'i');
        this.MULTIPLIER_GROUP = 2;
        this.MODIFIER_1_GROUP = 3;
        this.RELATIVE_WORD_GROUP = 4;
        this.MODIFIER_2_GROUP = 5;
        this.OTHER_PATTERNS = [
            /prochaine?s?|suivants?/,
            /derni[eè]re?s?|pass[ée]e?s?|pr[ée]c[ée]dents?/
        ];
        this.TAG = 'FRRelativeDateFormatParser';
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
        const matchedMultiplier = match[this.MULTIPLIER_GROUP];
        const num = FR_1.matchNumber(matchedMultiplier);
        const matchedModifier = (match[this.MODIFIER_1_GROUP] || match[this.MODIFIER_2_GROUP] || '').toLowerCase();
        if (!matchedModifier) {
            return null;
        }
        let modifierFactor;
        if (this.OTHER_PATTERNS[0].test(matchedModifier)) {
            modifierFactor = 1;
        }
        else if (this.OTHER_PATTERNS[1].test(matchedModifier)) {
            modifierFactor = -1;
        }
        else {
            return null;
        }
        const total = modifierFactor * (num || 1);
        let dateFrom = moment(ref).locale('fr');
        let dateTo = dateFrom.clone();
        const unit = FR_1.matchUnit((match[this.RELATIVE_WORD_GROUP] || '').toLowerCase());
        if (!unit) {
            return null;
        }
        let startOf;
        switch (unit) {
            case constants_1.SECOND:
                dateFrom.add(total, 's');
                dateTo.add(modifierFactor, 's');
                startOf = 'second';
                break;
            case constants_1.MINUTE:
                dateFrom.add(total, 'm');
                dateTo.add(modifierFactor, 'm');
                startOf = 'minute';
                break;
            case constants_1.HOUR:
                dateFrom.add(total, 'h');
                dateTo.add(modifierFactor, 'h');
                startOf = 'hour';
                break;
            case constants_1.DAY:
                dateFrom.add(total, 'd');
                dateTo.add(modifierFactor, 'd');
                startOf = 'day';
                break;
            case constants_1.WEEK:
                dateFrom.add(total, 'w');
                dateTo.add(modifierFactor, 'w');
                startOf = 'week';
                break;
            case constants_1.MONTH:
                dateFrom.add(total, 'M');
                dateTo.add(modifierFactor, 'M');
                startOf = 'month';
                break;
            case constants_1.YEAR:
                dateFrom.add(total, 'y');
                dateTo.add(modifierFactor, 'y');
                startOf = 'year';
                break;
            default:
                return null;
        }
        if (modifierFactor > 0) {
            [dateFrom, dateTo] = [dateTo, dateFrom];
        }
        // Get start and end of dates
        dateFrom.startOf(startOf);
        dateTo.endOf(startOf);
        result.start.assign(constants_1.YEAR, dateFrom.year());
        result.start.assign(constants_1.MONTH, dateFrom.month() + 1);
        result.start.assign(constants_1.DAY, dateFrom.date());
        result.start.assign(constants_1.MINUTE, dateFrom.minute());
        result.start.assign(constants_1.SECOND, dateFrom.second());
        result.start.assign(constants_1.HOUR, dateFrom.hour());
        result.start.assign(constants_1.MILLISECOND, dateFrom.millisecond());
        result.end = result.start.clone();
        result.end.assign(constants_1.YEAR, dateTo.year());
        result.end.assign(constants_1.MONTH, dateTo.month() + 1);
        result.end.assign(constants_1.DAY, dateTo.date());
        result.end.assign(constants_1.MINUTE, dateTo.minute());
        result.end.assign(constants_1.SECOND, dateTo.second());
        result.end.assign(constants_1.HOUR, dateTo.hour());
        result.end.assign(constants_1.MILLISECOND, dateTo.millisecond());
        return result;
    }
}
exports.default = FRRelativeDateFormatParser;
