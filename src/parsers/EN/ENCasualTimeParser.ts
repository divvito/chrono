import Parser from '../parser';
import {ParsedResult} from '../../result';
import {ParseOptions} from "../../chrono";
import {HOUR} from "../../constants";

export default class ENCasualTimeParser extends Parser {
    private PATTERN: RegExp = /(\W|^)((this)?\s*(morning|afternoon|evening|noon))/i;

    private TIME_MATCH: number = 4;
    private TIME_MATCH_ALT: number = 3;

    private TAG: string = 'ENCasualTimeParser';

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

        result.tags[this.TAG] = true;

        const matchedText: string = (match[this.TIME_MATCH] || match[this.TIME_MATCH_ALT]).toLowerCase();

        if (matchedText == "afternoon") {
            result.start.imply(HOUR, opt.afternoon);
        } else if (matchedText == "evening") {
            result.start.imply(HOUR, opt.evening);
        } else if (matchedText == "morning") {
            result.start.imply(HOUR, opt.morning);
        } else if (matchedText == "noon") {
            result.start.imply(HOUR, opt.noon);
        }

        return result;
    }
}