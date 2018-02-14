"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Refiner {
}
exports.default = Refiner;
class Filter extends Refiner {
    refine(text, results, opt) {
        return results.filter((result) => this.isValid(text, result, opt));
    }
    ;
}
exports.Filter = Filter;
// Common refiners
var OverlapRemovalRefiner_1 = require("./OverlapRemovalRefiner");
exports.OverlapRemovalRefiner = OverlapRemovalRefiner_1.default;
var ExtractTimezoneOffsetRefiner_1 = require("./ExtractTimezoneOffsetRefiner");
exports.ExtractTimezoneOffsetRefiner = ExtractTimezoneOffsetRefiner_1.default;
var ExtractTimezoneAbbrRefiner_1 = require("./ExtractTimezoneAbbrRefiner");
exports.ExtractTimezoneAbbrRefiner = ExtractTimezoneAbbrRefiner_1.default;
var ForwardDateRefiner_1 = require("./ForwardDateRefiner");
exports.ForwardDateRefiner = ForwardDateRefiner_1.default;
var UnlikelyFormatFilter_1 = require("./UnlikelyFormatFilter");
exports.UnlikelyFormatFilter = UnlikelyFormatFilter_1.default;
// EN refiners
var ENMergeDateTimeRefiner_1 = require("./EN/ENMergeDateTimeRefiner");
exports.ENMergeDateTimeRefiner = ENMergeDateTimeRefiner_1.default;
var ENMergeDateRangeRefiner_1 = require("./EN/ENMergeDateRangeRefiner");
exports.ENMergeDateRangeRefiner = ENMergeDateRangeRefiner_1.default;
var ENPrioritizeSpecificDateRefiner_1 = require("./EN/ENPrioritizeSpecificDateRefiner");
exports.ENPrioritizeSpecificDateRefiner = ENPrioritizeSpecificDateRefiner_1.default;
// JP refiners
var JPMergeDateRangeRefiner_1 = require("./JP/JPMergeDateRangeRefiner");
exports.JPMergeDateRangeRefiner = JPMergeDateRangeRefiner_1.default;
// FR refiners
var FRMergeDateRangeRefiner_1 = require("./FR/FRMergeDateRangeRefiner");
exports.FRMergeDateRangeRefiner = FRMergeDateRangeRefiner_1.default;
var FRMergeDateTimeRefiner_1 = require("./FR/FRMergeDateTimeRefiner");
exports.FRMergeDateTimeRefiner = FRMergeDateTimeRefiner_1.default;
// DE refiners
var DEMergeDateRangeRefiner_1 = require("./DE/DEMergeDateRangeRefiner");
exports.DEMergeDateRangeRefiner = DEMergeDateRangeRefiner_1.default;
var DEMergeDateTimeRefiner_1 = require("./DE/DEMergeDateTimeRefiner");
exports.DEMergeDateTimeRefiner = DEMergeDateTimeRefiner_1.default;
