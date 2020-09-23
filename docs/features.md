# EdgeKit | Page Features

A page feature is a value that describes a pages content. The features can be something concrete
like a list of keywords on a page, or something more abstract like a vector. 

EdgeKit requires `pageFeatureGetters` to be passed into the run method that will allow EdgeKit to
evaluate the page. A page feature getter is an object that has a name and and an async function that
resolves to a value.


## Example

The following is a working example of a `pageFeatureGetter` that gets the meta data keywords from
the head of the HTML:

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

If this `getHtmlKeywords` feature getter is passed to Edgekit with a page that looks like this:

```html
<html>
  <head>
    <meta name="keywords" content="goal,liverpool,football,stadium" />
    ...
  </head>
  <body>
    ...
  </body>
</html>
```

Then Edgekit will store this feature, and any other features that were provided, in local storage as
a _page view_:

```
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

The `name` that was provided in the page feature getter definition is the key where it will be
stored in the features object (in this case `keywords`).

The audience definitions that are passed into Edgekit define whether or not the page views match the
audience. If any of the audiences match then they will also get stored in local storage.  [Learn
more about audiences](./audiences.md)
