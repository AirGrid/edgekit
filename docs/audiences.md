# EdgeKit | Audience Definitions

In EdgeKit an audience refers to a group of users you would like to identify based on a feature, the
frequency of the user seeing the feature and how long ago or recently they saw it.

## Usage

Suppose that Edgekit is run with the page feature getters in the example from the [features
doc](./docs/features.md) and the following audience definition:

```typescript
const TTL_IN_SECS = 60 * 60 * 24;  // 1 day in seconds
const LOOK_BACK_IN_SECS = 60 * 60 * 24 * 7;  // 1 week in seconds
const OCCURRENCES = 2;

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
  // The version number of the audience for caching
  version: 1,
  // The query property to look up, this is the name of the key that will be looked up in the stored page view features object
  queryProperty: 'keywords',
  // The name of the function to use for filtering the page view features
  queryFilterComparisonType: 'arrayIntersects',
  // The value to pass into the function determined by the queryFilterComparisonType along with the page view feature (if it exists)
  queryValue: ['sport', 'football'],
};
```


### What the engine will do


#### 1. Filter the page views

The engine will filter the page views based on the provided `query*` values in the audience definition:

##### Audience Definition `queryProperty`

The `queryProperty` is set to `keywords`, so it will look up the features object on the stored
page views to see if there is a feature with this name.

Since this example will run the feature getter from the [features doc](./docs/features.md), the
page views will look something like:

```js
> JSON.parse(localStorage.getItem('edkt_page_views'))
[
  {
    "ts": 1600858202179,
    "features": {
      "keywords": [
        "goal",
        "liverpool",
        "football",
        "stadium"
      ]
    }
  }
]
```

And since `queryProperty` is set to `'keywords'`, it will look up `features[queryProperty]` on each
page view and in this case return:

```js
['goal', 'liverpool', 'football', 'stadium']
```


##### Audience Definition `queryFilterComparisonType` and `queryValue`

The engine will run the query filter function `arrayIntersects` (the `queryFilterComparisonType`)
on the fetched features and the values provided by `queryValue`.

For this example, the filter will look something like this:

```js
features.arrayIntersects(['goal', 'liverpool', 'football', 'stadium'], ['sport', 'football'])
```

The `arrayIntersects` filter function checks if there is a set intersection. The two sets do
intersect in this case (`['football']`) so there is a match.

#### 2. Check if there are _enough_ filtered page views

In the second step, the engine will check if there are _enough_ of the filtered page views to match
on the audience definition

In this case, the audience definition sets the number of `occurrences` to _2_ and the `lookBack` to
_1 week_, which means that there should be _more than 2_ of these filtered page views _in the past
week_ in order to match on this audience definition.

The `ttl` provided for this defintion says the the match is only good for _1 day_.


## Passing Matched Audiences to a Bidder

The matched audience definitions are stored in local storage under `edkt_matched_audiences`. These
definitions can be sent to a bidder such as Prebid.


## Built in Audiences

EdgeKit comes with a range of audiences that you can use as examples or to get started straight away in your application.

To use the the built in audiences you can import them from EdgeKit along with 'edkt'
the following audiences are built into edkt and can be used in your projects.

```typescript
import { sportInterestAudience,
         travelInterestAudience,
         automotiveInterestAudience } from '@airgrid/edgekit';
```

For example:

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

For a full list of keywords see [```src/audiences/interest/.../keywords.ts```](https://github.com/AirGrid/edgekit/blob/develop/src/audiences/interest/sport/keywords.ts) for each built-in definition.
