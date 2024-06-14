interface QuerySmartContractParams {
  contractAddress: string;
  msg: object;
}

export const getQuerySmartContractPath = (params: QuerySmartContractParams) => {
  const { contractAddress, msg } = params;
  const encodedMsg = Buffer.from(JSON.stringify(msg)).toString("base64");

  return `/cosmwasm/wasm/v1/contract/${contractAddress}/smart/${encodedMsg}`;
};
