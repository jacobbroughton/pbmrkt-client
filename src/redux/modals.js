import { createSlice } from "@reduxjs/toolkit";

const modalsSlice = createSlice({
  name: "modals",
  initialState: {
    editItemModalToggled: false,
    filtersSidebarToggled: true,
    rightSideMenuToggled: false,
    verifyUserCheckedEmailModalToggled: false,
    addReviewModalToggled: false,
    sellerReviewsModalToggled: false,
    priceChangeModalToggled: false,
    categorySelectorModalToggled: false,
    searchModalToggled: false
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
