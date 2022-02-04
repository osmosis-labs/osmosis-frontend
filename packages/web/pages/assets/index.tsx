import type { NextPage } from "next";
import { useFilteredData } from "../../hooks/data";

type Fruit = {
  name: string;
  attributes: { color: string; shape: string; size: number };
};

const Assets: NextPage = () => {
  const data: Fruit[] = [
    {
      name: "Orange",
      attributes: {
        color: "orange",
        shape: "round",
        size: 42,
      },
    },
    {
      name: "Pineapple",
      attributes: {
        color: "orange",
        shape: "oval",
        size: 44,
      },
    },
    {
      name: "Kiwi",
      attributes: {
        color: "green",
        shape: "round",
        size: 999,
      },
    },
  ];

  const [query, setQuery, filteredData] = useFilteredData(data, [
    "name",
    "attributes.color",
    "attributes.shape",
    "attributes.size",
  ]);

  return (
    <main className="min-w-container flex flex-col place-content-evenly text-black">
      <input
        className="border border-black p-2"
        type="text"
        placeholder="Search"
        value={query}
        onInput={(e: any) => setQuery(e.target.value)}
      />
      <ol>
        {filteredData.map((data, i) => {
          const { color, shape, size } = data.attributes;
          return (
            <li className="flex flex-col" key={i}>
              {data.name}
              <span className="pl-10">Color: {color}</span>
              <span className="pl-10">Shape: {shape}</span>
              <span className="pl-10">Size: {size}</span>
            </li>
          );
        })}
      </ol>
    </main>
  );
};
export default Assets;
