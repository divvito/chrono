"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const options = require("./options");
exports.options = options;
const options_1 = require("./options");
const parser_1 = require("./parsers/parser"), parser = parser_1;
exports.Parser = parser_1.default;
exports.parser = parser;
const refiner_1 = require("./refiners/refiner"), refiner = refiner_1;
exports.Refiner = refiner_1.default;
exports.refiner = refiner;
const refiner_2 = require("./refiners/refiner");
exports.Filter = refiner_2.Filter;
const result_1 = require("./result");
exports.ParsedResult = result_1.ParsedResult;
exports.ParsedComponents = result_1.ParsedComponents;
const DEFAULT_PARSE_OPTIONS = {
    forwardDate: false,
    afternoon: 15,
    evening: 18,
    morning: 6,
    noon: 12,
};
class Chrono {
    constructor(option = options_1.casualOption()) {
        this.option = option;
        this.parsers = option.parsers || [];
        this.refiners = option.refiners || [];
    }
    parse(text, refDate = new Date(), opt = {}) {
        const mergedOptions = Object.assign({}, DEFAULT_PARSE_OPTIONS, opt);
        let allResults = [];
        this.parsers.forEach((parser) => allResults.push(...parser.execute(text, refDate, mergedOptions)));
        allResults.sort((a, b) => a.index - b.index);
        this.refiners.forEach((refiner) => allResults = refiner.refine(text, allResults, mergedOptions));
        return allResults;
    }
    parseDate(text, refDate = new Date(), opt = {}) {
        const results = this.parse(text, refDate, opt);
        if (results.length > 0) {
            return results[0].start.date();
        }
        return null;
    }
}
exports.Chrono = Chrono;
exports.default = Chrono;
exports.strict = new Chrono(options_1.strictOption());
exports.casual = new Chrono(options_1.casualOption());
exports.en = new Chrono(options_1.mergeOptions([
    options_1.en.casual, options_1.commonPostProcessing
]));
exports.en_GB = new Chrono(options_1.mergeOptions([
    options_1.en_GB.casual, options_1.commonPostProcessing
]));
exports.de = new Chrono(options_1.mergeOptions([
    options_1.de.casual, options_1.en, options_1.commonPostProcessing
]));
exports.es = new Chrono(options_1.mergeOptions([
    options_1.es.casual, options_1.en, options_1.commonPostProcessing
]));
exports.fr = new Chrono(options_1.mergeOptions([
    options_1.fr.casual, options_1.en, options_1.commonPostProcessing
]));
exports.ja = new Chrono(options_1.mergeOptions([
    options_1.ja.casual, options_1.en, options_1.commonPostProcessing
]));
exports.parse = (text, ref, opt) => {
    return exports.casual.parse.call(exports.casual, text, ref, opt);
};
exports.parseDate = (text, ref, opt) => {
    return exports.casual.parseDate.call(exports.casual, text, ref, opt);
};
