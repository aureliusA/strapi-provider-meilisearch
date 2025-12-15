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
        limit = 5,
        offset = 0,
        filter,
      }: PluginSearchParams) {
        const searchOptions: SearchParams = {
          limit,
          offset,
          filter,
        };

        return await index.search(query, searchOptions);
      },

      async regenerateIndex(
        settings: MeilisearchSettings,
        data: Array<IndexRecordData>,
      ) {
        await this.createTempIndexAndSwap(settings, data);
      },

      async setSettings(
        { searchableFields, filterableFields }: MeilisearchSettings,
        targetIndex = index,
      ) {
        await targetIndex.updateSearchableAttributes(searchableFields);
        await targetIndex.updateFilterableAttributes(filterableFields);
      },

      async fillIndexContentTypeData(
        data: Array<IndexRecordData>,
        targetIndex = index,
      ) {
        await targetIndex.addDocuments(
          data.map((data) => ({
            ...data,
            id: data.documentId,
            contentType: data.contentType,
          })),
        );
      },

      async createTempIndexAndSwap(
        settings: MeilisearchSettings,
        data: Array<IndexRecordData>,
      ) {
        const tempIndexName = `${indexName}_temp_${Date.now()}`;
        const tempIndex = meilisearchClient.index(tempIndexName);

        await tempIndex.update({ primaryKey: 'documentId' });
        await this.setSettings(settings, tempIndex);
        await this.fillIndexContentTypeData(data, tempIndex);

        await meilisearchClient.swapIndexes([
          { indexes: [indexName, tempIndexName] },
        ]);
        await meilisearchClient.deleteIndex(tempIndexName);
      },
    };
  },
};
