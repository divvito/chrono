import Parser from '../parser';
import {ParsedResult} from '../../result';
import {ParseOptions} from "../../chrono";
import {DAY, HOUR, MINUTE, MONTH, SECOND, WEEKDAY, YEAR} from "../../constants";
import {
    extractDateTimeUnitFragments,
    FragmentMap,
    FragmentName,
    TIME_UNIT_PATTERN,
    TIME_UNIT_STRICT_PATTERN
} from "../../utils/EN";
import * as moment from "moment";
import {Moment} from "moment";

export default class ENTimeLaterFormatParser extends Parser {
    private PATTERN: RegExp = new RegExp('' +
        '(\\W|^)' +
        '(' + TIME_UNIT_PATTERN + ')' +
        '(?:later|after|from now|henceforth|forward|out)(?=(?:\\W|$))', 'i');

    private STRICT_PATTERN: RegExp = new RegExp('' +
        '(\\W|^)' +
        '(' + TIME_UNIT_STRICT_PATTERN + ')' +
        '(?:later|from now)(?=(?:\\W|$))', 'i');

    private TAG: string = 'ENTimeLaterFormatParser';

    private OTHER_PATTERNS: RegExp[] = [
        /\w/
    ];

    pattern(): RegExp {
        return this.isStrictMode() ? this.STRICT_PATTERN : this.PATTERN;
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

        const momentRef: Moment = moment(ref);
        const fragments: FragmentMap = extractDateTimeUnitFragments(match[2]);

        (Object.keys(fragments) as FragmentName[]).forEach((fragment: FragmentName) => {
            momentRef.add(fragments[fragment]!, fragment);
        });

        if ((fragments['hour'] || 0) > 0 || (fragments['minute'] || 0) > 0 || (fragments['second'] || 0) > 0) {
            result.start.assign(HOUR, momentRef.hour());
            result.start.assign(MINUTE, momentRef.minute());
            result.start.assign(SECOND, momentRef.second());
        }

        if ((fragments['d'] || 0) > 0 || (fragments['month'] || 0) > 0 || (fragments['year'] || 0) > 0) {
            result.start.assign(DAY, momentRef.date());
            result.start.assign(MONTH, momentRef.month() + 1);
            result.start.assign(YEAR, momentRef.year());
        } else {
            if ((fragments['week'] || 0) > 0) {
                result.start.imply(WEEKDAY, momentRef.day());
            }

            result.start.imply(DAY, momentRef.date());
            result.start.imply(MONTH, momentRef.month() + 1);
            result.start.imply(YEAR, momentRef.year());
        }

        return result;
    }
}
