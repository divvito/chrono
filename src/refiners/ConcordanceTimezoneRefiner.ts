import Refiner from './refiner';
import {ParsedResult} from "../result";
import {ParseOptions} from "../chrono";

// Uhhhh... should this be doing something?

export default class ConcordanceTimezoneRefiner extends Refiner {
    refine(text: string, results: ParsedResult[], opt: ParseOptions): ParsedResult[] {
        return results;
    }
}