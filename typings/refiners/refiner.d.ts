import { ParsedResult } from "../result";
import { ParseOptions } from "../chrono";
export default abstract class Refiner {
    abstract refine(text: string, results: ParsedResult[], opt: ParseOptions): ParsedResult[];
}
export declare abstract class Filter extends Refiner {
    abstract isValid(text: string, result: ParsedResult, opt: ParseOptions): boolean;
    refine(text: string, results: ParsedResult[], opt: ParseOptions): ParsedResult[];
}
export { default as OverlapRemovalRefiner } from './OverlapRemovalRefiner';
export { default as ExtractTimezoneOffsetRefiner } from './ExtractTimezoneOffsetRefiner';
export { default as ExtractTimezoneAbbrRefiner } from './ExtractTimezoneAbbrRefiner';
export { default as ForwardDateRefiner } from './ForwardDateRefiner';
export { default as UnlikelyFormatFilter } from './UnlikelyFormatFilter';
export { default as ENMergeDateTimeRefiner } from './EN/ENMergeDateTimeRefiner';
export { default as ENMergeDateRangeRefiner } from './EN/ENMergeDateRangeRefiner';
export { default as ENPrioritizeSpecificDateRefiner } from './EN/ENPrioritizeSpecificDateRefiner';
export { default as JPMergeDateRangeRefiner } from './JP/JPMergeDateRangeRefiner';
export { default as FRMergeDateRangeRefiner } from './FR/FRMergeDateRangeRefiner';
export { default as FRMergeDateTimeRefiner } from './FR/FRMergeDateTimeRefiner';
export { default as DEMergeDateRangeRefiner } from './DE/DEMergeDateRangeRefiner';
export { default as DEMergeDateTimeRefiner } from './DE/DEMergeDateTimeRefiner';
