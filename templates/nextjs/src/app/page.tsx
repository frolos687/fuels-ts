"use client";

import type { TestContractAbi } from "@/sway-api";
import { TestContractAbi__factory } from "@/sway-api";
import contractIds from "@/sway-api/contract-ids.json";
import { FuelLogo } from "@/components/FuelLogo";
import { bn } from "fuels";
import { useState } from "react";
import { Link } from "@/components/Link";
import { Button } from "@/components/Button";
import toast from "react-hot-toast";
import { useActiveWallet } from "@/hooks/useActiveWallet";
import useAsync from "react-use/lib/useAsync";
import { CURRENT_ENVIRONMENT, DOCS_URL, Environments } from "@/lib";

const contractId =
  CURRENT_ENVIRONMENT === Environments.LOCAL
    ? contractIds.testContract
    : (process.env.NEXT_PUBLIC_TESTNET_CONTRACT_ID as string); // Testnet Contract ID

export default function Home() {
  const { wallet, walletBalance, refreshWalletBalance } = useActiveWallet();
  const [contract, setContract] = useState<TestContractAbi>();
  const [counter, setCounter] = useState<number>();

  /**
   * useAsync is a wrapper around useEffect that allows us to run asynchronous code
   * See: https://github.com/streamich/react-use/blob/master/docs/useAsync.md
   */
  useAsync(async () => {
    if (wallet) {
      const testContract = TestContractAbi__factory.connect(contractId, wallet);
      setContract(testContract);
      const { value } = await testContract.functions.get_count().get();
      setCounter(value.toNumber());
    }
  }, [wallet]);

  // eslint-disable-next-line consistent-return
  const onIncrementPressed = async () => {
    if (!contract) {
      return toast.error("Contract not loaded");
    }

    if (walletBalance?.eq(0)) {
      return toast.error(
        "Your wallet does not have enough funds. Please click the 'Top-up Wallet' button in the top right corner, or use the local faucet.",
      );
    }

    const { waitForResult } = await contract.functions
      .increment_counter(bn(1))
      .call();

    const { value } = await waitForResult();

    setCounter(value.toNumber());

    await refreshWalletBalance?.();
  };

  return (
    <>
      <div className="flex gap-4 items-center">
        <FuelLogo />
        <h1 className="text-2xl font-semibold ali">Welcome to Fuel</h1>
      </div>

      <span className="text-gray-400">
        Get started by editing <i>sway-programs/contract/main.sw</i> or{" "}
        <i>src/pages/index.tsx</i>.
      </span>

      <span className="text-gray-400">
        This template uses the new{" "}
        <Link href={`${DOCS_URL}/docs/fuels-ts/fuels/#fuels-cli`}>
          Fuels CLI
        </Link>{" "}
        to enable type-safe hot-reloading for your Sway programs.
      </span>

      <>
        <h3 className="text-xl font-semibold">Counter</h3>

        <span data-testid="counter" className="text-gray-400 text-6xl">
          {counter}
        </span>

        <Button onClick={onIncrementPressed} className="mt-6">
          Increment Counter
        </Button>
      </>

      <Link href="/predicate" className="mt-4">
        Predicate Example
      </Link>

      <Link href="/script" className="mt-4">
        Script Example
      </Link>
      <Link href={DOCS_URL} target="_blank" className="mt-12">
        Fuel Docs
      </Link>
    </>
  );
}
