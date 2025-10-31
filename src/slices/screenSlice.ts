import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ScreenState {
  isMobile: boolean;
  isDesktop: boolean;
}

const initialState: ScreenState = {
  isMobile: false,
  isDesktop: true,
};

const screenSlice = createSlice({
  name: "screen",
  initialState,
  reducers: {
    setIsMobile: (state, action: PayloadAction<boolean>) => {
      state.isMobile = action.payload;
      state.isDesktop = !action.payload;
    },
  },
});

export const { setIsMobile } = screenSlice.actions;
export default screenSlice.reducer;
