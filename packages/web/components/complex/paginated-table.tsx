import { flexRender, Row, Table } from "@tanstack/react-table";
import Image from "next/image";
import { useRef } from "react";
import { IS_FRONTIER } from "../../config";
import { Pool } from "./all-pools-table-set";
import { useVirtualizer } from "@tanstack/react-virtual";

type Props = {
  paginate: () => void;
  table: Table<Pool>;
};

const PaginatedTable = ({ table }: Props) => {
  const parentRef = useRef<HTMLDivElement | null>(null);

  const { rows } = table.getRowModel();
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
    overscan: 5,
  });

  // return (
  //   <div
  //     ref={parentRef}
  //     style={{
  //       height: "400px",
  //     }}
  //     className="my-5 w-full overflow-auto"
  //   >
  //     <table className="w-full">
  //       <thead>
  //         {table.getHeaderGroups().map((headerGroup) => (
  //           <tr key={headerGroup.id}>
  //             {headerGroup.headers.map((header) => (
  //               <th
  //                 key={header.id}
  //                 colSpan={header.colSpan}
  //                 style={{ width: header.getSize() }}
  //               >
  //                 <div
  //                   {...{
  //                     className: header.column.getCanSort()
  //                       ? "cursor-pointer select-none"
  //                       : "",
  //                     onClick: header.column.getToggleSortingHandler(),
  //                   }}
  //                 >
  //                   {flexRender(
  //                     header.column.columnDef.header,
  //                     header.getContext()
  //                   )}
  //                   {{
  //                     asc: (
  //                       <Image
  //                         alt="ascending"
  //                         src={
  //                           IS_FRONTIER
  //                             ? "/icons/sort-up-white.svg"
  //                             : "/icons/sort-up.svg"
  //                         }
  //                         height={16}
  //                         width={16}
  //                       />
  //                     ),
  //                     desc: (
  //                       <Image
  //                         alt="descending"
  //                         src={
  //                           IS_FRONTIER
  //                             ? "/icons/sort-down-white.svg"
  //                             : "/icons/sort-down.svg"
  //                         }
  //                         height={16}
  //                         width={16}
  //                       />
  //                     ),
  //                   }[header.column.getIsSorted() as string] ?? null}
  //                 </div>
  //               </th>
  //             ))}
  //           </tr>
  //         ))}
  //       </thead>
  //       <tbody>
  // {rowVirtualizer.getVirtualItems().map((virtualRow) => {
  //   const row = rows[virtualRow.index] as Row<Pool>;
  //   return (
  //     <tr key={row.id}>
  //       {row.getVisibleCells().map((cell) => {
  //         return (
  //           <td key={cell.id}>
  //             {flexRender(
  //               cell.column.columnDef.cell,
  //               cell.getContext()
  //             )}
  //           </td>
  //         );
  //       })}
  //     </tr>
  //   );
  // })}
  //       </tbody>
  //     </table>
  //   </div>
  // );
  return (
    <>
      <div
        ref={parentRef}
        style={{
          height: `200px`,
          width: "100%",
          overflow: "auto",
        }}
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      colSpan={header.colSpan}
                      style={{ width: header.getSize() }}
                    >
                      <div
                        {...{
                          className: header.column.getCanSort()
                            ? "cursor-pointer select-none"
                            : "",
                          onClick: header.column.getToggleSortingHandler(),
                        }}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: (
                            <Image
                              alt="ascending"
                              src={
                                IS_FRONTIER
                                  ? "/icons/sort-up-white.svg"
                                  : "/icons/sort-up.svg"
                              }
                              height={16}
                              width={16}
                            />
                          ),
                          desc: (
                            <Image
                              alt="descending"
                              src={
                                IS_FRONTIER
                                  ? "/icons/sort-down-white.svg"
                                  : "/icons/sort-down.svg"
                              }
                              height={16}
                              width={16}
                            />
                          ),
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const row = rows[virtualRow.index] as Row<Pool>;
                if (!row) return <></>;
                return (
                  <tr
                    key={row.id}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    {row.getVisibleCells().map((cell) => {
                      return (
                        <td key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
          {/* {rowVirtualizer.getVirtualItems().map((virtualRow) => (
            <div
              key={virtualRow.index}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              Row {virtualRow.index}
            </div>
          ))} */}
        </div>
      </div>
    </>
  );
};

export default PaginatedTable;
