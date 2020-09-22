[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![npm (scoped)](https://img.shields.io/npm/v/@airgrid/edgekit?style=flat-square)
![Build, Test and Publish](https://github.com/AirGrid/edgekit/workflows/Build,%20Test%20and%20maybe%20Publish/badge.svg?style=flat-square)

# EdgeKit | `edkt();`

An open source, privacy focused client side library for the creation and monetisation of online audiences.

![EdgeKit Prebid Flow](./docs/images/edgekit-prebid-flow.svg?raw=true)

## What is EdgeKit? 🤔

EdgeKit is an open source library which allows publishers to quickly and easily start to use their own 1st party data to create audience segments for monetisation via programmatic advertising.

As a publisher, you can use EdgeKit to segment your audience, in a privacy focused manner, by keeping all your web visitors personal information on their device. No need for third party tracking or sending personal data to the server.

Audience definitions are collaborative, and allow marketers & publishers to agree upon a taxonomy & definition in which all can trust.

## Why use EdgeKit? 🎖️

EdgeKit allows publishers to:

- Control their 1st party data, reducing the reliance on 3rd parties for tracking & segmentation of their users.
- Respect the privacy of their audience, by keeping their personal information local to their device and easily purgeable.
- Earn increased revenue from online advertising, by decorating bid requests with audience signals.

## Key Features 🔑

- Community driven, free & open source forever.
- Pre-packaged with a taxonomy of IAB Data Transparency Framework audiences.
- Integrates with header bidders, SSPs or ad-servers.
- Cookie-less and 3rd party tracking free.
- Compatible with all modern web browsers.
- No server infrastructure needed.
- Developed with TypeScript.
- No external dependencies.
- Only 1.5kb gzip & minified.

## Installation 🚪

Using [npm](https://www.npmjs.com/):

```shell
npm i -S @airgrid/edgekit
```

Using [unpkg](https://unpkg.com/):

```html
<!--ES module-->
<script
  type="module"
  src="https://unpkg.com/@airgrid/edgekit?module"
  crossorigin
></script>

<!--UMD module-->
<script src="https://unpkg.com/@airgrid/edgekit" crossorigin></script>
```

_Note: using the above URLs will always fetch the latest version, which could contain breaking changes, you should pin a version number as shown in the below example:_

```html
<!--UMD module-->
<script
  src="https://unpkg.com/@airgrid/edgekit@0.0.0-dev.2/dist/edgekit.umd.js"
  crossorigin
></script>
```

## Usage 🤓

### Full Flow

EdgeKit will execute the following high level flow:

1. **Check for GDPR compliance.**
   The IAB has an [API](https://cdn.edkt.io/sdk/edgekit.min.js) to check for GDPR compliance.
   Edgekit provides a simplified wrapper around this API in order to check for compliance. A list of
   vendor ids is passed to the function.

   You can find the list of vendors and their ids that are participating in the Transparency and
   Consent Framework [here](https://iabeurope.eu/vendor-list-tcf-v2-0/).

   Quoting the definition from [IAB policy site](https://cdn.edkt.io/sdk/edgekit.min.js), a vendor
   is:

   > “Vendor” means a company that participates in the delivery of digital advertising within a Publisher’s website, app, or other digital content, to the extent that company is not acting as a Publisher or CMP, and that either accesses an end user’s device or processes personal data about end users visiting the Publisher’s content and adheres to the Policies...

2. **Register, run and store user defined `pageFeatureGetters`.**
   In this step the library will fetch `keywords` to describe the current page load, which will be stored locally to create a history of the pages viewed by the user visiting your site.
3. **Run audience definitions against the local page views.**
   The library now checks the users local history to see if they match any of the audience definitions, storing any matched audiences.
4. **Make matched audiences available to bidding.**
   The final step is to pass the newly defined audience signals to third party bidders, for example via Prebid.

#### Page Features

A page feature is a list of keywords that describe a pages content.

EdgeKit requires pageFeatureGetters to be passed into the run method that will allow EdgeKit to evaluate the page. A pageFeatureGetter is an object that has a name and and an async function that resolves to a keyword list.

```typescript
const examplePageFeatureGetter = {
   name: 'example',
   func: (): Promise<string[]> => { ... }
}
```

The following is a working example of a pageFeatureGetter that gets the meta data keywords from the head of the HTML.

##### HTML

```html
<meta name="keywords" content="goal,liverpool,football,stadium" />
```

##### JS pageFeatureGetter

```typescript
const getHtmlKeywords = {
  name: 'keywords',
  func: (): Promise<string[]> => {
    const tag = <HTMLElement>(
      document.head.querySelector('meta[name="keywords"]')
    );
    const keywordString = tag.getAttribute('content') || '';
    const keywords = keywordString.toLowerCase().split(',');
    return Promise.resolve(keywords);
  },
};
```

##### JS EdgeKit Run

```typescript
import { edkt } from '@airgrid/edgekit';

// If GDPR applies and consent has not been established then this function won't do anything
edkt.run({
  pageFeatureGetters: [getHtmlKeywords],
  audienceDefinitions: ...,
  vendorIds: ..., // vendor ids to check for consent
});
```

Alternatively, pass in a flag to omit the GDPR check if it's not necessary for your use case:

```typescript
edkt.run({
  pageFeatureGetters: [getHtmlKeywords],
  audienceDefinitions: ...,
  omitGdprConsent: true
});
```

#### Audience Evaluation

In EdgeKit an audience refers to a group of users you would like to identify based on a list of keywords, the frequency of the user seeing one of the keywords and how long ago or recently they saw it.

```typescript
export const exampleAudience: AudienceDefinition = {
  // Unique Identifier
  id: '1234',
  // Name of the Audience
  name: 'Interest | typeOfIntrest',
  // Time To Live - How long after matching the Audience are you part of it
  ttl: TTL_IN_SECS,
  // How long into the past should EdgeKit Look to match you to the audience
  lookBack: LOOK_BACK_IN_SECS,
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

#### Bidding Integration

## Developer Setup 💻

> Full developer documentation coming soon!

```
$ git clone https://github.com/AirGrid/edgekit.git
$ cd edgekit
$ npm i
$ npm test
$ npm run build
```

## EdgeKit ❤️ AirGrid

_AirGrid provides a managed layer for your EdgeKit deployments._

![EdgeKit AirGrid](./docs/images/edgekit-airgrid.svg?raw=true)

## Contributing 🎗️

Contributions are always welcome, no matter how large or small. Before contributing, please read the code of conduct.

See Contributing.

## Licence 💮

MIT License | Copyright (c) 2020 AirGrid LTD | [Link](./LICENSE)
