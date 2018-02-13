import Parser from '../parser';
import {ParsedResult} from '../../result';
import {ParseOptions} from "../../chrono";
import {INTEGER_WORDS_PATTERN, matchInteger, matchUnit} from "../../utils/EN";
import * as moment from "moment";
import {Moment} from "moment";
import {DAY, HOUR, MINUTE, MONTH, SECOND, UnitOfTime, WEEK, YEAR} from "../../constants";

export default class ENRelativeDateFormatParser extends Parser {
    private PATTERN: RegExp = new RegExp('(\\W|^)' +
        '(this|next|last|past)\\s*' +
        '(' + INTEGER_WORDS_PATTERN + '|[0-9]+|few|half(?:\\s*an?)?)?\\s*' +
        '(seconds?|min(?:ute)?s?|hours?|days?|weeks?|months?|years?)(?=\\s*)' +
        '(?=\\W|$)', 'i'
    );

    private MODIFIER_WORD_GROUP: number = 2;
    private MULTIPLIER_WORD_GROUP: number = 3;
    private RELATIVE_WORD_GROUP: number = 4;

    private OTHER_PATTERNS: RegExp[] = [
        /^next/,
        /^this/
    ];

    private TAG: string = 'ENRelativeDateFormatParser';

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

        const matchedUnit: string = match[this.RELATIVE_WORD_GROUP].toLowerCase();
        const unit: UnitOfTime | undefined = matchUnit(matchedUnit);

        if (!unit) {
            return null;
        }

        const matchedMultiplier: string = match[this.MULTIPLIER_WORD_GROUP];
        const matchedModifier: string = match[this.MODIFIER_WORD_GROUP].toLowerCase();
        const momentRef: Moment = moment(ref);
        const num: number = matchInteger(matchedMultiplier);

        if (matchedModifier.match(this.OTHER_PATTERNS[1])) {
            if (matchedMultiplier) {
                return null;
            }

            switch (unit) {
                case WEEK:
                    momentRef.set('weekday', 0);
                    result.start.imply(DAY, momentRef.date());
                    result.start.imply(MONTH, momentRef.month() + 1);
                    result.start.imply(YEAR, momentRef.year());
                    break;
                case MONTH:
                    momentRef.set('date', 1);
                    result.start.imply(DAY, momentRef.date());
                    result.start.assign(MONTH, momentRef.month() + 1);
                    result.start.assign(YEAR, momentRef.year());
                    break;
                case YEAR:
                    momentRef.set('dayOfYear', 1);
                    result.start.imply(DAY, momentRef.date());
                    result.start.imply(MONTH, momentRef.month() + 1);
                    result.start.assign(YEAR, momentRef.year());
                    break;

            }
        } else {
            const modifier: number = matchedModifier.match(this.OTHER_PATTERNS[0]) ? 1 : -1;
            const offset: number = modifier * (num || 1);
            let timeMode: boolean = false;

            switch (unit) {
                case SECOND:
                    timeMode = true;
                    momentRef.add(offset, 'second');
                    result.start.imply(MINUTE, momentRef.minute());
                    result.start.imply(SECOND, momentRef.second());
                    break;
                case MINUTE:
                    timeMode = true;
                    momentRef.add(offset, 'minute');
                    result.start.assign(MINUTE, momentRef.minute());
                    result.start.imply(SECOND, momentRef.second());
                    break;
                case HOUR:
                    timeMode = true;
                    momentRef.add(offset, 'hour');
                    result.start.imply(MINUTE, momentRef.minute());
                    result.start.imply(SECOND, momentRef.second());
                    break;
                case DAY:
                    momentRef.add(offset, 'd');
                    result.start.assign(YEAR, momentRef.year());
                    result.start.assign(MONTH, momentRef.month() + 1);
                    result.start.assign(DAY, momentRef.date());
                    break;
                case WEEK:
                    momentRef.add(offset * 7, 'd');
                    result.start.imply(MONTH, momentRef.month() + 1);
                    result.start.imply(YEAR, momentRef.year());
                    result.start.imply(DAY, momentRef.date());
                    break;
                case MONTH:
                    momentRef.add(offset, 'month');
                    momentRef.set('date', 1);
                    result.start.assign(YEAR, momentRef.year());
                    result.start.assign(MONTH, momentRef.month() + 1);
                    result.start.imply(DAY, momentRef.date());
                    break;
                case YEAR:
                    momentRef.add(offset, 'year');
                    momentRef.set('dayOfYear', 1);
                    result.start.imply(DAY, momentRef.date());
                    result.start.imply(MONTH, momentRef.month() + 1);
                    result.start.assign(YEAR, momentRef.year());
                    break;
                default:
                    return null;
            }

            if (timeMode) {
                result.start.assign(HOUR, momentRef.hour());
                result.start.assign(YEAR, momentRef.year());
                result.start.assign(MONTH, momentRef.month() + 1);
                result.start.assign(DAY, momentRef.date());
            }
        }


        return result;
    }
}