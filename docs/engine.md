# EdgeKit | Engine

## Usage

This package currently exposes a single method:

```javascript
const result = engine.check(audiences, pageViews);
```

Where `audiences` is an array of audience model definitions, and `pageViews` is the users own internal page view history.
_The final defintions for these are TBD_

The return object will be, once again an array of all the audiences passed, but with added `matched` and `conditionChecks` keys:

```
[
  {
    id: 'abc',
    name: 'Interest | Sports',
    ttl: 100,
    conditions: [ [Object] ],
    conditionChecks: [ false ], // result of each checked condition, not sure if needed...
    matched: false // overall result based on if `any` is passed
  }
]
```


## Local Development

Below is a list of commands you will probably find useful.

### `npx http-server ./dist --cors -c-1`

### `npm start` or `yarn start --name edkt --format umd `

Runs the project in development/watch mode. Your project will be rebuilt upon changes. 

### `npm run build` or `yarn build`

Bundles the package to the `dist` folder.
The package is optimized and bundled with Rollup into multiple formats (CommonJS, UMD, and ES Module).

### `npm test` or `yarn test`

Runs the test watcher (Jest) in an interactive mode.
By default, runs tests related to files changed since the last commit.
