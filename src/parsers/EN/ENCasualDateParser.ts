import * as moment from "moment";
import {Moment} from "moment";
import Parser from '../parser';
import {ParsedResult} from '../../result';
import {ParseOptions} from "../../chrono";
import {DAY, HOUR, MERIDIEM, MILLISECOND, MINUTE, MONTH, SECOND, YEAR} from "../../constants";

export default class ENCasualDateParser extends Parser {
    private PATTERN: RegExp = /(\W|^)(now|today|tonight|last\s*night|(?:tomorrow|tmr|yesterday)\s*|tomorrow|tmr|yesterday)(?=\W|$)/i;

    private OTHER_PATTERNS: RegExp[] = [
        /^tomorrow|^tmr/,
        /^yesterday/,
        /last\s*night/
    ];

    private TAG: string = 'ENCasualDateParser';

    pattern(): RegExp {
        return this.PATTERN;
    }

    extract(text: string, ref: Date, match: RegExpExecArray, opt: ParseOptions): ParsedResult | null {
        const index: number = match.index + match[1].length;
        const result: ParsedResult = new ParsedResult({
            text: match[0].substr(match[1].length),
            index,
            ref
        });

        const refMoment: Moment = moment(ref);
        const startMoment: Moment = refMoment.clone();
        const matchedText = result.text.toLowerCase();

        if(matchedText === 'tonight'){
            // Normally means this coming midnight
            result.start.imply(HOUR, 22);
            result.start.imply(MERIDIEM, 1);
        } else if (this.OTHER_PATTERNS[0].test(matchedText)) {
            // Check not "Tomorrow" on late night
            if(refMoment.hour() > 1) {
                startMoment.add(1, 'day');
            }
        } else if (this.OTHER_PATTERNS[1].test(matchedText)) {
            startMoment.add(-1, 'day');
        } else if(matchedText.match(this.OTHER_PATTERNS[2])) {
            result.start.imply(HOUR, 0);
            if (refMoment.hour() > 6) {
                startMoment.add(-1, 'day');
            }
        } else if (matchedText.match("now")) {
            result.start.assign(HOUR, refMoment.hour());
            result.start.assign(MINUTE, refMoment.minute());
            result.start.assign(SECOND, refMoment.second());
            result.start.assign(MILLISECOND, refMoment.millisecond());

        }

        result.start.assign(DAY, startMoment.date());
        result.start.assign(MONTH, startMoment.month() + 1);
        result.start.assign(YEAR, startMoment.year());
        result.tags[this.TAG] = true;
        return result;
    }

}