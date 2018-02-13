import * as moment from "moment";
import {Moment} from "moment";
import Parser from '../parser';
import {ParsedResult} from "../../result";
import {ParseOptions} from "../../chrono";
import {DAY, HOUR, MERIDIEM, MILLISECOND, MINUTE, MONTH, SECOND, YEAR} from "../../constants";

export default class DECasualDateParser extends Parser {
    private PATTERN: RegExp = new RegExp(
        '(\\W|^)(' +
        'jetzt|' +
        '(?:heute|diesen)\\s*(morgen|vormittag|mittag|nachmittag|abend)|' +
        '(?:heute|diese)\\s*nacht|' +
        'heute|' +
        '(?:(?:ü|ue)ber)?morgen(?:\\s*(morgen|vormittag|mittag|nachmittag|abend|nacht))?|' +
        '(?:vor)?gestern(?:\\s*(morgen|vormittag|mittag|nachmittag|abend|nacht))?|' +
        'letzte\\s*nacht' +
        ')(?=\\W|$)', 'i');

    private OTHER_PATTERNS: RegExp[] = [
        /(?:heute|diese)\s*nacht/,
        /^(?:ü|ue)bermorgen/,
        /^morgen/,
        /^gestern/,
        /^vorgestern/,
        /letzte\s*nacht/
    ];

    private TAG: string = 'DECasualDateParser';

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

        const matchedText: string = result.text.toLowerCase();
        let refMoment: Moment = moment(ref);
        let startMoment: Moment = refMoment.clone();

        if (this.OTHER_PATTERNS[0].test(matchedText)) {
            // Normally means this coming midnight
            result.start.imply(HOUR, 22);
            result.start.imply(MERIDIEM, 1);
        } else if (this.OTHER_PATTERNS[1].test(matchedText)) {
            startMoment.add(refMoment.hour() > 1 ? 2 : 1, 'day');
        } else if (this.OTHER_PATTERNS[2].test(matchedText)) {
            // Check not "Tomorrow" on late night
            if (refMoment.hour() > 1) {
                startMoment.add(1, 'day');
            }
        } else if (this.OTHER_PATTERNS[3].test(matchedText)) {
            startMoment.add(-1, 'day');
        } else if (this.OTHER_PATTERNS[4].test(matchedText)) {
            startMoment.add(-2, 'day');
        } else if (this.OTHER_PATTERNS[5].test(matchedText)) {
            result.start.imply(HOUR, 0);
            if (refMoment.hour() > 6) {
                startMoment.add(-1, 'day');
            }
        } else if (matchedText === 'jetzt') {
            result.start.imply(HOUR, refMoment.hour());
            result.start.imply(MINUTE, refMoment.minute());
            result.start.imply(SECOND, refMoment.second());
            result.start.imply(MILLISECOND, refMoment.millisecond());
        }

        const secondMatch: string = match[3] || match[4] || match[5];
        if (secondMatch) {
            switch (secondMatch.toLowerCase()) {
                case 'morgen':
                    result.start.imply(HOUR, 6);
                    break;
                case 'vormittag':
                    result.start.imply(HOUR, 9);
                    break;
                case 'mittag':
                    result.start.imply(HOUR, 12);
                    break;
                case 'nachmittag':
                    result.start.imply(HOUR, 15);
                    result.start.imply(MERIDIEM, 1);
                    break;
                case 'abend':
                    result.start.imply(HOUR, 18);
                    result.start.imply(MERIDIEM, 1);
                    break;
                case 'nacht':
                    result.start.imply(HOUR, 0);
                    break;
            }
        }

        result.start.assign(DAY, startMoment.date());
        result.start.assign(MONTH, startMoment.month() + 1);
        result.start.assign(YEAR, startMoment.year());
        result.tags[this.TAG] = true;

        return result;
    }
}