import {MergeDateTimeRefiner} from "../EN/ENMergeDateTimeRefiner";

export default class FRMergeDateTimeRefiner extends MergeDateTimeRefiner {
    TAG: string = 'FRMergeDateTimeRefiner';
    PATTERN: RegExp = new RegExp("^\\s*(T|à|a|vers|de|,|-)?\\s*$");
}