"use client";

import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/Input";
import React, { useState } from "react";

const reasons: string[] = [
  "Wrong item delivered",
  "Item arrived damaged",
  "Item is defective or not working",
  "Incomplete item (missing parts or accessories)",
  "Item does not match description/image",
  "Received extra item I didnʼt order",
  "Size or fit issue",
];

type ReasonStepProps = {
  onClickNext: () => void;
};
const ReasonStep: React.FC<ReasonStepProps> = ({ onClickNext }) => {
  const [commentText, setCommentText] = useState("");
  return (
    <div className="flex flex-col gap-4">
      <p className="font-medium text-lg md:text-xl text-gray-700">
        2. Select the reason for returning
      </p>
      <div className="flex flex-col gap-2">
        {reasons.map((reason, index) => (
          <div key={index} className="flex gap-4">
            <Checkbox
              id="toggle-2"
              defaultChecked
              className="w-6 h-6 data-[state=checked]:border-[#184193] data-[state=checked]:bg-[#184193] data-[state=checked]:text-white dark:data-[state=checked]:border-[#184193] dark:data-[state=checked]:bg-[#184193]"
            />
            <p>{reason}</p>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-6">
        <div>
          <p className="text-base font-medium text-gray-700 mb-1">
            Comments (Optional)
          </p>
          <Input
            type="text"
            value={commentText}
            placeholder="Please provide any additional details"
            onChange={(e) => setCommentText(e.target.value)}
            className="p-2"
          />
        </div>
        <div>
          <p className="text-base font-medium text-gray-700 mb-2">
            User Acknowledgement
          </p>
          <p className="text-base text-gray-700 md:max-w-2/3">
            Products are eligible for return within 7 days of delivery only if
            they are unused, in their original condition, and packaged with all
            original tags and materials. Items showing signs of use, damage, or
            missing components will not be accepted for return.
          </p>
        </div>
        <div className="flex gap-6 items-center">
          <Checkbox
            id="toggle-2"
            defaultChecked
            className="w-6 h-6 data-[state=checked]:border-[#184193] data-[state=checked]:bg-[#184193] data-[state=checked]:text-white dark:data-[state=checked]:border-[#184193] dark:data-[state=checked]:bg-[#184193]"
          />
          <p className="text-sm text-gray-700 md:max-w-4/5">
            I confirm that the item(s) I am returning meet the eligibility
            criteria and I have read and agree to the Steadfast Return Policy.
          </p>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" className="max-w-30">
          Cancel
        </Button>
        <Button className="max-w-30" onClick={onClickNext}>
          Next
        </Button>
      </div>
    </div>
  );
};

export default ReasonStep;
