import * as options from './options';
import {Options,
    casualOption,
    commonPostProcessing,
    de as deParsers,
    en as enParsers,
    en_GB as en_GBParsers,
    es as esParsers,
    fr as frParsers,
    ja as jaParsers,
    mergeOptions,
    strictOption} from "./options";
import Parser, * as parser from './parsers/parser';
import Refiner, * as refiner from './refiners/refiner';
import {ParsedResult, ParsedComponents} from './result';

const {Filter} = refiner;
export {options, parser, refiner, Parser, Refiner, ParsedResult, ParsedComponents, Filter};

export type ParseOptions = {
    forwardDate: boolean,
    afternoon: number,
    evening: number,
    morning: number,
    noon: number
};

const DEFAULT_PARSE_OPTIONS: ParseOptions = {
    forwardDate: false,
    afternoon: 15,
    evening: 18,
    morning: 6,
    noon: 12,
};

export class Chrono {
    option: Options;
    parsers: Parser[];
    refiners: Refiner[];

    constructor(option: Options = casualOption()) {
        this.option = option;
        this.parsers = option.parsers || [];
        this.refiners = option.refiners || [];
    }

    parse(text: string, refDate: Date = new Date(), opt: Partial<ParseOptions> = {}): ParsedResult[] {
        const mergedOptions: ParseOptions = {...DEFAULT_PARSE_OPTIONS, ...opt};
        let allResults: ParsedResult[] = [];

        this.parsers.forEach((parser: Parser) =>
            allResults.push(...parser.execute(text, refDate, mergedOptions))
        );

        allResults.sort((a, b) => a.index - b.index);

        this.refiners.forEach((refiner) =>

            allResults = refiner.refine(text, allResults, mergedOptions)
        );

        return allResults;
    }

    parseDate(text: string, refDate: Date = new Date(), opt: Partial<ParseOptions> = {}): Date | null {
        const results = this.parse(text, refDate, opt);
        if (results.length > 0) {
            return results[0].start.date();
        }

        return null;
    }
}

export default Chrono;
export const strict: Chrono = new Chrono( strictOption() );
export const casual: Chrono = new Chrono( casualOption() );

export const en: Chrono = new Chrono( mergeOptions([
    enParsers.casual!, commonPostProcessing]));

export const en_GB: Chrono = new Chrono( mergeOptions([
    en_GBParsers.casual!, commonPostProcessing]));

export const de: Chrono = new Chrono( mergeOptions([
    deParsers.casual!, enParsers, commonPostProcessing]));

export const es: Chrono = new Chrono( mergeOptions([
    esParsers.casual!, enParsers, commonPostProcessing]));

export const fr: Chrono = new Chrono( mergeOptions([
    frParsers.casual!, enParsers, commonPostProcessing]));

export const ja: Chrono = new Chrono( mergeOptions([
    jaParsers.casual!, enParsers, commonPostProcessing]));


export const parse = (text: string, ref?: Date, opt?: ParseOptions) => {
    return casual.parse.call(casual, text, ref, opt);
};

export const parseDate = (text: string, ref?: Date, opt?: ParseOptions) => {
    return casual.parseDate.call(casual, text, ref, opt);
};




