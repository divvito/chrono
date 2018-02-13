import * as moment from "moment";
import {Moment, unitOfTime} from "moment";
import Parser from '../parser';
import {ParsedResult} from '../../result';
import {ParseOptions} from "../../chrono";
import {matchNumber, matchUnit, INTEGER_WORDS_PATTERN} from "../../utils/FR";
import {DAY, HOUR, MILLISECOND, MINUTE, MONTH, SECOND, UnitOfTime, WEEK, YEAR} from "../../constants";

// Force load fr localization data from moment for the locale files to be linkded durning browserify.
// NOTE: The function moment.defineLocale() also has a side effect that it change global locale
//  We also need to save and restore the previous locale (see. moment.js, loadLocale)
const originalLocale = moment.locale();
const ignored = require('moment/locale/fr');
moment.locale(originalLocale);

export default class FRRelativeDateFormatParser extends Parser {
    private PATTERN: RegExp = new RegExp('(\\W|^)' +
        '(?:les?|la|l\'|du|des?)\\s*' +
        '('+ INTEGER_WORDS_PATTERN + '|\\d+)?\\s*' +
        '(prochaine?s?|derni[eè]re?s?|pass[ée]e?s?|pr[ée]c[ée]dents?|suivante?s?)?\\s*' +
        '(secondes?|min(?:ute)?s?|heures?|jours?|semaines?|mois|trimestres?|années?)\\s*' +
        '(prochaine?s?|derni[eè]re?s?|pass[ée]e?s?|pr[ée]c[ée]dents?|suivante?s?)?' +
        '(?=\\W|$)', 'i'
    );

    private MULTIPLIER_GROUP: number = 2;
    private MODIFIER_1_GROUP: number = 3;
    private RELATIVE_WORD_GROUP: number = 4;
    private MODIFIER_2_GROUP: number = 5;

    private OTHER_PATTERNS: RegExp[] = [
        /prochaine?s?|suivants?/,
        /derni[eè]re?s?|pass[ée]e?s?|pr[ée]c[ée]dents?/
    ];

    private TAG: string = 'FRRelativeDateFormatParser';

    pattern(): RegExp {
        return this.PATTERN;
    }

    extract(text: string, ref: Date, match: RegExpExecArray, opt: ParseOptions): ParsedResult | null {
        const index: number = match.index + match[1].length;
        const result: ParsedResult = new ParsedResult({
            text: match[0].substr(match[1].length, match[0].length - match[1].length),
            index,
            ref
        });

        result.tags[this.TAG] = true;


        const matchedMultiplier: string = match[this.MULTIPLIER_GROUP];
        const num: number = matchNumber(matchedMultiplier);

        const matchedModifier: string = (match[this.MODIFIER_1_GROUP] || match[this.MODIFIER_2_GROUP] || '').toLowerCase();
        if (!matchedModifier) {
            return null;
        }

        let modifierFactor: number;

        if (this.OTHER_PATTERNS[0].test(matchedModifier)) {
            modifierFactor = 1;
        } else if (this.OTHER_PATTERNS[1].test(matchedModifier)) {
            modifierFactor = -1;
        } else {
            return null;
        }

        const total: number = modifierFactor * (num || 1);
        let dateFrom: Moment = moment(ref).locale('fr');
        let dateTo: Moment = dateFrom.clone();
        const unit: UnitOfTime | undefined = matchUnit((match[this.RELATIVE_WORD_GROUP] || '').toLowerCase());

        if (!unit) {
            return null;
        }

        let startOf: unitOfTime.StartOf;

        switch (unit) {
            case SECOND:
                dateFrom.add(total, 's');
                dateTo.add(modifierFactor, 's');
                startOf = 'second';
                break;
            case MINUTE:
                dateFrom.add(total, 'm');
                dateTo.add(modifierFactor, 'm');
                startOf = 'minute';
                break;
            case HOUR:
                dateFrom.add(total, 'h');
                dateTo.add(modifierFactor, 'h');
                startOf = 'hour';
                break;
            case DAY:
                dateFrom.add(total, 'd');
                dateTo.add(modifierFactor, 'd');
                startOf = 'day';
                break;
            case WEEK:
                dateFrom.add(total, 'w');
                dateTo.add(modifierFactor, 'w');
                startOf = 'week';
                break;
            case MONTH:
                dateFrom.add(total, 'M');
                dateTo.add(modifierFactor, 'M');
                startOf = 'month';
                break;
            case YEAR:
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

        result.start.assign(YEAR, dateFrom.year());
        result.start.assign(MONTH, dateFrom.month() + 1);
        result.start.assign(DAY, dateFrom.date());
        result.start.assign(MINUTE, dateFrom.minute());
        result.start.assign(SECOND, dateFrom.second());
        result.start.assign(HOUR, dateFrom.hour());
        result.start.assign(MILLISECOND, dateFrom.millisecond());

        result.end = result.start.clone();
        result.end.assign(YEAR, dateTo.year());
        result.end.assign(MONTH, dateTo.month() + 1);
        result.end.assign(DAY, dateTo.date());
        result.end.assign(MINUTE, dateTo.minute());
        result.end.assign(SECOND, dateTo.second());
        result.end.assign(HOUR, dateTo.hour());
        result.end.assign(MILLISECOND, dateTo.millisecond());

        return result;
    }
}