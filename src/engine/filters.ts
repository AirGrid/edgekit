import { dotProduct, cosineSimilarity as cosSimilarity } from '../utils';
import {VectorQueryValue} from "../../types";

const arrayIntersects = <T extends string>(
    queryFeatures: T[],
    queryValue: string[]
): boolean =>
    queryFeatures.some((feature) => queryValue.indexOf(feature) !== -1);

const vectorDistance = <T extends number>(
    queryFeatures: T[],
    queryValue: VectorQueryValue
): boolean =>
    queryFeatures.length === queryValue.vector.length
        ? dotProduct(queryFeatures, queryValue.vector) > queryValue.threshold
        : false;

const cosineSimilarity = <T extends number>(
    queryFeatures: T[],
    queryValue: VectorQueryValue
): boolean =>
    queryFeatures.length === queryValue.vector.length
        ? cosSimilarity(queryFeatures, queryValue.vector) > queryValue.threshold
        : false;

export default  {
    arrayIntersects,
    cosineSimilarity,
    vectorDistance
} as { [key: string]: <T>(queryFeatures: T[], queryValue: string[] | VectorQueryValue) => boolean};
