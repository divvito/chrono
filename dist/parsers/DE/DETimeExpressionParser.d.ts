import Parser from '../parser';
import { ParsedResult } from "../../result";
import { ParseOptions } from "../../chrono";
export default class DETimeExpressionParser extends Parser {
    private PATTERN;
    private END_PATTERN;
    private HOUR_GROUP;
    private MINUTE_GROUP;
    private SECOND_GROUP;
    private AM_PM_HOUR_GROUP;
    private TAG;
    private OTHER_PATTERNS;
    pattern(): RegExp;
    extract(text: string, ref: Date, match: RegExpExecArray, opt: ParseOptions): ParsedResult | null;
    private extractFirstChunk(result, match);
    private extractSecondChunk(text, result);
    private getTime(match);
}
