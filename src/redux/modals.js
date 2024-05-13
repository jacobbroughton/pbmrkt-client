import { createSlice } from "@reduxjs/toolkit";

const modalsSlice = createSlice({
  name: "modals",
  initialState: {
    editItemModalToggled: false,
    sidebarToggled: true,
    rightSideMenuToggled: false,
    verifyUserCheckedEmailModalToggled: false,
  },
  reducers: {
    toggleModal: (state, { payload }) => {
      const { key, value } = payload;
      return {
        ...state,
        [`${key}Toggled`]: value,
      };
    },
  },
});

export const { toggleModal } = modalsSlice.actions;
export default modalsSlice.reducer;
