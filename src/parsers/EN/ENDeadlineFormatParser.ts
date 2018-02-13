import Parser from '../parser';
import {ParsedResult} from '../../result';
import {ParseOptions} from "../../chrono";
import {INTEGER_WORDS_PATTERN, matchInteger, matchUnit} from "../../utils/EN";
import * as moment from "moment";
import {UnitOfTime} from "../../constants";
import {deadlineCalculations} from "../../utils/general";

export default class ENDeadlineFormatParser extends Parser {
    private PATTERN: RegExp = new RegExp('(\\W|^)' +
        '(within|in)\\s*' +
        '(' + INTEGER_WORDS_PATTERN + '|[0-9]+|an?(?:\\s*few)?|half(?:\\s*an?)?)\\s*' +
        '(seconds?|min(?:ute)?s?|hours?|days?|weeks?|months?|years?)\\s*' +
        '(?=\\W|$)', 'i'
    );
    private STRICT_PATTERN: RegExp = new RegExp('(\\W|^)' +
        '(within|in)\\s*' +
        '(' + INTEGER_WORDS_PATTERN + '|[0-9]+|an?)\\s*' +
        '(seconds?|minutes?|hours?|days?)\\s*' +
        '(?=\\W|$)', 'i'
    );

    private NUM_MATCH: number = 3;
    private UNIT_MATCH: number = 4;

    private TAG: string = 'ENDeadlineFormatParser';

    pattern(): RegExp {
        return this.isStrictMode() ? this.STRICT_PATTERN : this.PATTERN;
    }

    extract(text: string, ref: Date, match: RegExpExecArray, opt: ParseOptions): ParsedResult | null {
        const index: number = match.index + match[1].length;
        const result: ParsedResult = new ParsedResult({
            text: match[0].substr(match[1].length, match[0].length - match[1].length),
            index,
            ref
        });

        result.tags[this.TAG] = true;

        const num: number = matchInteger(match[this.NUM_MATCH].toLowerCase());
        const matchedUnit: UnitOfTime | undefined = matchUnit(match[this.UNIT_MATCH].toLowerCase());

        if (num && matchedUnit && deadlineCalculations(num, matchedUnit, result, moment(ref))) {
            return result;
        }

        return null;
    }
}