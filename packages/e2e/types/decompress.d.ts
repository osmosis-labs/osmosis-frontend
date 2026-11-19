/** The maintained fork does not publish declarations for its extraction API. */
declare module "@xhmikosr/decompress" {
  export default function decompress(
    input: string | Buffer,
    output: string
  ): Promise<unknown[]>;
}
