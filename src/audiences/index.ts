import { AudienceDefinition } from 'types';
import sportKeywords from './interest/sport/keywords';
import travelKeywords from './interest/travel/keywords';

const TTL_IN_SECS = 100;
const LOOKBACK_IN_SECS = 100;
const OCCURRENCES = 2;

export const sportInterestAudience: AudienceDefinition = {
  id: 'iab-209',
  name: 'Interest | Sport',
  ttl: TTL_IN_SECS,
  lookback: LOOKBACK_IN_SECS,
  occurrences: OCCURRENCES,
  keywords: sportKeywords,
};

export const travelInterestAudience: AudienceDefinition = {
  id: 'iab-210',
  name: 'Interest | Travel',
  ttl: TTL_IN_SECS,
  lookback: LOOKBACK_IN_SECS,
  occurrences: OCCURRENCES,
  keywords: travelKeywords,
};

export const allAudienceDefinitions: AudienceDefinition[] = [
  sportInterestAudience,
  travelInterestAudience,
];
