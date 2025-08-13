## Resources

- [LICENSE](LICENSE)

## Links

- [Strapi website](https://strapi.io/)
- [Strapi documentation](https://docs.strapi.io)

## Installation

```bash
# using yarn
yarn add strapi-provider-meilisearch

# using npm
npm install strapi-provider-meilisearch --save
```

## Configuration

| Variable                  | Type                    | Description                                                         | Required | Default |
|---------------------------| ----------------------- |---------------------------------------------------------------------|--------| ------- |
| provider                  | string                  | The name of the provider you use                                    | yes    |         |
| providerOptions           | object                  | Provider options                                                    | yes    |         |
| providerOptions.apiKey    | object                  | Please refer to [openai](https://www.npmjs.com/package/meilisearch) | yes    |         |
| providerOptions.host      | object                  | Please refer to [openai](https://www.npmjs.com/package/meilisearch) | yes    |         |
| providerOptions.indexName | object                  | Name of the index.                                                  | yes    |         |


### Example

**Path -** `config/plugins.js`

```js
module.exports = ({ env }) => ({
  // ...
    "search-engine": {
        enabled: true,
        config: {
            provider: 'meilisearch',
            providerOptions: {
                apiKey: env('OPENAI_TOKEN'),
            },
        },
    },
  // ...
});
```
