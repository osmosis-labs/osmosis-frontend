import type { NextPage } from "next";
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

const Assets: NextPage = function () {
  const [isChecked, setChecked] = useState(true);
  const [disabled, setDisabled] = useState(false);

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
