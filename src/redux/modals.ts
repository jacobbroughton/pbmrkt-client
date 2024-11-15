import { createSlice } from "@reduxjs/toolkit";
import { isOnMobile } from "../utils/usefulFunctions";

const initialState = {
  editListingModalToggled: false,
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
  addNewMenuToggled: false,
  deleteModalToggled: false,
  contactSellerModalToggled: false,
  contactBuyerModalToggled: false,
  feedbackModalToggled: false,
  bugModalToggled: false,
  editCoverPhotoMenuToggled: false,
};

const modalsSlice = createSlice({
  name: "modals",
  initialState,
  reducers: {
    toggleModal: (state, { payload }) => {
      const { key, value, closeAll = false } = payload;
      return {
        ...state,
        ...(closeAll && {
          ...initialState,
          filtersSidebarToggled: state.filtersSidebarToggled,
        }),
        [`${key}Toggled`]: value,
      };
    },
    closeAllModals: (state, { payload }) => {
      console.log("state at close all modals", state)
      
      return {
        ...initialState,
        filtersSidebarToggled: payload?.keepSidebarOpen || false,
      };
    },
  },
});

export const { toggleModal, closeAllModals } = modalsSlice.actions;
export default modalsSlice.reducer;
