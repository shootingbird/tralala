import { useAppSelector, useAppDispatch } from "@/hooks/redux";
import {
  setVerifiedPromoCode,
  resetVerifiedPromoCode,
} from "@/slices/verifiedPromoSlice";

export const useVerifiedPromo = () => {
  const dispatch = useAppDispatch();
  const verifiedPromoCode = useAppSelector((state) => state.verifiedPromo);

  const setVerifiedPromoCodeHandler = (payload: {
    verified: boolean;
    code: string;
  }) => {
    dispatch(setVerifiedPromoCode(payload));
  };

  const resetVerifiedPromoCodeHandler = () => {
    dispatch(resetVerifiedPromoCode());
  };

  return {
    verifiedPromoCode,
    setVerifiedPromoCode: setVerifiedPromoCodeHandler,
    resetVerifiedPromoCode: resetVerifiedPromoCodeHandler,
  };
};
