import { useDispatch, useSelector } from "react-redux";
import { toggleModal } from "../../../redux/modals";
import CategorySelector from "../CategorySelector/CategorySelector";
import XIcon from "../../ui/Icons/XIcon";
import ModalOverlay from "../ModalOverlay/ModalOverlay";
import { useState } from "react";
import "./CategorySelectorModal.css";
import { setFilters, setFiltersUpdated } from "../../../redux/filters";

const CategorySelectorModal = ({
  categories,
  setCategories,
  setSelectedCategory,
  selectedCategory,
  handleCategoryClick,
}) => {
  const dispatch = useDispatch();
  const [error, setError] = useState(null);
  const filters = useSelector((state) => state.filters);

  function handleApply() {
    try {
      if (!filters.draft.category) throw "no category was selected";

      const newDraft = {
        ...filters.draft,
        category: filters.draft.category,
      };

      console.log(newDraft);

      if (!filters.draft.category.is_folder) {
        dispatch(setFilters({ ...filters, draft: newDraft, saved: newDraft }));
        dispatch(setFiltersUpdated(true));
        dispatch(toggleModal({ key: "categorySelectorModal", value: false }));
      }
    } catch (error) {
      setError(error);
    }
  }

  return (
    <>
      <div className="modal category-selector-modal">
        {error && <p className="error-text small-text"></p>}
        <div className="header">
          <h3>Select a category</h3>
          <button
            title="Close this menu"
            className="button"
            onClick={() =>
              dispatch(toggleModal({ key: "categorySelectorModal", value: false }))
            }
          >
            Close <XIcon />
          </button>
        </div>
        <CategorySelector
          forModal={true}
          categories={categories}
          setCategories={setCategories}
          // selectedCategory={selectedCategory}
          // setSelectedCategory={setSelectedCategory}
          handleCategoryClick={handleCategoryClick}
        />
        <div className="buttons">
          <button
            className="button"
            type="button"
            onClick={handleApply}
            // disabled={!selectedCategory || selectedCategory?.is_folder}
            disabled={!filters.draft.category|| filters.draft.category?.is_folder}
          >
            Apply
          </button>
        </div>
      </div>

      <ModalOverlay
        zIndex={5}
        onClick={() =>
          dispatch(toggleModal({ key: "categorySelectorModal", value: false }))
        }
      />
    </>
  );
};
export default CategorySelectorModal;
