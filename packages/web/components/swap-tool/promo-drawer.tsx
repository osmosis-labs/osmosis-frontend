import { Transition } from "@headlessui/react";
import { FunctionComponent, ReactNode, useEffect, useState } from "react";

/** Promo drawer for conditionally displaying promotional content above the swap tool.
 *  If there's at least one child that is not null, it will appear. Otherwise, it will not.
 *  Counting on swap tool having >-10 z index. */
export const PromoDrawer: FunctionComponent<{
  show: boolean;
  beforeEnter?: () => void;
  children?: ReactNode;
}> = ({ show: initialShow, children, beforeEnter }) => {
  // re-open the drawer on next mount, instead of keeping it open
  // prevents animation from compounding
  const [show, setShow] = useState(false);
  useEffect(() => {
    setShow(initialShow);
  }, [initialShow]);

  return (
    <Transition
      show={show}
      enter="transition ease-inOutBack duration-500 translate"
      enterFrom="opacity-0 translate-y-full"
      enterTo="opacity-100 translate-y-[25%]"
      leave="transition ease-inOutBack duration-500 translate"
      leaveFrom="opacity-100 translate-y-[25%]"
      leaveTo="opacity-0 translate-y-full"
      beforeEnter={beforeEnter}
    >
      <div
        className="h-fit w-full rounded-t-3xl bg-osmoverse-800/60 p-5 pb-10 text-center"
        role="menu"
        aria-orientation="vertical"
        aria-labelledby="options-menu"
      >
        {children}
      </div>
    </Transition>
  );
};
