import { Meilisearch } from 'meilisearch';
import type { SearchParams } from 'meilisearch';
import {
  IndexRecordData,
  MeilisearchSettings,
  Options,
  PluginSearchParams,
} from './types';

export default {
  init(providerOptions: Options) {
    const { indexName, host, apiKey } = providerOptions;

    if (!indexName || !host || !apiKey)
      throw new Error('"indexName", "host" or "apiKey" is not provided."');

    const meilisearchClient = new Meilisearch({
      host: providerOptions.host,
      apiKey: providerOptions.apiKey,
    });
    const index = meilisearchClient.index(indexName);

    return {
      getIndex() {
        return index;
      },

      async search({
        query,
        limit = 4,
        filter,
      }: PluginSearchParams) {
        const searchOptions: SearchParams = {
          limit: limit,
          filter,
        };

        return await index.search(query, searchOptions);
      },

      async regenerateIndex(settings: MeilisearchSettings, data: Array<IndexRecordData>) {
        await this.setSettings(settings);
        await this.fillIndexContentTypeData(data);
      },

      async setSettings({
        searchableFields,
        filterableFields,
      }: MeilisearchSettings) {
        await index.updateSearchableAttributes(searchableFields);
        await index.updateFilterableAttributes(filterableFields);
      },

      async fillIndexContentTypeData(data: Array<IndexRecordData>) {
        await index.addDocuments(
          data.map((data) => ({
            ...data,
            id: data.documentId,
            contentType: data.contentType,
          })),
        );
      },
    };
  },
};
