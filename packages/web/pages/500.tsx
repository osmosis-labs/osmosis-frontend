import Image from "next/image";
import { NextPage } from "next";

const Custom500: NextPage = () => (
  <div className="bg-background flex gap-3 justify-center items-center h-screen">
    <Image src="/icons/error-x.svg" alt="not found" height={25} width={25} />
    <h6>Server error</h6>
  </div>
);

export default Custom500;
