import React from "react";
import { toast } from "react-toastify";

import { Icon } from "~/components/assets";

export function showPageNavigationToast(pageName: string) {
  toast(
    <div className="flex items-center gap-3">
      <Icon id="arrow-right" width={24} height={24} />
      <div>
        <h6 className="text-lg font-semibold">New Page</h6>
        <p className="text-sm text-osmoverse-200">You are now on: {pageName}</p>
      </div>
    </div>,
    {
      position: "bottom-right",
      autoClose: 3000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: false,
      className: "bg-osmoverse-700",
    }
  );
}
