import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface VerifiedPromoState {
  verified: boolean;
  code: string;
}

const initialState: VerifiedPromoState = {
  verified: false,
  code: "",
};

const verifiedPromoSlice = createSlice({
  name: "verifiedPromo",
  initialState,
  reducers: {
    setVerifiedPromoCode: (
      state,
      action: PayloadAction<VerifiedPromoState>
    ) => {
      state.verified = action.payload.verified;
      state.code = action.payload.code;
    },
    resetVerifiedPromoCode: (state) => {
      state.verified = false;
      state.code = "";
    },
  },
});

export const { setVerifiedPromoCode, resetVerifiedPromoCode } =
  verifiedPromoSlice.actions;
export default verifiedPromoSlice.reducer;
