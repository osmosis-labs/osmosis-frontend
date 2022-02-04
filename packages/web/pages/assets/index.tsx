import type { NextPage } from "next";
import { Overview } from "../../components/overview";

const Assets: NextPage = () => (
  <main>
    <Overview
      title="My Osmosis Assets"
      primaryOverviewLabels={[
        {
          label: "Total Assets",
          value: "$12,530.00",
        },
        {
          label: "Available Assets",
          value: "$2,896.00",
        },
        {
          label: "Bonded Assets",
          value: "$9,544.00",
        },
        {
          label: "Staked OSMO",
          value: "$9,544.00",
        },
      ]}
    />
  </main>
);

export default Assets;
