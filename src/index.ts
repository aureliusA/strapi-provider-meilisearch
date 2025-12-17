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
        const tempIndexUid = `${indexName}_temp_${Date.now()}`;

        await meilisearchClient.createIndex(tempIndexUid, {
          primaryKey: 'documentId',
        });

        const tempIndex = meilisearchClient.index(tempIndexUid);
        const formattedData = data.map((doc) => ({
          ...doc,
          id: doc.documentId,
          contentType: doc.contentType,
        }));
        const settingsTask = await tempIndex.updateSettings({
          searchableAttributes: settings.searchableFields,
          filterableAttributes: settings.filterableFields,
        });
        const docsTask = await tempIndex.addDocuments(formattedData);

        await meilisearchClient.tasks.waitForTask(settingsTask.taskUid);
        await meilisearchClient.tasks.waitForTask(docsTask.taskUid);
        await meilisearchClient.createIndex(indexName, {
          primaryKey: 'documentId',
        });
        await meilisearchClient.swapIndexes([
          { indexes: [indexName, tempIndexUid] },
        ]);
        await meilisearchClient.deleteIndex(tempIndexUid);
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
          data.map((doc) => ({
            ...doc,
            id: doc.documentId,
            contentType: doc.contentType,
          })),
        );
      },
    };
  },
};
