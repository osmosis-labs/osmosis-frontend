export const DepositScreen = () => {
  return (
    <div className="flex  flex-col items-center justify-center p-4 text-white-full">
      <div className="w-full max-w-md rounded-2xl p-6">
        <h1 className="mb-6 text-center text-2xl font-h1">
          Deposit <span className="text-superfluid">USDC</span>
        </h1>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-sm">From network</span>
            <div className="ml-2 flex items-center rounded-lg bg-osmoverse-700 p-2">
              <img
                src="/path/to/noble-icon.png"
                alt="Noble"
                className="mr-2 h-6 w-6"
              />
              <span>Noble</span>
            </div>
          </div>
          <div className="flex items-center">
            <span className="text-sm">To network</span>
            <div className="ml-2 flex items-center rounded-lg bg-osmoverse-700 p-2">
              <img
                src="/path/to/osmosis-icon.png"
                alt="Osmosis"
                className="mr-2 h-6 w-6"
              />
              <span>Osmosis</span>
            </div>
          </div>
        </div>

        <div className="text-center text-4xl font-bold">$0</div>

        <div className="flex justify-center">
          <div className="text-center text-sm">0 USDC</div>
          <button className="rounded-lg bg-osmoverse-700 py-2 px-4 text-white-full">
            Max
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center rounded-lg bg-osmoverse-700 p-2">
            <span className="mr-2">USDC.e</span>
            <span className="text-sm text-osmoverse-300">$80.00 available</span>
          </div>
          <div className="flex items-center rounded-lg bg-osmoverse-700 p-2">
            <span className="mr-2">USDC</span>
            <span className="text-sm text-osmoverse-300">$30.00</span>
          </div>
          <div className="flex items-center rounded-lg bg-osmoverse-700 p-2">
            <span className="mr-2">USDC.axl</span>
            <span className="text-sm text-osmoverse-300">$10.00</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm">Transfer with</span>
          <div className="flex items-center rounded-lg bg-osmoverse-700 p-2">
            <img
              src="/path/to/keplr-icon.png"
              alt="Keplr"
              className="mr-2 h-6 w-6"
            />
            <span>Keplr</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm">Estimating time</span>
          <span className="text-sm">Calculating fees</span>
        </div>

        <button className="w-full rounded-lg bg-superfluid py-2 px-4 text-white-full">
          Review deposit
        </button>

        <div className="mt-4 text-center">
          <a href="#" className="text-sm text-superfluid">
            More deposit options
          </a>
        </div>
      </div>
    </div>
  );
};
