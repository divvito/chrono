import Refiner from './refiner';
import { ParsedResult } from "../result";
import { ParseOptions } from "../chrono";
export default class ForwardDateRefiner extends Refiner {
    private TAG;
    refine(text: string, results: ParsedResult[], opt: ParseOptions): ParsedResult[];
}
