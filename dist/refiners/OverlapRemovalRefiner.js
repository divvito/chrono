"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const refiner_1 = require("./refiner");
class OverlapRemovalRefiner extends refiner_1.default {
    refine(text, results, opt) {
        if (results.length < 2) {
            return results;
        }
        const filteredResults = [];
        let prevResult = results[0];
        for (let i = 1; i < results.length; i++) {
            const result = results[i];
            // If overlap, compare the length and discard the shorter one
            if (result.index < prevResult.index + prevResult.text.length) {
                if (result.text.length > prevResult.text.length) {
                    prevResult = result;
                }
            }
            else {
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
exports.default = OverlapRemovalRefiner;
