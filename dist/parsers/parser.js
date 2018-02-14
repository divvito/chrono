"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Parser {
    constructor(config = {}) {
        this.strictMode = !!config.strict;
    }
    isStrictMode() {
        return this.strictMode;
    }
    execute(text, ref, opt) {
        const results = [];
        const regex = this.pattern();
        let remainingText = text;
        let match = regex.exec(remainingText);
        while (match) {
            // Calculate match index on the full text;
            match.index += text.length - remainingText.length;
            let result = this.extract(text, ref, match, opt);
            if (result) {
                // If success, start from the end of the result
                remainingText = text.substring(result.index + result.text.length);
                if (!this.isStrictMode() || result.hasPossibleDates()) {
                    results.push(result);
                }
            }
            else {
                // If fail, move on by 1 - This should rarely, if ever happen (we matched but couldn't create a result from it)
                remainingText = text.substring(match.index + 1);
            }
            match = regex.exec(remainingText);
        }
        return results;
    }
}
exports.default = Parser;
var ENISOFormatParser_1 = require("./EN/ENISOFormatParser");
exports.ENISOFormatParser = ENISOFormatParser_1.default;
var ENDeadlineFormatParser_1 = require("./EN/ENDeadlineFormatParser");
exports.ENDeadlineFormatParser = ENDeadlineFormatParser_1.default;
var ENRelativeDateFormatParser_1 = require("./EN/ENRelativeDateFormatParser");
exports.ENRelativeDateFormatParser = ENRelativeDateFormatParser_1.default;
var ENMonthNameLittleEndianParser_1 = require("./EN/ENMonthNameLittleEndianParser");
exports.ENMonthNameLittleEndianParser = ENMonthNameLittleEndianParser_1.default;
var ENMonthNameMiddleEndianParser_1 = require("./EN/ENMonthNameMiddleEndianParser");
exports.ENMonthNameMiddleEndianParser = ENMonthNameMiddleEndianParser_1.default;
var ENMonthNameParser_1 = require("./EN/ENMonthNameParser");
exports.ENMonthNameParser = ENMonthNameParser_1.default;
var ENSlashDateFormatParser_1 = require("./EN/ENSlashDateFormatParser");
exports.ENSlashDateFormatParser = ENSlashDateFormatParser_1.default;
var ENSlashDateFormatStartWithYearParser_1 = require("./EN/ENSlashDateFormatStartWithYearParser");
exports.ENSlashDateFormatStartWithYearParser = ENSlashDateFormatStartWithYearParser_1.default;
var ENSlashMonthFormatParser_1 = require("./EN/ENSlashMonthFormatParser");
exports.ENSlashMonthFormatParser = ENSlashMonthFormatParser_1.default;
var ENTimeAgoFormatParser_1 = require("./EN/ENTimeAgoFormatParser");
exports.ENTimeAgoFormatParser = ENTimeAgoFormatParser_1.default;
var ENTimeExpressionParser_1 = require("./EN/ENTimeExpressionParser");
exports.ENTimeExpressionParser = ENTimeExpressionParser_1.default;
var ENTimeLaterFormatParser_1 = require("./EN/ENTimeLaterFormatParser");
exports.ENTimeLaterFormatParser = ENTimeLaterFormatParser_1.default;
var ENWeekdayParser_1 = require("./EN/ENWeekdayParser");
exports.ENWeekdayParser = ENWeekdayParser_1.default;
var ENCasualDateParser_1 = require("./EN/ENCasualDateParser");
exports.ENCasualDateParser = ENCasualDateParser_1.default;
var ENCasualTimeParser_1 = require("./EN/ENCasualTimeParser");
exports.ENCasualTimeParser = ENCasualTimeParser_1.default;
var JPStandardParser_1 = require("./JP/JPStandardParser");
exports.JPStandardParser = JPStandardParser_1.default;
var JPCasualDateParser_1 = require("./JP/JPCasualDateParser");
exports.JPCasualDateParser = JPCasualDateParser_1.default;
var ESCasualDateParser_1 = require("./ES/ESCasualDateParser");
exports.ESCasualDateParser = ESCasualDateParser_1.default;
var ESDeadlineFormatParser_1 = require("./ES/ESDeadlineFormatParser");
exports.ESDeadlineFormatParser = ESDeadlineFormatParser_1.default;
var ESTimeAgoFormatParser_1 = require("./ES/ESTimeAgoFormatParser");
exports.ESTimeAgoFormatParser = ESTimeAgoFormatParser_1.default;
var ESTimeExpressionParser_1 = require("./ES/ESTimeExpressionParser");
exports.ESTimeExpressionParser = ESTimeExpressionParser_1.default;
var ESWeekdayParser_1 = require("./ES/ESWeekdayParser");
exports.ESWeekdayParser = ESWeekdayParser_1.default;
var ESMonthNameLittleEndianParser_1 = require("./ES/ESMonthNameLittleEndianParser");
exports.ESMonthNameLittleEndianParser = ESMonthNameLittleEndianParser_1.default;
var ESSlashDateFormatParser_1 = require("./ES/ESSlashDateFormatParser");
exports.ESSlashDateFormatParser = ESSlashDateFormatParser_1.default;
var FRCasualDateParser_1 = require("./FR/FRCasualDateParser");
exports.FRCasualDateParser = FRCasualDateParser_1.default;
var FRDeadlineFormatParser_1 = require("./FR/FRDeadlineFormatParser");
exports.FRDeadlineFormatParser = FRDeadlineFormatParser_1.default;
var FRMonthNameLittleEndianParser_1 = require("./FR/FRMonthNameLittleEndianParser");
exports.FRMonthNameLittleEndianParser = FRMonthNameLittleEndianParser_1.default;
var FRSlashDateFormatParser_1 = require("./FR/FRSlashDateFormatParser");
exports.FRSlashDateFormatParser = FRSlashDateFormatParser_1.default;
var FRTimeAgoFormatParser_1 = require("./FR/FRTimeAgoFormatParser");
exports.FRTimeAgoFormatParser = FRTimeAgoFormatParser_1.default;
var FRTimeExpressionParser_1 = require("./FR/FRTimeExpressionParser");
exports.FRTimeExpressionParser = FRTimeExpressionParser_1.default;
var FRWeekdayParser_1 = require("./FR/FRWeekdayParser");
exports.FRWeekdayParser = FRWeekdayParser_1.default;
var FRRelativeDateFormatParser_1 = require("./FR/FRRelativeDateFormatParser");
exports.FRRelativeDateFormatParser = FRRelativeDateFormatParser_1.default;
var ZHHantDateParser_1 = require("./ZH-Hant/ZHHantDateParser");
exports.ZHHantDateParser = ZHHantDateParser_1.default;
var ZHHantWeekdayParser_1 = require("./ZH-Hant/ZHHantWeekdayParser");
exports.ZHHantWeekdayParser = ZHHantWeekdayParser_1.default;
var ZHHantTimeExpressionParser_1 = require("./ZH-Hant/ZHHantTimeExpressionParser");
exports.ZHHantTimeExpressionParser = ZHHantTimeExpressionParser_1.default;
var ZHHantCasualDateParser_1 = require("./ZH-Hant/ZHHantCasualDateParser");
exports.ZHHantCasualDateParser = ZHHantCasualDateParser_1.default;
var ZHHantDeadlineFormatParser_1 = require("./ZH-Hant/ZHHantDeadlineFormatParser");
exports.ZHHantDeadlineFormatParser = ZHHantDeadlineFormatParser_1.default;
var DEDeadlineFormatParser_1 = require("./DE/DEDeadlineFormatParser");
exports.DEDeadlineFormatParser = DEDeadlineFormatParser_1.default;
var DEMonthNameLittleEndianParser_1 = require("./DE/DEMonthNameLittleEndianParser");
exports.DEMonthNameLittleEndianParser = DEMonthNameLittleEndianParser_1.default;
var DEMonthNameParser_1 = require("./DE/DEMonthNameParser");
exports.DEMonthNameParser = DEMonthNameParser_1.default;
var DESlashDateFormatParser_1 = require("./DE/DESlashDateFormatParser");
exports.DESlashDateFormatParser = DESlashDateFormatParser_1.default;
var DETimeAgoFormatParser_1 = require("./DE/DETimeAgoFormatParser");
exports.DETimeAgoFormatParser = DETimeAgoFormatParser_1.default;
var DETimeExpressionParser_1 = require("./DE/DETimeExpressionParser");
exports.DETimeExpressionParser = DETimeExpressionParser_1.default;
var DEWeekdayParser_1 = require("./DE/DEWeekdayParser");
exports.DEWeekdayParser = DEWeekdayParser_1.default;
var DECasualDateParser_1 = require("./DE/DECasualDateParser");
exports.DECasualDateParser = DECasualDateParser_1.default;
