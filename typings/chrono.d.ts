import * as options from './options';
import { Options } from "./options";
import Parser, * as parser from './parsers/parser';
import Refiner, * as refiner from './refiners/refiner';
import { ParsedResult, ParsedComponents } from './result';
export { options, parser, refiner, Parser, Refiner, ParsedResult, ParsedComponents, Filter };
export declare type ParseOptions = {
    forwardDate: boolean;
    afternoon: number;
    evening: number;
    morning: number;
    noon: number;
};
export declare class Chrono {
    option: Options;
    parsers: Parser[];
    refiners: Refiner[];
    constructor(option?: Options);
    parse(text: string, refDate?: Date, opt?: Partial<ParseOptions>): ParsedResult[];
    parseDate(text: string, refDate?: Date, opt?: Partial<ParseOptions>): Date | null;
}
export default Chrono;
export declare const strict: Chrono;
export declare const casual: Chrono;
export declare const en: Chrono;
export declare const en_GB: Chrono;
export declare const de: Chrono;
export declare const es: Chrono;
export declare const fr: Chrono;
export declare const ja: Chrono;
export declare const parse: (text: string, ref?: Date, opt?: ParseOptions) => any;
export declare const parseDate: (text: string, ref?: Date, opt?: ParseOptions) => any;
