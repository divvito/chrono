import * as moment from "moment";
import {Moment} from "moment";
import Parser from '../parser';
import {ParsedResult} from '../../result';
import {ParseOptions} from "../../chrono";
import {DAY, HOUR, MERIDIEM, MILLISECOND, MINUTE, MONTH, SECOND, YEAR} from "../../constants";

/*
  Valid patterns:
  - esta mañana -> today in the morning
  - esta tarde -> today in the afternoon/evening
  - esta noche -> tonight
  - ayer por la mañana -> yesterday in the morning
  - ayer por la tarde -> yesterday in the afternoon/evening
  - ayer por la noche -> yesterday at night
  - mañana por la mañana -> tomorrow in the morning
  - mañana por la tarde -> tomorrow in the afternoon/evening
  - mañana por la noche -> tomorrow at night
  - anoche -> tomorrow at night
  - hoy -> today
  - ayer -> yesterday
  - mañana -> tomorrow
 */

export default class ESCasualDateParser extends Parser {
    private PATTERN: RegExp = /(\W|^)(ahora|esta\s*(mañana|tarde|noche)|(ayer|mañana)\s*por\s*la\s*(mañana|tarde|noche)|hoy|mañana|ayer|anoche)(?=\W|$)/i;

    private OTHER_PATTERNS: RegExp[] = [
        /por\s*la/,
        /ahora/
    ];

    private TAG: string = 'ESCasualDateParser';

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

        if (matchedText === 'mañana') {
            // Check not "Tomorrow" on late night
            if (refMoment.hour() > 1) {
                startMoment.add(1, 'day');
            }
        } else if (matchedText === 'ayer') {
            startMoment.add(-1, 'day');
        } else if (matchedText === 'anoche') {
            result.start.imply(HOUR, 0);
            if (refMoment.hour() > 6) {
                startMoment.add(-1, 'day');
            }
        } else if (matchedText.match("esta")) {
            const secondMatch: string = match[3].toLowerCase();
            if (secondMatch === "tarde") {
                result.start.imply(HOUR, 18);
            } else if (secondMatch === "mañana") {
                result.start.imply(HOUR, 6);
            } else if (secondMatch === "noche") {
                // Normally means this coming midnight
                result.start.imply(HOUR, 22);
                result.start.imply(MERIDIEM, 1);
            }
        } else if (matchedText.match(this.OTHER_PATTERNS[0])) {
            const firstMatch: string = match[4].toLowerCase();
            if (firstMatch === 'ayer') {
                startMoment.add(-1, 'day');
            } else if (firstMatch === 'mañana') {
                startMoment.add(1, 'day');
            }
            const secondMatch: string = match[5].toLowerCase();
            if (secondMatch === "tarde") {
                result.start.imply(HOUR, 18);
            } else if (secondMatch === "mañana") {
                result.start.imply(HOUR, 9);
            } else if (secondMatch === "noche") {
                // Normally means this coming midnight
                result.start.imply(HOUR, 22);
                result.start.imply(MERIDIEM, 1);
            }
        } else if (matchedText.match(this.OTHER_PATTERNS[1])) {
            result.start.imply(HOUR, refMoment.hour());
            result.start.imply(MINUTE, refMoment.minute());
            result.start.imply(SECOND, refMoment.second());
            result.start.imply(MILLISECOND, refMoment.millisecond());
        }

        result.start.assign(DAY, startMoment.date());
        result.start.assign(MONTH, startMoment.month() + 1);
        result.start.assign(YEAR, startMoment.year());
        result.tags[this.TAG] = true;

        return result;
    }
}