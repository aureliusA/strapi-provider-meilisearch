export interface Options {
  apiKey: string;
  host: string;
  indexName: string;
}
export interface PluginSearchParams {
  query: string;
  limit?: number;
  filter: Array<string>;
}

export interface IndexRecordData extends Record<string, string> {
  documentId: string;
  contentType: string;
}

export interface MeilisearchSettings {
  searchableFields: Array<string>;
  filterableFields: Array<string>;
}
