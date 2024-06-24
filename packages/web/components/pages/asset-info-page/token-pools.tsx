interface TokenPoolsProps {
  denom: string;
}

export const TokenPools = (props: TokenPoolsProps) => {
  const { denom } = props;

  return (
    <section>
      <h5 className="mb-6">Pools</h5>
    </section>
  );
};
