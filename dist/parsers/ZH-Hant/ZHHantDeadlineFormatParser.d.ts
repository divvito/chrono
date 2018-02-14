import Parser from '../parser';
import { ParsedResult } from '../../result';
import { ParseOptions } from "../../chrono";
export default class ZHHantDeadlineFormatParser extends Parser {
    private PATTERN;
    private NUMBER_GROUP;
    private UNIT_GROUP;
    private TAG;
    pattern(): RegExp;
    extract(text: string, ref: Date, match: RegExpExecArray, opt: ParseOptions): ParsedResult | null;
}
