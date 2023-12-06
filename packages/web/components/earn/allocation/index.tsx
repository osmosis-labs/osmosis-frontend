const mockTokenRows = [
  {
    image: "",
    name: "ATOM",
    perc: 23.87,
  },
  {
    image: "",
    name: "OSMO",
    perc: 22.87,
  },
  {
    image: "",
    name: "MARS",
    perc: 18.87,
  },
  {
    image: "",
    name: "ETH",
    perc: 13.87,
  },
  {
    image: "",
    name: "ATOM",
    perc: 23.87,
  },
  {
    image: "",
    name: "OSMO",
    perc: 22.87,
  },
  {
    image: "",
    name: "MARS",
    perc: 18.87,
  },
  {
    image: "",
    name: "ETH",
    perc: 13.87,
  },
  {
    image: "",
    name: "ATOM",
    perc: 23.87,
  },
  {
    image: "",
    name: "OSMO",
    perc: 22.87,
  },
  {
    image: "",
    name: "MARS",
    perc: 18.87,
  },
  {
    image: "",
    name: "ETH",
    perc: 13.87,
  },
];

export const EarnAllocation = () => {
  return (
    <div className="flex flex-col gap-7 1.5xl:flex-1">
      <div className="flex items-center gap-3.5">
        <h5 className="text-lg font-semibold leading-normal text-osmoverse-100 1.5xl:hidden">
          Allocation
        </h5>
        <p className="text-sm font-semibold text-wosmongton-300">5 tokens</p>
      </div>
      <div className="relative flex flex-col justify-between gap-12">
        <div className="flex gap-4">
          <button className="text-sm font-semibold text-osmoverse-100">
            Token
          </button>
          <button className="text-sm font-semibold text-osmoverse-100 opacity-50">
            Method
          </button>
          <button className="text-sm font-semibold text-osmoverse-100 opacity-50">
            Platform
          </button>
        </div>
        <div className="flex max-h-48 flex-col gap-4 overflow-scroll after:absolute after:inset-x-0 after:bottom-0 after:top-52 after:bg-gradient-scrollable-allocation-list">
          {mockTokenRows.map(({ name, perc }) => (
            <div
              key={`${name} stat row`}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="h-8 w-8 rounded-full bg-osmoverse-400" />
                <p className="font-subtitle1 text-osmoverse-100">{name}</p>
              </div>
              <div className="flex items-center gap-4">
                <p className="font-semibold text-osmoverse-100">{perc}%</p>
                <div className="h-8 w-8 rounded-full bg-wosmongton-500" />
              </div>
            </div>
          ))}
        </div>
        <small className="absolute bottom-0 inline-flex w-full justify-center self-center text-overline font-subtitle2 font-medium tracking-normal text-osmoverse-300 opacity-50">
          scroll to see more
        </small>
      </div>
    </div>
  );
};
