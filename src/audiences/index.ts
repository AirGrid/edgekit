// import interestTravel from './interest/travel';
// import interestSport from './interest/sport';
import sportKeywords from './interest/sport/keywords';
import travelKeywords from './interest/travel/keywords';

const TTL_IN_SECS = 100;
const LOOKBACK_IN_SECS = 100;
const OCCURRENCES = 3;

export const sportInterestAudience = {
  id: 209,
  name: 'Interest | Sport',
  ttl: TTL_IN_SECS,
  lookback: LOOKBACK_IN_SECS,
  occurrences: OCCURRENCES,
  keywords: sportKeywords,
};

export const travelInterestAudience = {
  id: 210,
  name: 'Interest | Travel',
  ttl: TTL_IN_SECS,
  lookback: LOOKBACK_IN_SECS,
  occurrences: OCCURRENCES,
  keywords: travelKeywords,
};

export const allAudienceDefinitions = [
  sportInterestAudience,
  travelInterestAudience,
];

// export default [interestTravel, interestSport];
