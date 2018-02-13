import Parser from '../parser';
import {ParsedResult} from "../../result";
import {ParseOptions} from "../../chrono";
import {WEEKDAY_OFFSET} from '../../utils/ES';
import {Modifier, updateParsedComponent} from '../../utils/general';

export default class ESWeekdayParser extends Parser {
    private PATTERN: RegExp = new RegExp('(\\W|^)' +
        '(?:(?:\\,|\\(|\\（)\\s*)?' +
        '(?:(este|pasado|pr[oó]ximo)\\s*)?' +
        '(' + Object.keys(WEEKDAY_OFFSET).join('|') + ')' +
        '(?:\\s*(?:\\,|\\)|\\）))?' +
        '(?:\\s*(este|pasado|pr[óo]ximo)\\s*week)?' +
        '(?=\\W|$)', 'i');

    private PREFIX_GROUP: number = 2;
    private WEEKDAY_GROUP: number = 3;
    private POSTFIX_GROUP: number = 4;

    private TAG: string = 'ESWeekdayParser';

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
        if (norm== 'este') {
            modifier = Modifier.THIS;
        } else if (norm === 'pasado') {
            modifier = Modifier.LAST;
        } else if (norm == 'próximo' || norm == 'proximo') {
            modifier = Modifier.NEXT;
        }

        result.tags[this.TAG] = true;

        updateParsedComponent(result, ref, offset, modifier);

        return result;
    }
}