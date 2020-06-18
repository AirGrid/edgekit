# EdgeKit | `edkt();`

> EdgeKit allows web publishers to create privacy focused, 1st party data audience segments to monetise through online advertising.

## Features:
> (this needs some sections....)

- Packaged with a taxonomy of [IAB Data Transparency Framework](https://iabtechlab.com/standards/data-transparency/) audiences.
- Does not use or set cookies, so compatible with all browsers.
- Privacy focused, all personal data remains on device.
- Does not require a server, runs directly on the client.
- Integrates with header bidders such as [Prebid.js](http://prebid.org/).
- Free & open source.
- Only x kb gzipped & minified.
- Built with TypeScript.

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)

## Usage:

### Install

First we install EdgeKit into our project.
```shell
$ npm i -S @AirGrid/EdgeKit
```

We can now import the API into our script.
```javascript
import edkt from '@AirGrid/EdgeKit';
```

Alternatively to get started quickly, we can use unpkg to load the `edkt` object into the `window`.
```html
<Todo>
```

### Page Features

The EdgeKit library allows for the fetching and storage of arbitrary page features, which will become available in the audience evaluation step.

A simple example would be to collect the keywords often present in the meta tags of webpages, which aim to describe their content. Therefore given the following `HTML` markup:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <meta name="keywords" content="sport,news,football,stadium">
    <title>Article about sports, news and football!</title>
  </head>
  <body>
    Lots of juicy content!
  </body>
</html>
```

We can define a `pageFeatureGetter` to collect these tags, and allow EdgeKit to process and store them for model evaluation. We define this as an object with a `name` and `func` key, which must resolve a `Promise` of values which are our page features!

```javascript
const getPageKeywords = {
  name: 'pageKeywords',
  func: () => {
    const tag = document.head.querySelector('meta[name="keywords"]');
    const keywordString = tag.getAttribute('content');
    const keywords = keywordString.toLowerCase().split(',');
    return Promise.resolve(keywords);
  }
}
```

### Init

Now we can initialise and run the library passing in `pageFeatureGetters`, which will:
1. Collect and store all the features which correspond to this page view event (current page).
2. Evaluate all the audience model definitions, to see if the user can be added into any new `elegibleAudiences`.
3. Pass this information to Prebid, for any subsequent ad calls on the same page.

```javascript
edkt.init({
  pageFeatureGetters: pageFeatureGetters
});
```

### Prebid
> this makes sense to be last in the readme, but it must occur first in the actual page code.

Now we can use EdgeKit to grab and pass audience IDs, from the device into Prebid for downstream targeting. This must happen early in the execution of the page before Prebid makes bid requests to adapters.

```javascript
const edktAudienceIds = edkt.getElegibleAudienceIds();

let pbjs = pbjs || {};
pbjs.que = pbjs.que || [];
pbjs.que.push(() => {
  pbjs.setBidderConfig({
    bidders: ['appnexus'],
    config: {
      fpd: {
        user: {
          data: {
            user: edktAudienceIds,
          }
        }
      }
    }
  });
});
```

## Development Setup

> Todo

```
$ git clone https://github.com/{UPDATEME}
$ cd {UPDATEME}
$ npm i
$ lerna bootstrap
$ tsc -b packages
```
