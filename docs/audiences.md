# EdgeKit | Audiences

In EdgeKit an audience refers to a group of users you would like to identify based on a list of keywords, the frequency of the user seeing one of the keywords and how long ago or recently they saw it.

## Usage

```typescript
export const exampleAudience: AudienceDefinition = {
  // Unique Identifier
  id: '1234',
  // Name of the Audience
  name: 'Interest | typeOfIntrest',
  // Time To Live - How long after matching the Audience are you part of it
  ttl: TTL_IN_SECS,
  // How long into the past should EdgeKit Look to match you to the audience 
  lookBack: LOOK_BACK_IN_SECS, // set value to 0 to use the users full local data
  // Number of times the pageFeatureGetter must match a keyword to the keywords listed below
  occurrences: OCCURRENCES,
  // The Keywords used to identify the audience
  keywords: listOfKeywords,
  // The version number of the audience for caching
  version: 1
};
```

EdgeKit comes with a range of audiences that you can use as examples or to get started straight away in your application.

To use the the built in audiences you can import them from EdgeKit along with 'edkt'

```typescript
// use all built in audiences
import { edkt, allAudienceDefinitions } from '@airgrid/edgekit';

edkt.run({
  pageFeatureGetters: [...],
  audienceDefinitions: allAudienceDefinitions,
});

// use only the built in sport audience
import { edkt, sportInterestAudience } from '@airgrid/edgekit';

edkt.run({
  pageFeatureGetters: [...],
  audienceDefinitions: [sportInterestAudience],
});

```

## Built in Audiences

the following audiences are built into edkt and can be used in your projects.

```typescript
import { sportInterestAudience,
         travelInterestAudience,
         automotiveInterestAudience } from '@airgrid/edgekit';
```

The following audiences 

* sportInterestAudience
* travelInterestAudience
* automotiveInterestAudience

for a full list of keywords see ```src/audiences/interest/.../keywords.ts```