import Parser, {
    DECasualDateParser,
    DEDeadlineFormatParser,
    DEMonthNameLittleEndianParser,
    DEMonthNameParser,
    DESlashDateFormatParser,
    DETimeAgoFormatParser,
    DETimeExpressionParser,
    DEWeekdayParser,
    ENCasualDateParser,
    ENCasualTimeParser,
    ENDeadlineFormatParser,
    ENISOFormatParser,
    ENMonthNameLittleEndianParser,
    ENMonthNameMiddleEndianParser,
    ENMonthNameParser,
    ENRelativeDateFormatParser,
    ENSlashDateFormatParser,
    ENSlashDateFormatStartWithYearParser,
    ENSlashMonthFormatParser,
    ENTimeAgoFormatParser,
    ENTimeExpressionParser,
    ENTimeLaterFormatParser,
    ENWeekdayParser,
    ESCasualDateParser,
    ESDeadlineFormatParser,
    ESMonthNameLittleEndianParser,
    ESSlashDateFormatParser,
    ESTimeAgoFormatParser,
    ESTimeExpressionParser,
    ESWeekdayParser,
    FRCasualDateParser,
    FRDeadlineFormatParser,
    FRMonthNameLittleEndianParser,
    FRRelativeDateFormatParser,
    FRSlashDateFormatParser,
    FRTimeAgoFormatParser,
    FRTimeExpressionParser,
    FRWeekdayParser,
    JPCasualDateParser,
    JPStandardParser,
    ZHHantCasualDateParser,
    ZHHantDateParser,
    ZHHantDeadlineFormatParser,
    ZHHantTimeExpressionParser,
    ZHHantWeekdayParser
} from './parsers/parser';
import Refiner, {
    DEMergeDateRangeRefiner,
    DEMergeDateTimeRefiner,
    ENMergeDateRangeRefiner,
    ENMergeDateTimeRefiner,
    ENPrioritizeSpecificDateRefiner,
    ExtractTimezoneAbbrRefiner,
    ExtractTimezoneOffsetRefiner,
    ForwardDateRefiner,
    FRMergeDateRangeRefiner,
    FRMergeDateTimeRefiner,
    JPMergeDateRangeRefiner,
    OverlapRemovalRefiner,
    UnlikelyFormatFilter
} from './refiners/refiner';

export type Options = {
    parsers?: Parser[];
    refiners?: Refiner[];
}
export type Config = {
    strict?: boolean,
    littleEndian?: boolean
}
export type OptionsResolver = (config?: Config) => Options;
export type OptionsOrResolver = Options | OptionsResolver;

export interface OptionsResolverWithCasual extends OptionsResolver {
    casual?: OptionsResolver;
}

function isResolver(test: OptionsOrResolver): test is OptionsResolver {
    return (<OptionsResolver>test).call !== undefined;
}

export const mergeOptions = (options: OptionsOrResolver[]): Options => {
    const addedTypes: { [k: string]: true } = {};
    const mergedOption: Options = {
        parsers: [],
        refiners: []
    };

    options.forEach((maybeOption: OptionsOrResolver) => {
        const option: Options = isResolver(maybeOption) ? maybeOption.call(maybeOption) : maybeOption;

        if (option.parsers) {
            option.parsers.forEach((parser: Parser) => {
                if (!addedTypes[parser.constructor.name]) {
                    mergedOption.parsers!.push(parser);
                    addedTypes[parser.constructor.name] = true;
                }
            });
        }

        if (option.refiners) {
            option.refiners.forEach((refiner: Refiner) => {
                if (!addedTypes[refiner.constructor.name]) {
                    mergedOption.refiners!.push(refiner);
                    addedTypes[refiner.constructor.name] = true;
                }
            });
        }
    });

    return mergedOption;
};

export const commonPostProcessing: OptionsResolver = (): Options => ({
    refiners: [
        // These should be after all other refiners
        new ExtractTimezoneOffsetRefiner(),
        new ExtractTimezoneAbbrRefiner(),
        new UnlikelyFormatFilter()
    ]
});

// -------------------------------------------------------------

export const strictOption: OptionsResolver = (): Options => {
    const strictConfig = {
        strict: true
    };

    return mergeOptions([
        en(strictConfig),
        de(strictConfig),
        es(strictConfig),
        fr(strictConfig),
        ja(),
        zh(),
        commonPostProcessing
    ]);
};

export const casualOption: OptionsResolver = (): Options => mergeOptions([
    en.casual!,
    // Some German abbreviate overlap with common English
    de({strict: true}),
    es.casual!,
    fr.casual!,
    ja.casual!,
    zh,
    commonPostProcessing
]);

// -------------------------------------------------------------

const de: OptionsResolverWithCasual = (config): Options => ({
    parsers: [
        new DEDeadlineFormatParser(config),
        new DEMonthNameLittleEndianParser(config),
        new DEMonthNameParser(config),
        new DESlashDateFormatParser(config),
        new DETimeAgoFormatParser(config),
        new DETimeExpressionParser(config)
    ],
    refiners: [
        new OverlapRemovalRefiner(),
        new ForwardDateRefiner(),
        new DEMergeDateTimeRefiner(),
        new DEMergeDateRangeRefiner()
    ]
});

de.casual = (): Options => {
    const options: Options = de({strict: false});
    options.parsers!.unshift(new DECasualDateParser());
    options.parsers!.unshift(new DEWeekdayParser());
    return options;
};

// -------------------------------------------------------------

const en: OptionsResolverWithCasual = (config): Options => ({
    parsers: [
        new ENISOFormatParser(config),
        new ENDeadlineFormatParser(config),
        new ENMonthNameLittleEndianParser(config),
        new ENMonthNameMiddleEndianParser(config),
        new ENMonthNameParser(config),
        new ENSlashDateFormatParser(config),
        new ENSlashDateFormatStartWithYearParser(config),
        new ENSlashMonthFormatParser(config),
        new ENTimeAgoFormatParser(config),
        new ENTimeLaterFormatParser(config),
        new ENTimeExpressionParser(config)
    ],
    refiners: [
        new OverlapRemovalRefiner(),
        new ForwardDateRefiner(),

        // English
        new ENMergeDateTimeRefiner(),
        new ENMergeDateRangeRefiner(),
        new ENPrioritizeSpecificDateRefiner()
    ]
});

en.casual = (config: Config = {}): Options => {
    const options: Options = en({...config, strict: false});

    // EN
    options.parsers!.unshift(new ENCasualDateParser());
    options.parsers!.unshift(new ENCasualTimeParser());
    options.parsers!.unshift(new ENWeekdayParser());
    options.parsers!.unshift(new ENRelativeDateFormatParser());
    return options;
};

const en_GB: OptionsResolverWithCasual = (config: Config = {}): Options => en({...config, littleEndian: true});

en_GB.casual = (config: Config = {}): Options => en.casual!({...config, littleEndian: true});

// -------------------------------------------------------------

const ja: OptionsResolverWithCasual = (): Options => ({
    parsers: [
        new JPStandardParser()
    ],
    refiners: [
        new OverlapRemovalRefiner(),
        new ForwardDateRefiner(),
        new JPMergeDateRangeRefiner()
    ]
});

ja.casual = (): Options => {
    const options: Options = ja();
    options.parsers!.unshift(new JPCasualDateParser());
    return options;
};

// -------------------------------------------------------------


const es: OptionsResolverWithCasual = (config?: Config): Options => ({
    parsers: [
        new ESTimeAgoFormatParser(config),
        new ESDeadlineFormatParser(config),
        new ESTimeExpressionParser(config),
        new ESMonthNameLittleEndianParser(config),
        new ESSlashDateFormatParser(config)
    ],
    refiners: [
        new OverlapRemovalRefiner(),
        new ForwardDateRefiner()
    ]
});

es.casual = (): Options => {
    const options: Options = es({strict: false});

    options.parsers!.unshift(new ESCasualDateParser());
    options.parsers!.unshift(new ESWeekdayParser());
    return options;
};

// -------------------------------------------------------------

const fr: OptionsResolverWithCasual = (config?: Config): Options => ({
    parsers: [
        new FRDeadlineFormatParser(config),
        new FRMonthNameLittleEndianParser(config),
        new FRSlashDateFormatParser(config),
        new FRTimeAgoFormatParser(config),
        new FRTimeExpressionParser(config)
    ],
    refiners: [
        new OverlapRemovalRefiner(),
        new ForwardDateRefiner(),
        new FRMergeDateRangeRefiner(),
        new FRMergeDateTimeRefiner()
    ]
});

fr.casual = (): Options => {
    const option: Options = fr({strict: false});

    option.parsers!.unshift(new FRCasualDateParser());
    option.parsers!.unshift(new FRWeekdayParser());
    option.parsers!.unshift(new FRRelativeDateFormatParser());
    return option;
};

// -------------------------------------------------------------

const zh: OptionsResolver = (): Options => ({
    parsers: [
        new ZHHantDateParser(),
        new ZHHantWeekdayParser(),
        new ZHHantTimeExpressionParser(),
        new ZHHantCasualDateParser(),
        new ZHHantDeadlineFormatParser()
    ],
    refiners: [
        new OverlapRemovalRefiner(),
        new ForwardDateRefiner()
    ]
});

export {de, en, fr, en_GB, ja, es, zh};