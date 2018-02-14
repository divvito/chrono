import {ParseOptions} from "../src/chrono";
import Refiner from "../src/refiners/refiner";
import {ParsedResult} from "../src/result";
import Parser from "../src/parsers/parser";

var chrono = require('../src/chrono');



test("Test - Custom parser example", function() {



    class ChristmasParser extends Parser {
        pattern(): RegExp { return /Christmas/i }
        extract(text: string, ref: Date, match: RegExpExecArray, opt: ParseOptions): ParsedResult | null {
            // Return a parsed result, that is 25 December
            return new chrono.ParsedResult({
                ref: ref,
                text: match[0],
                index: match.index,
                start: {
                    day: 25,
                    month: 12,
                }
            });
        };
    }

    var custom = new chrono.Chrono();
    custom.parsers.push(new ChristmasParser());

    var resultDate = custom.parseDate("I'll arrive at 2.30AM on Christmas night", new Date(2013, 11, 10))
    var expectDate = new Date(2013, 12-1, 25, 2, 30, 0);
    expect(expectDate.getTime()).toBeCloseTo(resultDate.getTime())
    
});


test("Test - Custom refiner example", function() {

    class GuessPMRefiner extends Refiner {
        refine(text: string, results: ParsedResult[], opt: ParseOptions): ParsedResult[] {
            results.forEach(function (result) {

                if (!result.start.isCertain('meridiem')
                    &&  result.start.get('hour') >= 1 && result.start.get('hour') < 4) {

                    result.start.assign('meridiem', 1);
                    result.start.assign('hour', result.start.get('hour') + 12);
                }
            });

            return results;
        }
    }


    var custom = new chrono.Chrono();
    custom.refiners.push(new GuessPMRefiner());

    var resultDate = custom.parseDate("This is at 2.30", new Date(2013, 11, 10))
    var expectDate = new Date(2013, 12-1, 10, 14, 30, 0);
    expect(expectDate.getTime()).toBeCloseTo(resultDate.getTime())
    

    var resultDate = custom.parseDate("This is at 2.30 AM", new Date(2013, 11, 10))
    var expectDate = new Date(2013, 12-1, 10, 2, 30, 0);
    expect(expectDate.getTime()).toBeCloseTo(resultDate.getTime())
    
});

