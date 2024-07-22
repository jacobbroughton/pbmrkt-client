import { createSlice } from "@reduxjs/toolkit";
import { isOnMobile } from "../utils/usefulFunctions";

const initialState = {
  editItemModalToggled: false,
  filtersSidebarToggled: isOnMobile() ? false : true,
  rightSideMenuToggled: false,
  verifyUserCheckedEmailModalToggled: false,
  addReviewModalToggled: false,
  sellerReviewsModalToggled: false,
  priceChangeModalToggled: false,
  categorySelectorModalToggled: false,
  searchModalToggled: false,
  fullScreenImageModalToggled: false,
  notificationsMenuToggled: false,
  unauthenticatedOptionsMenuToggled: false,
  resetPasswordModalToggled: false,
  loginModalToggled: false,
  registerModalToggled: false,
};

const modalsSlice = createSlice({
  name: "modals",
  initialState,
  reducers: {
    toggleModal: (state, { payload }) => {
      const { key, value, closeAll = false } = payload;
      return {
        ...state,
        ...(closeAll && initialState),
        [`${key}Toggled`]: value,
      };
    },
    closeAllModals: (state, { payload }) => {
      return {
        ...initialState,
        filtersSidebarToggled: false
      }
    }
  },
});

export const { toggleModal, closeAllModals } = modalsSlice.actions;
export default modalsSlice.reducer;
