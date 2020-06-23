[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg?style=flat-square)](https://lerna.js.org/)

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
- Only 10kb gzip & minified.

## Installation 🚪

Using [npm](https://www.npmjs.com/):

```shell
npm i -S @edgekit/core
```

Using [unpkg](https://unpkg.com/):

```html
<Todo></Todo>
```

## Usage 🤓

### Full Flow

EdgeKit will execute the following high level flow:

1. **Register, run and store user defined `pageFeatureGetters`.**
   In this step the library will fetch `keywords` to describe the current page load, which will be stored locally to create a history of the pages viewed by the user visiting your site.
2. **Run audience definitions against the local page views.**
   The library now checks the users local history to see if they match any of the audience definitions, storing any matched audiences.
3. **Make matched audiences available to bidding.**
   The final step is to pass the newly defined audience signals to third party bidders, for example via Prebid.

#### Page Features

#### Audience Evaluation

#### Bidding Integration

## Developer Setup 💻

> Full developer documentation coming soon!

```
$ git clone https://github.com/AirGrid/edgekit.git
$ cd edgekit
$ npm i
$ lerna bootstrap
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
