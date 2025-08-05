import { Button } from "@/components/ui/Button";
import Link from "next/link";
import React from "react";

const ConfirmationStep = () => {
  return (
    <div className="flex flex-col gap-6 justify-center items-center">
      <h1 className="text-3xl text-gray-900 line-clamp-2 font-semibold text-center">
        Your request has been registered!
      </h1>
      <p className="text-base font-medium text-gray-900 max-w-2xl text-center">
        Your return/refund request for Steadfast Padi has been received.{" "}
        {"We'll"}
        notify you via email and SMS as soon as {"there's"} an update.
      </p>
      <p className="text-base text-gray-900 font-medium">
        Request ID: <span className="font-normal">RRF-0007</span>
      </p>

      <p className="text-base text-gray-900 font-medium">
        Current Status: <span className="font-normal">Rending Review</span>
      </p>

      <Link href={"/profile/order-history"}>
        <Button className="py-2 px-6" style={{ borderRadius: "120px" }}>
          View My Returns
        </Button>
      </Link>
    </div>
  );
};

export default ConfirmationStep;
