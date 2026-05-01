import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type InitialState = {
  blockHighlighting: boolean;
  inlineTooltips: Array<string>;
};
const initialState: InitialState = {
  blockHighlighting: true,
  inlineTooltips: [],
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    enableBlockHighlighting: (state) => {
      state.blockHighlighting = true;
    },
    disableBlockHighlighting: (state) => {
      state.blockHighlighting = false;
    },
    addTooltip: (state, action: PayloadAction<{ tooltipId: string; apply?: boolean }>) => {
      const { tooltipId, apply } = action.payload;
      if (apply && !state.inlineTooltips.includes(tooltipId)) {
        state.inlineTooltips.push(tooltipId);
      } else {
        state.inlineTooltips = [tooltipId];
      }
    },
    removeTooltip: (state, action: PayloadAction<string>) => {
      state.inlineTooltips = state.inlineTooltips.filter((t) => t !== action.payload);
    },
  },
});

export const uiStoreActions = uiSlice.actions;
