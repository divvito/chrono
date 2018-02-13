import * as moment from 'moment';
import Parser from '../parser';
import {ParsedResult} from "../../result";
import {ParseOptions} from "../../chrono";
import {UnitOfTime} from "../../constants";
import {INTEGER_WORDS_PATTERN, matchInteger, matchUnit} from '../../utils/DE';
import {deadlineCalculations} from "../../utils/general";

export default class DEDeadlineFormatParser extends Parser {
    private PATTERN: RegExp = new RegExp('(\\W|^)' +
        '(in|nach)\\s*' +
        '(' + INTEGER_WORDS_PATTERN + '|[0-9]+|einigen|eine[rm]\\s*halben|eine[rm])\\s*' +
        '(sekunden?|min(?:ute)?n?|stunden?|tag(?:en)?|wochen?|monat(?:en)?|jahr(?:en)?)\\s*' +
        '(?=\\W|$)', 'i'
    );

    private STRICT_PATTERN: RegExp = new RegExp('(\\W|^)' +
        '(in|nach)\\s*' +
        '(' + INTEGER_WORDS_PATTERN + '|[0-9]+|eine(?:r|m)?)\\s*' +
        '(sekunden?|minuten?|stunden?|tag(?:en)?)\\s*' +
        '(?=\\W|$)', 'i'
    );

    private TAG: string = 'DEDeadlineFormatParser';

    pattern() {
        return this.isStrictMode() ? this.STRICT_PATTERN : this.PATTERN;
    }

    extract(text: string, ref: Date, match: RegExpExecArray, opt: ParseOptions): ParsedResult | null {
        const index: number = match.index + match[1].length;
        const matchedText: string = match[0].substr(match[1].length, match[0].length - match[1].length);

        const result: ParsedResult = new ParsedResult({
            text: matchedText,
            index,
            ref
        });

        result.tags[this.TAG] = true;
        let num: number = matchInteger(match[3].toLowerCase());
        const matchedUnit: UnitOfTime | undefined = matchUnit(match[4].toLowerCase());

        if (num && matchedUnit && deadlineCalculations(num, matchedUnit, result, moment(ref))) {
            return result;
        }

        return null;
    }
}