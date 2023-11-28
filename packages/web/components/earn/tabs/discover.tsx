import { StrategiesTable } from "~/components/earn/tabs/table";
import { TopFilters } from "~/components/earn/tabs/top-filters";

export const Discover = () => {
  return (
    <div className="flex flex-col">
      <TopFilters />
      <StrategiesTable />
    </div>
  );
};
