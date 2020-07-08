import { AudienceDefinition } from 'types';
import sportKeywords from './interest/sport/keywords';
import travelKeywords from './interest/travel/keywords';
import automotiveKeywords from './interest/automotive/keywords';

const TTL_IN_SECS = 100;
const LOOK_BACK_IN_SECS = 100;
const OCCURRENCES = 2;
const VERSION = 1;

export const sportInterestAudience: AudienceDefinition = {
  id: 'iab-607',
  name: 'Interest | Sport',
  ttl: TTL_IN_SECS,
  lookBack: LOOK_BACK_IN_SECS,
  occurrences: OCCURRENCES,
  keywords: sportKeywords,
  version: VERSION,
};

export const travelInterestAudience: AudienceDefinition = {
  id: 'iab-719',
  name: 'Interest | Travel',
  ttl: TTL_IN_SECS,
  lookBack: LOOK_BACK_IN_SECS,
  occurrences: OCCURRENCES,
  keywords: travelKeywords,
  version: VERSION,
};

export const automotiveInterestAudience: AudienceDefinition = {
  id: 'iab-243',
  name: 'Interest | Automotive',
  ttl: TTL_IN_SECS,
  lookBack: LOOK_BACK_IN_SECS,
  occurrences: OCCURRENCES,
  keywords: automotiveKeywords,
  version: VERSION,
};

export const allAudienceDefinitions: AudienceDefinition[] = [
  sportInterestAudience,
  travelInterestAudience,
  automotiveInterestAudience,
];
