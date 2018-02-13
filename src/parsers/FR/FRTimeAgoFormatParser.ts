import Parser from '../parser';
import {ParsedResult} from '../../result';
import {ParseOptions} from "../../chrono";
import {DAY, HOUR, MINUTE, MONTH, UnitOfTime, WEEK, WEEKDAY, YEAR} from "../../constants";
import {matchNumber, matchUnit} from "../../utils/FR";
import * as moment from "moment";
import {Moment} from "moment";

enum Mode {
    NONE,
    TIME,
    WEEK,
    DATE
}

export default class FRTimeAgoFormatParser extends Parser {
    private PATTERN: RegExp = /(\W|^)il y a\s*([0-9]+|une?)\s*(minutes?|heures?|semaines?|jours?|mois|années?|ans?)(?=(?:\W|$))/i;

    private TAG: string = 'FRTimeAgoFormatParser';

    private OTHER_PATTERNS: RegExp[] = [
        /\w/
    ];

    private NUM_MATCH: number = 2;
    private UNIT_MATCH: number = 3;

    pattern(): RegExp {
        return this.PATTERN;
    }

    extract(text: string, ref: Date, match: RegExpExecArray, opt: ParseOptions): ParsedResult | null {
        if (match.index > 0 && text[match.index - 1].match(this.OTHER_PATTERNS[0])) return null;

        const index: number = match.index + match[1].length;
        const result: ParsedResult = new ParsedResult({
            text: match[0].substr(match[1].length, match[0].length - match[1].length),
            index,
            ref
        });

        result.tags[this.TAG] = true;

        const num: number = matchNumber(match[this.NUM_MATCH]);
        const matchedUnit: UnitOfTime | undefined = matchUnit(match[this.UNIT_MATCH].toLowerCase());
        let mode: Mode = Mode.NONE;
        const momentRef: Moment = moment(ref);

        switch (matchedUnit) {
            case HOUR:
                momentRef.add(-num, 'hour');
                mode = Mode.TIME;
                break;
            case MINUTE:
                momentRef.add(-num, 'minute');
                mode = Mode.TIME;
                break;
            case WEEK:
                momentRef.add(-num, 'week');
                mode = Mode.WEEK;
                break;
            case DAY:
                momentRef.add(-num, 'd');
                mode = Mode.DATE;
                break;
            case MONTH:
                momentRef.add(-num, 'month');
                mode = Mode.DATE;
                break;
            case YEAR:
                momentRef.add(-num, 'year');
                mode = Mode.DATE;
                break;
            default:
                return null;
        }

        switch (mode) {
            case Mode.TIME:
                result.start.imply(DAY, momentRef.date());
                result.start.imply(MONTH, momentRef.month() + 1);
                result.start.imply(YEAR, momentRef.year());
                result.start.assign(HOUR, momentRef.hour());
                result.start.assign(MINUTE, momentRef.minute());
                break;
            case Mode.DATE:
                result.start.assign(DAY, momentRef.date());
                result.start.assign(MONTH, momentRef.month() + 1);
                result.start.assign(YEAR, momentRef.year());
                break;
            case Mode.WEEK:
                result.start.imply(DAY, momentRef.date());
                result.start.imply(MONTH, momentRef.month() + 1);
                result.start.imply(YEAR, momentRef.year());
                result.start.imply(WEEKDAY, momentRef.day());
                break;
            default:
                return null;
        }

        return result;
    }
}
