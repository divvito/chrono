import {ParseOptions} from "../src/chrono";
import {ParsedResult} from "../src/result";
import Parser from "../src/parsers/parser";

const chrono = require('../src/chrono');

var ok = function(arg: any) {
	expect(arg).toBeTruthy();
}

//-------------------------------------

test("Test - Load modules", function() {

	expect(chrono).toBeDefined();

	expect(chrono.Chrono).toBeDefined();

	expect(chrono.Chrono).toBeDefined();

	expect(chrono.Parser).toBeDefined();

	expect(chrono.Refiner).toBeDefined();

	expect(chrono.ParsedResult).toBeDefined();

	expect(chrono.ParsedComponents).toBeDefined();

	expect(chrono.parse).toBeDefined();

	expect(chrono.parseDate).toBeDefined();

	expect(chrono.options).toBeDefined();

	expect(chrono.casual).toBeDefined();

	expect(chrono.strict).toBeDefined();
});


test("Test - Create & manipulate date results", function() {

	var components = new chrono.ParsedComponents( {year: 2014, month: 11, day: 24});
	expect(components.get('year')).toBe(2014);
	expect(components.get('month')).toBe(11);
	expect(components.get('day')).toBe(24);
	expect(components.date()).toBeDefined();

	// undefined
	expect(components.get('dayOfWeek')).toBe(0);
	expect(components.isCertain('dayOfWeek')).toBe(false);

	// "imply"
	components.imply('dayOfWeek', 1);
	expect(components.get('dayOfWeek')).toBe(1);
	expect(components.isCertain('dayOfWeek')).toBe(false);
	
	// "assign" overrides "imply"
	components.assign('dayOfWeek', 2);
	expect(components.get('dayOfWeek')).toBe(2);
	expect(components.isCertain('dayOfWeek')).toBe(true);

	// "imply" doesn't overrides "assign"
	components.imply('year', 2013);
	expect(components.get('year')).toBe(2014);

	// "assign" overrides "assign"
	components.assign('year', 2013)
	expect(components.get('year')).toBe(2013);
});

test("Test - Calendar Checking", function() {

	var components = new chrono.ParsedComponents({year: 2014, month: 11, day: 24});
	expect(components.isPossibleDate()).toBe(true);

	var components = new chrono.ParsedComponents({year: 2014, month: 11, day: 24, hour:12});
	expect(components.isPossibleDate()).toBe(true);

	var components = new chrono.ParsedComponents({year: 2014, month: 11, day: 24, hour:12, minute: 30});
	expect(components.isPossibleDate()).toBe(true);

	var components = new chrono.ParsedComponents({year: 2014, month: 11, day: 24, hour:12, minute: 30, second: 30});
	expect(components.isPossibleDate()).toBe(true);

	var components = new chrono.ParsedComponents({year: 2014, month: 13, day: 24});
	expect(components.isPossibleDate()).toBe(false);

	var components = new chrono.ParsedComponents({year: 2014, month: 11, day: 32});
	expect(components.isPossibleDate()).toBe(false);

	var components = new chrono.ParsedComponents({year: 2014, month: 11, day: 24, hour:24});
	expect(components.isPossibleDate()).toBe(false);

	var components = new chrono.ParsedComponents({year: 2014, month: 11, day: 24, hour:12, minute: 60});
	expect(components.isPossibleDate()).toBe(false);

	var components = new chrono.ParsedComponents({year: 2014, month: 11, day: 24, hour:12, minute: 30, second: 60});
	expect(components.isPossibleDate()).toBe(false);
});

test("Test - Override parser", function() {

	var originalText = '01234-pattern-01234-pattern';
	var originalOpt = { some: 'thing'};
	var extractCalled = 0;

	class CustomParser extends chrono.Parser {
    	pattern(): RegExp { return /pattern/; }

        extract(text: string, ref: Date, match: RegExpExecArray, opt: ParseOptions): ParsedResult | null {
            if(extractCalled == 0){
                expect(text).toBe(originalText);
                expect(opt).toBe(originalOpt);
                expect(match.index).toBe(6);
            } else if(extractCalled == 1){
                expect(text).toBe(originalText);
                expect(opt).toBe(originalOpt);
                expect(match.index).toBe(20);
            }

            extractCalled += 1;
            return null;
        }

	}

	var customParser = new CustomParser();
	var results = customParser.execute(originalText, new Date(), originalOpt);
	expect(extractCalled).toBe(2);
});

test("Test - Add custom parser", function() {
	class CustomParser extends Parser {
        pattern(): RegExp { return /(\d{1,2})(st|nd|rd|th)/i }
        extract(text: string, ref: Date, match: RegExpExecArray, opt: ParseOptions): ParsedResult | null {
            return new chrono.ParsedResult({
                ref: ref,
                text: match[0],
                index: match.index,
                start: {
                    day: parseInt(match[1])
                }
            });
        }
    }

    var custom = new chrono.Chrono();
    custom.parsers.push(new CustomParser());

    var text = "meeting on 25th";
	var result = custom.parse(text, new Date(2017,11 -1, 19))[0];
	
    expect(result.text).toBe('25th')
    expect(result.start.get('month')).toBe(11)
    expect(result.start.get('day')).toBe(25)
})

test("Test - combining options", function() {

	var firstOption = {
		parsers: [
			new chrono.parser.ENISOFormatParser(),
		],
		refiners: [
			new chrono.refiner.OverlapRemovalRefiner(),
		]
	}

	var secondOption = {
		parsers: [
			new chrono.parser.ENISOFormatParser(),
			new chrono.parser.JPStandardParser(),
		],
		refiners: []
	}

	var mergedOption = chrono.options.mergeOptions([
		firstOption,
		secondOption
	]);

	ok(mergedOption);
	expect(mergedOption.parsers.length).toBe(2);
	expect(mergedOption.refiners.length).toBe(1);

	var customChrono = new chrono.Chrono(mergedOption);
	expect(customChrono.parseDate('2012-9-3')).not.toBeNull();
	expect(customChrono.parseDate('2012年９月3日')).not.toBeNull();
	expect(customChrono.parseDate('Tuesday')).toBeNull();
});

test("Test - default language options", function() {

	expect(chrono.ja.parseDate('2012-9-3')).not.toBeNull();
	expect(chrono.ja.parseDate('2012年９月3日')).not.toBeNull();
	expect(chrono.ja.parseDate('Lundi')).toBeNull();

	expect(chrono.fr.parseDate('2012-9-3')).not.toBeNull();
	expect(chrono.fr.parseDate('Lundi')).not.toBeNull();
	expect(chrono.fr.parseDate('2012年９月3日')).toBeNull();
});


