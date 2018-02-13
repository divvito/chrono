import {MergeDateTimeRefiner} from "../EN/ENMergeDateTimeRefiner";

export default class DEMergeDateTimeRefiner extends MergeDateTimeRefiner {
    TAG: string = 'DEMergeDateTimeRefiner';
    PATTERN: RegExp = new RegExp("^\\s*(T|um|am|,|-)?\\s*$");
}