import {NameMap, UnitOfTime, UnitRegexMap} from "../constants";

// noinspection NonAsciiCharacters, JSNonASCIINames
export const WEEKDAY_OFFSET: NameMap = {
    'domingo': 0,
    'dom': 0,
    'lunes': 1,
    'lun': 1,
    'martes': 2,
    'mar': 2,
    'miércoles': 3,
    'miercoles': 3,
    'mie': 3,
    'jueves': 4,
    'jue': 4,
    'viernes': 5,
    'vie': 5,
    'sábado': 6,
    'sabado': 6,
    'sab': 6,
};
// noinspection NonAsciiCharacters, JSNonASCIINames
export const MONTH_OFFSET: NameMap = {
    'enero': 1,
    'ene': 1,
    'ene.': 1,
    'febrero': 2,
    'feb': 2,
    'feb.': 2,
    'marzo': 3,
    'mar': 3,
    'mar.': 3,
    'abril': 4,
    'abr': 4,
    'abr.': 4,
    'mayo': 5,
    'may': 5,
    'may.': 5,
    'junio': 6,
    'jun': 6,
    'jun.': 6,
    'julio': 7,
    'jul': 7,
    'jul.': 7,
    'agosto': 8,
    'ago': 8,
    'ago.': 8,
    'septiembre': 9,
    'sep': 9,
    'sept': 9,
    'sep.': 9,
    'sept.': 9,
    'octubre': 10,
    'oct': 10,
    'oct.': 10,
    'noviembre': 11,
    'nov': 11,
    'nov.': 11,
    'diciembre': 12,
    'dic': 12,
    'dic.': 12,
};

const unitPatterns: UnitRegexMap = {
    day: /d[ií]a/,
    hour: /hora/,
    minute: /minuto/,
    week: /semana/,
    month: /mes/,
    year: /año/
};

export const matchUnit = (text: string): UnitOfTime | undefined => (Object.keys(unitPatterns) as UnitOfTime[]).find(
    (unit: UnitOfTime): boolean => unitPatterns[unit]!.test(text)
);

const AD_REGEX: RegExp = /a\.?\s*c\.?/i;

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

const HALF_REGEX: RegExp = /medi/;

export const matchNumber = (text: string): number => {
    const num: number = parseInt(text, 10);
    if (isNaN(num)) {
        if (text.match(HALF_REGEX)) {
            return 0.5;
        } else {
            return 1;
        }
    }

    return num
};