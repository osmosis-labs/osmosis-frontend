import type { NextPage } from "next";
import { useMemo } from "react";
import { useFilteredData } from "../../hooks/data";
import { useSortedData } from "../../hooks/data/use-sorted-data";
import { useState } from "react";
import { Table, BaseCell, ColumnDef, RowDef } from "../../components/table";
import { PoolCompositionCell } from "../../components/table/cells";
import { SortDirection } from "../../components/types";
import {
  Switch,
  CheckBox,
  Radio,
  Toggle,
  MenuToggle,
  Slider,
  PageList,
  SortMenu,
} from "../../components/control";
import { InputBox, SearchBox } from "../../components/input";
import { Button, IconButton } from "../../components/buttons";
import { Error, Info } from "../../components/alert";

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
  const [isChecked, setChecked] = useState(true);
  const [disabled, setDisabled] = useState(false);

  const [query, setQuery, filteredData] = useFilteredData(data, [
    "name",
    "attributes.color",
    "attributes.shape",
    "attributes.size",
  ]);

  const [path, setPath, sortedData] = useSortedData(data);
  const [r, setR] = useState<"xs" | "sm" | "lg">("sm");
  const [t, setType] = useState<"block" | "arrow" | "outline">("block");
  const [c, setC] = useState<"primary" | "secondary">("primary");
  const [s, setS] = useState(50);
  const [p, setP] = useState(50);

  const [iV, setIV] = useState("");

  const [sortDirection, setSortDirection] = useState<SortDirection | undefined>(
    undefined
  );

  const tableCols: ColumnDef<BaseCell & PoolCompositionCell>[] = [
    {},
    {
      header: "Pool Name",
      sort: {
        currentDirection: sortDirection,
        onClickHeader: () =>
          setSortDirection(
            sortDirection === "ascending" ? "descending" : "ascending"
          ),
      },
      displayCell: PoolCompositionCell,
    },
    {
      header: "Liquidity",
      infoTooltip: "This is liquidity",
      sort: {
        currentDirection: sortDirection,
        onClickHeader: () =>
          setSortDirection(
            sortDirection === "ascending" ? "descending" : "ascending"
          ),
      },
    },
    {
      header: "APR (Annualized)",
    },
    {
      header: "My Liquidity",
    },
  ];

  const baseRow: RowDef = {
    makeHoverClass: () => "text-secondary-200",
  };

  const tableRows: RowDef[] = [
    { ...baseRow, onClick: (i) => console.log(i) },
    { ...baseRow, onClick: (i) => console.log(i) },
    { ...baseRow, onClick: (i) => console.log(i) },
    { ...baseRow, onClick: (i) => console.log(i) },
    { ...baseRow, onClick: (i) => console.log(i) },
    { ...baseRow, onClick: (i) => console.log(i) },
  ];

  const tableData: Partial<BaseCell & PoolCompositionCell>[][] = [
    [
      { value: "A" },
      { value: "A", poolId: 1, tokenDenoms: ["ATOM", "OSMO"] },
      { value: "asf" },
      { value: "fff" },
      { value: "fjd" },
    ],
    [
      { value: "A" },
      { value: "A", poolId: 2, tokenDenoms: ["ATOM", "OSMO"] },
      { value: "asf" },
      { value: "fff" },
      { value: "fjd" },
    ],
    [
      { value: "A" },
      { value: "A", poolId: 3, tokenDenoms: ["ATOM", "OSMO"] },
      { value: "asf" },
      { value: "fff" },
      { value: "fjd" },
    ],
    [
      { value: "A" },
      { value: "A", poolId: 4, tokenDenoms: ["ATOM", "OSMO"] },
      { value: "asf" },
      { value: "fff" },
      { value: "fjd" },
    ],
    [
      { value: "A" },
      { value: "A", poolId: 5, tokenDenoms: ["ATOM", "OSMO"] },
      { value: "asf" },
      { value: "fff" },
      { value: "fjd" },
    ],
    [
      { value: "A" },
      { value: "A", poolId: 6, tokenDenoms: ["ATOM", "OSMO"] },
      { value: "asf" },
      { value: "fff" },
      { value: "fjd" },
    ],
  ];

  return (
    <main className="max-w-container mx-auto">
      <div className="bg-background py-20 flex flex-col justify-center items-center">
        <span className="p-5">Switch:</span>
        <Switch isOn={isChecked} onToggle={setChecked} disabled={disabled} />
        <span className="p-5">Disable:</span>
        <Switch isOn={disabled} onToggle={setDisabled} />
      </div>
      <div className="bg-background py-20 flex justify-center items-center">
        <span className="p-5">Button:</span>
        <Button
          size={r}
          type={t}
          color={c}
          onClick={() => console.log("click")}
          disabled={disabled}
          loading={isChecked}
        >
          <div>Hello</div>
        </Button>
      </div>
      <div className="bg-background py-20 flex justify-center items-center">
        <span className="p-5">Radios:</span>
        <div className="flex">
          Xs
          <Radio
            value="xs"
            onSelectRadio={(v) => setR(assign(v) ?? "sm")}
            groupValue={r}
            disabled={disabled}
          />
          Sm
          <Radio
            value="sm"
            onSelectRadio={(v) => setR(assign(v) ?? "sm")}
            groupValue={r}
            disabled={disabled}
          />
          Lg
          <Radio
            value="lg"
            onSelectRadio={(v) => setR(assign(v) ?? "sm")}
            groupValue={r}
            disabled={disabled}
          />
        </div>
        <div className="flex">
          Block
          <Radio
            value="block"
            onSelectRadio={(v) => setType(assignType(v) ?? "block")}
            groupValue={t}
            disabled={disabled}
          />
          Arrow
          <Radio
            value="arrow"
            onSelectRadio={(v) => setType(assignType(v) ?? "arrow")}
            groupValue={t}
            disabled={disabled}
          />
          Outline
          <Radio
            value="outline"
            onSelectRadio={(v) => setType(assignType(v) ?? "outline")}
            groupValue={t}
            disabled={disabled}
          />
        </div>
        <div className="flex">
          Primary
          <Radio
            value="primary"
            onSelectRadio={(v) => setC(assignC(v) ?? "primary")}
            groupValue={c}
            disabled={disabled}
          />
          Secondary
          <Radio
            value="secondary"
            onSelectRadio={(v) => setC(assignC(v) ?? "secondary")}
            groupValue={c}
            disabled={disabled}
          />
        </div>
      </div>
      <div className="bg-background py-20 flex justify-center items-center">
        <span className="p-5">Toggle:</span>
        <Toggle onToggle={setChecked} isOn={isChecked} disabled={disabled}>
          test
        </Toggle>
      </div>
      <div className="bg-background py-20 flex justify-center items-center">
        <span className="p-5">Checkbox:</span>
        <CheckBox onToggle={setChecked} isOn={isChecked} disabled={disabled} />
      </div>
      <div className="bg-background py-20 flex justify-center items-center">
        <span className="p-5">Icon button:</span>
        <IconButton onClick={() => console.log("click")} />
      </div>
      <div className="bg-background py-20 flex justify-center items-center">
        <span className="p-5">Menu toggle:</span>
        <MenuToggle
          options={[
            { id: "xs", display: "Extra small" },
            { id: "sm", display: "Small" },
          ]}
          selectedOptionId={r}
          onSelect={(v) => setR(assign(v) ?? "sm")}
        />
      </div>
      <div className="flex flex-col bg-background py-20 justify-center items-center w-full">
        <span className="p-5">Slider:</span>
        <Slider
          type="tooltip"
          currentValue={s}
          onInput={(v) => setS(v)}
          min={0}
          max={100}
          disabled={disabled}
        />
        <span className="m-10">{s}</span>
      </div>
      <div className="flex flex-col bg-surface py-8 justify-center items-center">
        <span className="p-5">Table:</span>
        <Table<BaseCell & PoolCompositionCell>
          columnDefs={tableCols}
          rowDefs={tableRows}
          data={tableData}
        />
      </div>
      <div className="flex flex-col bg-background py-8 justify-center items-center">
        <span className="p-5">Page list:</span>
        <PageList
          currentValue={p}
          onInput={(v) => setP(v)}
          min={0}
          max={100}
          editField
        />
      </div>
      <div className="flex flex-col bg-background py-8 justify-center items-center">
        <span className="p-5">Sort menu:</span>
        <SortMenu
          options={[
            { id: "a", display: "Apple" },
            { id: "b", display: "Babelasdfasdfasdfasdf" },
            { id: "c", display: "Bear" },
          ]}
          selectedOptionId={iV}
          onSelect={setIV}
          disabled={disabled}
        />
      </div>
      <div className="flex flex-col bg-background py-8 justify-center items-center">
        <span className="p-5">Alerts:</span>
        <Error message="Ratio doesn't match, total amount should be 100%." />
        <Info
          message="Pool Creation Fee"
          caption="Transferred to the Osmosis community pool"
          data="100 OSMO"
        />
      </div>
      <div className="flex flex-col bg-surface py-8 justify-center items-center">
        <span className="p-5">Input box:</span>
        <InputBox
          currentValue={iV}
          placeholder={"50"}
          onInput={setIV}
          labelButtons={[
            { label: "MAX", onClick: () => setIV("MAX!") },
            // { label: "HALF", onClick: () => console.log("label button 2") },
          ]}
          disabled={disabled}
          clearButton
        />
      </div>
      <div className="flex flex-col bg-background py-8 justify-center items-center">
        <span className="p-5">Search box:</span>
        <SearchBox
          currentValue={iV}
          placeholder="Filter by symbol"
          onInput={setIV}
          disabled={disabled}
        />
      </div>
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

function assign(val: string) {
  if (val === "xs" || val === "sm" || val === "lg") {
    return val;
  }
  return undefined;
}
function assignType(val: string) {
  if (val === "block" || val === "arrow" || val === "outline") {
    return val;
  }
  return undefined;
}
function assignC(val: string) {
  if (val === "primary" || val === "secondary") {
    return val;
  }
  return undefined;
}

export default Assets;
