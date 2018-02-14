import Refiner from './refiner';
import { ParsedResult } from "../result";
import { ParseOptions } from "../chrono";
export default class OverlapRemovalRefiner extends Refiner {
    refine(text: string, results: ParsedResult[], opt: ParseOptions): ParsedResult[];
}
