import Parser from '../parser';
import {ParsedResult} from "../../result";
import {ParseOptions} from "../../chrono";
import {WEEKDAY_OFFSET} from '../../utils/ZH-Hant';
import {Modifier, updateParsedComponent} from '../../utils/general';

export default class ZHHantWeekdayParser extends Parser {
    private PATTERN: RegExp = new RegExp(
        '(上|今|下|這|呢)?' +
        '(?:個)?' +
        '(?:星期|禮拜)' +
        '(' + Object.keys(WEEKDAY_OFFSET).join('|') + ')'
    );

    private PREFIX_GROUP: number = 1;
    private WEEKDAY_GROUP: number = 2;

    private TAG: string = 'ZHWeekdayParser';

    pattern(): RegExp {
        return this.PATTERN;
    }

    extract(text: string, ref: Date, match: RegExpExecArray, opt: ParseOptions): ParsedResult | null {
        const index: number = match.index;
        const matchedText: string = match[0];
        const result: ParsedResult = new ParsedResult({
            text: matchedText,
            index,
            ref,
        });

        const offset: number | undefined = WEEKDAY_OFFSET[(match[this.WEEKDAY_GROUP] || '').toLowerCase()];
        if (offset === undefined) return null;

        const norm: string = (match[this.PREFIX_GROUP] || '').toLowerCase();

        let modifier: Modifier = Modifier.UNKNOWN;
        if (norm == '今' || norm == '這' || norm == '呢') {
            modifier = Modifier.THIS;
        } else if (norm === '上') {
            modifier = Modifier.LAST;
        } else if (norm == '下') {
            modifier = Modifier.NEXT;
        }

        result.tags[this.TAG] = true;

        updateParsedComponent(result, ref, offset, modifier);

        return result;
    }
}