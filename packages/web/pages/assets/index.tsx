import type { NextPage } from "next";
import { useMemo } from "react";
import { useFilteredData } from "../../hooks/data";
import { useSortedData } from "../../hooks/data/use-sorted-data";

type Fruit = {
  name: string;
  attributes: { color: string; shape: string; size: number };
};

const Assets: NextPage = () => {
  const data = useMemo<Fruit[]>(
    () => [
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
    ],
    []
  );

  const [query, setQuery, filteredData] = useFilteredData(data, [
    "name",
    "attributes.color",
    "attributes.shape",
    "attributes.size",
  ]);

  const [path, setPath, sortedData] = useSortedData(data);

  return (
    <main className="min-w-container flex flex-col place-content-evenly text-black">
      <section>
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
      </section>
      <section className="pt-10">
        <input
          className="border border-black p-2"
          type="text"
          placeholder="Sort i.e. 'attributes.size'"
          value={path}
          onInput={(e: any) => setPath(e.target.value)}
        />
        <ol>
          {sortedData.map((data, i) => {
            const { color, shape, size } = data.attributes;
            return (
              <li className="flex flex-col" key={i}>
                name: {data.name}
                <span className="pl-10">attributes.color: {color}</span>
                <span className="pl-10">attributes.shape: {shape}</span>
                <span className="pl-10">attributes.size: {size}</span>
              </li>
            );
          })}
        </ol>
      </section>
    </main>
  );
};
export default Assets;
