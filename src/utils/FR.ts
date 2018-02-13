import {NameMap, UnitOfTime, UnitRegexMap} from "../constants";

export const WEEKDAY_OFFSET: NameMap = {
    'dimanche': 0,
    'dim': 0,
    'lundi': 1,
    'lun': 1,
    'mardi': 2,
    'mar': 2,
    'mercredi': 3,
    'mer': 3,
    'jeudi': 4,
    'jeu': 4,
    'vendredi': 5,
    'ven': 5,
    'samedi': 6,
    'sam': 6
};

// noinspection NonAsciiCharacters, JSNonASCIINames
export const MONTH_OFFSET: NameMap = {
    'janvier': 1,
    'jan': 1,
    'jan.': 1,
    'février': 2,
    'fév': 2,
    'fév.': 2,
    'fevrier': 2,
    'fev': 2,
    'fev.': 2,
    'mars': 3,
    'mar': 3,
    'mar.': 3,
    'avril': 4,
    'avr': 4,
    'avr.': 4,
    'mai': 5,
    'juin': 6,
    'jun': 6,
    'juil': 7,
    'juillet': 7,
    'jul': 7,
    'jul.': 7,
    'août': 8,
    'aout': 8,
    'septembre': 9,
    'sep': 9,
    'sep.': 9,
    'sept': 9,
    'sept.': 9,
    'octobre': 10,
    'oct': 10,
    'oct.': 10,
    'novembre': 11,
    'nov': 11,
    'nov.': 11,
    'décembre': 12,
    'decembre': 12,
    'dec': 12,
    'dec.': 12
};

export const INTEGER_WORDS_PATTERN: string = '(?:un|deux|trois|quatre|cinq|six|sept|huit|neuf|dix|onze|douze|treize)';
export const INTEGER_WORDS: NameMap = {
    'un': 1,
    'deux': 2,
    'trois': 3,
    'quatre': 4,
    'cinq': 5,
    'six': 6,
    'sept': 7,
    'huit': 8,
    'neuf': 9,
    'dix': 10,
    'onze': 11,
    'douze': 12,
    'treize': 13,
};

const unitPatterns: UnitRegexMap = {
    day: /jours?/,
    hour: /heures?/,
    minute: /min(?:ute)?s?/,
    second: /secondes?/,
    week: /semaines?/,
    month: /mois?/,
    year: /an(?:née)?s?/
};

export const matchUnit = (text: string): UnitOfTime | undefined => (Object.keys(unitPatterns) as UnitOfTime[]).find(
    (unit: UnitOfTime): boolean => unitPatterns[unit]!.test(text)
);

const THREE_REGEX: RegExp = /quelques?/;
const HALF_REGEX: RegExp = /demi-?/;

export const matchNumber = (text: string): number => {
    if (!text) {
        return 1;
    }
    if (INTEGER_WORDS.hasOwnProperty(text)) {
        return INTEGER_WORDS[text];
    } else if (text === 'un' || text === 'une'){
        return 1;
    } else if (text.match(THREE_REGEX)) {
        return 3;
    } else if (text.match(HALF_REGEX)) {
        return 0.5;
    }

    const num: number = parseInt(text, 10);
    if (isNaN(num)) {
        return 1;
    }

    return num;
};

const AD_REGEX: RegExp = /a/i;

export const yearCalculation = (year: string, yearBe: string): number | null => {
    if (year) {
        let result: number = parseInt(year, 10);
        if (yearBe && AD_REGEX.test(yearBe)) {
            return -result;
        } else if (!yearBe) {
            if (result < 100) {
                return result + 2000;
            } else {
                return result;
            }
        } else {
            return result;
        }
    }

    return null;
};