import Refiner from './refiner';
import {ParsedResult} from "../result";
import {ParseOptions} from "../chrono";

export default class OverlapRemovalRefiner extends Refiner {
    refine(text: string, results: ParsedResult[], opt: ParseOptions): ParsedResult[] {
        if (results.length < 2) {
            return results;
        }

        const filteredResults: ParsedResult[] = [];
        let prevResult: ParsedResult = results[0];

        for (let i = 1; i < results.length; i++) {

            const result: ParsedResult = results[i];

            // If overlap, compare the length and discard the shorter one
            if (result.index < prevResult.index + prevResult.text.length) {

                if (result.text.length > prevResult.text.length) {
                    prevResult = result;
                }

            } else {
                filteredResults.push(prevResult);
                prevResult = result;
            }
        }

        // The last one
        if (prevResult != null) {
            filteredResults.push(prevResult);
        }

        return filteredResults;
    }
}