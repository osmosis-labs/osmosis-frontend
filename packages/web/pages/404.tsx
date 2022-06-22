import Image from "next/image";
import { NextPage } from "next";

const Custom404: NextPage = () => (
  <div className="bg-background flex gap-3 justify-center items-center h-screen">
    <Image src="/icons/warning.svg" alt="not found" height={25} width={25} />
    <h6>Not found</h6>
  </div>
);

export default Custom404;
