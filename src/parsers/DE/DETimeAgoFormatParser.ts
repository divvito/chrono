import Parser from '../parser';
import {ParsedResult} from "../../result";
import {ParseOptions} from "../../chrono";
import {DAY, HOUR, MINUTE, MONTH, SECOND, UnitOfTime, WEEK, WEEKDAY, YEAR} from "../../constants";
import {INTEGER_WORDS_PATTERN, matchInteger, matchUnit} from '../../utils/DE';
import * as moment from "moment";
import {Moment} from "moment";

enum MODE {
    TIME,
    DATE,
    WEEK,
    NONE,
}

export default class DETimeAgoFormatParser extends Parser {
    private PATTERN: RegExp = new RegExp('' +
        '(\\W|^)vor\\s*' +
        '(' + INTEGER_WORDS_PATTERN + '|[0-9]+|einigen|eine[rm]\\s*halben|eine[rm])\\s*' +
        '(sekunden?|min(?:ute)?n?|stunden?|wochen?|tag(?:en)?|monat(?:en)?|jahr(?:en)?)\\s*' +
        '(?=(?:\\W|$))', 'i');

    private STRICT_PATTERN: RegExp = new RegExp('' +
        '(\\W|^)vor\\s*' +
        '([0-9]+|eine(?:r|m))\\s*' +
        '(sekunden?|minuten?|stunden?|tag(?:en)?)' +
        '(?=(?:\\W|$))', 'i');

    private TAG: string = 'DETimeAgoFormatParser';


    pattern(): RegExp {
        return this.isStrictMode() ? this.STRICT_PATTERN : this.PATTERN;
    }

    extract(text: string, ref: Date, match: RegExpExecArray, opt: ParseOptions): ParsedResult | null {
        if (match.index > 0 && text[match.index - 1].match(/\w/)) return null;

        const matchedText: string = match[0].substr(match[1].length, match[0].length - match[1].length);
        const index: number = match.index + match[1].length;

        const result: ParsedResult = new ParsedResult({
            text: matchedText,
            index,
            ref
        });

        const matchedUnit: UnitOfTime | undefined = matchUnit(match[3].toLowerCase());

        if (matchedUnit) {
            const num: number = matchInteger(match[2].toLowerCase());
            const momentRef: Moment = moment(ref);
            let mode: MODE = MODE.NONE;
            switch (matchedUnit) {
                case HOUR:
                    momentRef.add(-num, 'hour');
                    mode = MODE.TIME;
                    break;
                case MINUTE:
                    momentRef.add(-num, 'minute');
                    mode = MODE.TIME;
                    break;
                case SECOND:
                    momentRef.add(-num, 'second');
                    mode = MODE.TIME;
                    break;
                case DAY:
                    momentRef.add(-num, 'd');
                    mode = MODE.DATE;
                    break;
                case MONTH:
                    momentRef.add(-num, 'month');
                    mode = MODE.DATE;
                    break;
                case YEAR:
                    momentRef.add(-num, 'year');
                    mode = MODE.DATE;
                    break;
                case WEEK:
                    momentRef.add(-num, 'week');
                    mode = MODE.WEEK;
                    break;
            }

            if (mode !== MODE.NONE) {
                result.tags[this.TAG] = true;
                switch (mode) {
                    case MODE.WEEK:
                        result.start.imply(DAY, momentRef.date());
                        result.start.imply(MONTH, momentRef.month() + 1);
                        result.start.imply(YEAR, momentRef.year());
                        result.start.imply(WEEKDAY, momentRef.day());
                        break;
                    case MODE.DATE:
                        result.start.assign(DAY, momentRef.date());
                        result.start.assign(MONTH, momentRef.month() + 1);
                        result.start.assign(YEAR, momentRef.year());
                        break;
                    case MODE.TIME:
                        result.start.imply(DAY, momentRef.date());
                        result.start.imply(MONTH, momentRef.month() + 1);
                        result.start.imply(YEAR, momentRef.year());
                        result.start.assign(HOUR, momentRef.hour());
                        result.start.assign(MINUTE, momentRef.minute());
                        result.start.assign(SECOND, momentRef.second());
                        break;
                }

                return result;
            }
        }

        return null;
    }

}