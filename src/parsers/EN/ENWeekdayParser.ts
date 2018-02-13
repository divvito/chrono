import Parser from '../parser';
import {ParsedResult} from "../../result";
import {ParseOptions} from "../../chrono";
import {WEEKDAY_OFFSET} from '../../utils/EN';
import {Modifier, updateParsedComponent} from '../../utils/general';

export default class ENWeekdayParser extends Parser {
    private PATTERN: RegExp = new RegExp('(\\W|^)' +
        '(?:(?:\\,|\\(|\\（)\\s*)?' +
        '(?:on\\s*?)?' +
        '(?:(this|last|past|next)\\s*)?' +
        '(' + Object.keys(WEEKDAY_OFFSET).join('|') + ')' +
        '(?:\\s*(?:\\,|\\)|\\）))?' +
        '(?:\\s*(this|last|past|next)\\s*week)?' +
        '(?=\\W|$)', 'i');

    private PREFIX_GROUP: number = 2;
    private WEEKDAY_GROUP: number = 3;
    private POSTFIX_GROUP: number = 4;

    private TAG: string = 'ENWeekdayParser';

    pattern(): RegExp {
        return this.PATTERN;
    }

    extract(text: string, ref: Date, match: RegExpExecArray, opt: ParseOptions): ParsedResult | null {
        const index: number = match.index + match[1].length;
        const matchedText: string = match[0].substr(match[1].length, match[0].length - match[1].length);
        const result: ParsedResult = new ParsedResult({
            text: matchedText,
            index,
            ref,
        });

        const offset: number | undefined = WEEKDAY_OFFSET[match[this.WEEKDAY_GROUP].toLowerCase()];
        if (offset === undefined) return null;

        const prefix: string = match[this.PREFIX_GROUP];
        const postfix: string = match[this.POSTFIX_GROUP];
        const norm: string = (prefix || postfix || '').toLowerCase();

        let modifier: Modifier = Modifier.UNKNOWN;
        if (norm === 'this') {
            modifier = Modifier.THIS;
        } else if (norm === 'last' || norm === 'past') {
            modifier = Modifier.LAST;
        } else if (norm === 'next') {
            modifier = Modifier.NEXT;
        }

        result.tags[this.TAG] = true;

        updateParsedComponent(result, ref, offset, modifier);

        return result;
    }
}