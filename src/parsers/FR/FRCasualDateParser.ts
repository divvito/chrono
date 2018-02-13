import * as moment from "moment";
import {Moment} from "moment";
import Parser from '../parser';
import {ParsedResult} from '../../result';
import {ParseOptions} from "../../chrono";
import {DAY, HOUR, MERIDIEM, MILLISECOND, MINUTE, MONTH, SECOND, YEAR} from "../../constants";

export default class FRCasualDateParser extends Parser {
    private PATTERN: RegExp = /(\W|^)(maintenant|aujourd'hui|ajd|cette\s*nuit|la\s*veille|(demain|hier)(\s*(matin|soir|aprem|après-midi))?|ce\s*(matin|soir)|cet\s*(après-midi|aprem))(?=\W|$)/i;

    private OTHER_PATTERNS: RegExp[] = [
        /demain/,
        /hier/,
        /cette\s*nuit/,
        /la\s*veille/,
        /après-midi|aprem/,
        /soir/,
        /matin/,
        /maintenant/
    ];

    private TAG: string = 'FRCasualDateParser';

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

        if (matchedText.match(this.OTHER_PATTERNS[0])) {
            if (refMoment.hour() > 1) {
                startMoment.add(1, 'day');
            }
        } else if (matchedText.match(this.OTHER_PATTERNS[1])) {
            startMoment.add(-1, 'day');
        } else if (matchedText.match(this.OTHER_PATTERNS[2])) {
            result.start.imply(HOUR, 22);
            result.start.imply(MERIDIEM, 1);
        } else if (matchedText.match(this.OTHER_PATTERNS[3])) {
            result.start.imply(HOUR, 0);
            if (refMoment.hour() > 6) {
                startMoment.add(-1, 'day');
            }
        } else if (matchedText.match(this.OTHER_PATTERNS[4])) {
            result.start.imply(HOUR, 14);
        } else if (matchedText.match(this.OTHER_PATTERNS[5])) {
            result.start.imply(HOUR, 18);
        } else if (matchedText.match(this.OTHER_PATTERNS[6])) {
            result.start.imply(HOUR, 8);
        } else if (matchedText.match(this.OTHER_PATTERNS[7])) {
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