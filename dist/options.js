"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parser_1 = require("./parsers/parser");
const refiner_1 = require("./refiners/refiner");
function isResolver(test) {
    return test.call !== undefined;
}
exports.mergeOptions = (options) => {
    const addedTypes = {};
    const mergedOption = {
        parsers: [],
        refiners: []
    };
    options.forEach((maybeOption) => {
        const option = isResolver(maybeOption) ? maybeOption.call(maybeOption) : maybeOption;
        if (option.parsers) {
            option.parsers.forEach((parser) => {
                if (!addedTypes[parser.constructor.name]) {
                    mergedOption.parsers.push(parser);
                    addedTypes[parser.constructor.name] = true;
                }
            });
        }
        if (option.refiners) {
            option.refiners.forEach((refiner) => {
                if (!addedTypes[refiner.constructor.name]) {
                    mergedOption.refiners.push(refiner);
                    addedTypes[refiner.constructor.name] = true;
                }
            });
        }
    });
    return mergedOption;
};
exports.commonPostProcessing = () => ({
    refiners: [
        // These should be after all other refiners
        new refiner_1.ExtractTimezoneOffsetRefiner(),
        new refiner_1.ExtractTimezoneAbbrRefiner(),
        new refiner_1.UnlikelyFormatFilter()
    ]
});
// -------------------------------------------------------------
exports.strictOption = () => {
    const strictConfig = {
        strict: true
    };
    return exports.mergeOptions([
        en(strictConfig),
        de(strictConfig),
        es(strictConfig),
        fr(strictConfig),
        ja(),
        zh(),
        exports.commonPostProcessing
    ]);
};
exports.casualOption = () => exports.mergeOptions([
    en.casual,
    // Some German abbreviate overlap with common English
    de({ strict: true }),
    es.casual,
    fr.casual,
    ja.casual,
    zh,
    exports.commonPostProcessing
]);
// -------------------------------------------------------------
const de = (config) => ({
    parsers: [
        new parser_1.DEDeadlineFormatParser(config),
        new parser_1.DEMonthNameLittleEndianParser(config),
        new parser_1.DEMonthNameParser(config),
        new parser_1.DESlashDateFormatParser(config),
        new parser_1.DETimeAgoFormatParser(config),
        new parser_1.DETimeExpressionParser(config)
    ],
    refiners: [
        new refiner_1.OverlapRemovalRefiner(),
        new refiner_1.ForwardDateRefiner(),
        new refiner_1.DEMergeDateTimeRefiner(),
        new refiner_1.DEMergeDateRangeRefiner()
    ]
});
exports.de = de;
de.casual = () => {
    const options = de({ strict: false });
    options.parsers.unshift(new parser_1.DECasualDateParser());
    options.parsers.unshift(new parser_1.DEWeekdayParser());
    return options;
};
// -------------------------------------------------------------
const en = (config) => ({
    parsers: [
        new parser_1.ENISOFormatParser(config),
        new parser_1.ENDeadlineFormatParser(config),
        new parser_1.ENMonthNameLittleEndianParser(config),
        new parser_1.ENMonthNameMiddleEndianParser(config),
        new parser_1.ENMonthNameParser(config),
        new parser_1.ENSlashDateFormatParser(config),
        new parser_1.ENSlashDateFormatStartWithYearParser(config),
        new parser_1.ENSlashMonthFormatParser(config),
        new parser_1.ENTimeAgoFormatParser(config),
        new parser_1.ENTimeLaterFormatParser(config),
        new parser_1.ENTimeExpressionParser(config)
    ],
    refiners: [
        new refiner_1.OverlapRemovalRefiner(),
        new refiner_1.ForwardDateRefiner(),
        // English
        new refiner_1.ENMergeDateTimeRefiner(),
        new refiner_1.ENMergeDateRangeRefiner(),
        new refiner_1.ENPrioritizeSpecificDateRefiner()
    ]
});
exports.en = en;
en.casual = (config = {}) => {
    const options = en(Object.assign({}, config, { strict: false }));
    // EN
    options.parsers.unshift(new parser_1.ENCasualDateParser());
    options.parsers.unshift(new parser_1.ENCasualTimeParser());
    options.parsers.unshift(new parser_1.ENWeekdayParser());
    options.parsers.unshift(new parser_1.ENRelativeDateFormatParser());
    return options;
};
const en_GB = (config = {}) => en(Object.assign({}, config, { littleEndian: true }));
exports.en_GB = en_GB;
en_GB.casual = (config = {}) => en.casual(Object.assign({}, config, { littleEndian: true }));
// -------------------------------------------------------------
const ja = () => ({
    parsers: [
        new parser_1.JPStandardParser()
    ],
    refiners: [
        new refiner_1.OverlapRemovalRefiner(),
        new refiner_1.ForwardDateRefiner(),
        new refiner_1.JPMergeDateRangeRefiner()
    ]
});
exports.ja = ja;
ja.casual = () => {
    const options = ja();
    options.parsers.unshift(new parser_1.JPCasualDateParser());
    return options;
};
// -------------------------------------------------------------
const es = (config) => ({
    parsers: [
        new parser_1.ESTimeAgoFormatParser(config),
        new parser_1.ESDeadlineFormatParser(config),
        new parser_1.ESTimeExpressionParser(config),
        new parser_1.ESMonthNameLittleEndianParser(config),
        new parser_1.ESSlashDateFormatParser(config)
    ],
    refiners: [
        new refiner_1.OverlapRemovalRefiner(),
        new refiner_1.ForwardDateRefiner()
    ]
});
exports.es = es;
es.casual = () => {
    const options = es({ strict: false });
    options.parsers.unshift(new parser_1.ESCasualDateParser());
    options.parsers.unshift(new parser_1.ESWeekdayParser());
    return options;
};
// -------------------------------------------------------------
const fr = (config) => ({
    parsers: [
        new parser_1.FRDeadlineFormatParser(config),
        new parser_1.FRMonthNameLittleEndianParser(config),
        new parser_1.FRSlashDateFormatParser(config),
        new parser_1.FRTimeAgoFormatParser(config),
        new parser_1.FRTimeExpressionParser(config)
    ],
    refiners: [
        new refiner_1.OverlapRemovalRefiner(),
        new refiner_1.ForwardDateRefiner(),
        new refiner_1.FRMergeDateRangeRefiner(),
        new refiner_1.FRMergeDateTimeRefiner()
    ]
});
exports.fr = fr;
fr.casual = () => {
    const option = fr({ strict: false });
    option.parsers.unshift(new parser_1.FRCasualDateParser());
    option.parsers.unshift(new parser_1.FRWeekdayParser());
    option.parsers.unshift(new parser_1.FRRelativeDateFormatParser());
    return option;
};
// -------------------------------------------------------------
const zh = () => ({
    parsers: [
        new parser_1.ZHHantDateParser(),
        new parser_1.ZHHantWeekdayParser(),
        new parser_1.ZHHantTimeExpressionParser(),
        new parser_1.ZHHantCasualDateParser(),
        new parser_1.ZHHantDeadlineFormatParser()
    ],
    refiners: [
        new refiner_1.OverlapRemovalRefiner(),
        new refiner_1.ForwardDateRefiner()
    ]
});
exports.zh = zh;
