export type MigrationRecords = {
  migration_records: {
    balancer_to_concentrated_pool_links: {
      balancer_pool_id: string;
      cl_pool_id: string;
    }[];
  };
};
