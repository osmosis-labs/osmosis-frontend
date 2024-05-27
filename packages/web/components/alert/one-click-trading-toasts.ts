import { displayToast } from "~/components/alert/toast";
import { ToastType } from "~/components/alert/types";

export function displayErrorRemovingSessionToast() {
  displayToast(
    {
      titleTranslationKey: "oneClickTrading.toast.errorEndingSession",
      captionTranslationKey: "oneClickTrading.toast.pleaseTryAgain",
    },
    ToastType.ERROR
  );
}
