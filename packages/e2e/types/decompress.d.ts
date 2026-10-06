/** The maintained fork does not publish declarations for its extraction API. */
declare module "@xhmikosr/decompress" {
  // eslint-disable-next-line import/no-default-export -- Matches the upstream API.
  export default function decompress(
    input: string | Buffer,
    output: string
  ): Promise<unknown[]>;
}
