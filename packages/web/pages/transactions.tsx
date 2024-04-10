import { useRouter } from "next/router";
import { useEffect } from "react";

import { useFeatureFlags } from "~/hooks";

const Transactions = () => {
  const { transactionsPage, _isInitialized } = useFeatureFlags();
  const router = useRouter();

  useEffect(() => {
    if (!transactionsPage && _isInitialized) {
      router.push("/");
    }
  }, [transactionsPage, router, _isInitialized]);

  return <div>Transactions Content</div>;
};

export default Transactions;
