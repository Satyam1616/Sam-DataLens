// Universal Interface for Database Connectors
export interface DataConnector {
  /**
   * Initializes the connection to the data warehouse
   */
  connect(): Promise<void>;

  /**
   * Executes a validated SQL string against the connected data source
   */
  runQuery(sql: string): Promise<any>;

  /**
   * Retrieves the schema metadata from the connected database
   * (Used to generate the Semantic Metadata Layer)
   */
  getSchema(): Promise<any>;
}
