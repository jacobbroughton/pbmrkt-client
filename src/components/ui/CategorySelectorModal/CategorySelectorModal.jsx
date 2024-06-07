import { useDispatch } from "react-redux";
import { toggleModal } from "../../../redux/modals";
import CategorySelector from "../CategorySelector/CategorySelector";
import XIcon from "../../ui/Icons/XIcon";
import ModalOverlay from "../ModalOverlay/ModalOverlay";
import { useState } from "react";
import "./CategorySelectorModal.css"

const CategorySelectorModal = ({
  categories,
  setCategories,
  setSelectedCategory,
  selectedCategory,
  handleCategoryClick,
}) => {
  const dispatch = useDispatch();
  const [error, setError] = useState(null)
  return (
    <>
      <div className="category-selector-modal modal">
        <div className="heading">
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
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          handleCategoryClick={handleCategoryClick}
        />
        <div className="buttons">
          <button
            className="button"
            type="button"
            onClick={() => {
              try {
                if (!selectedCategory) throw "no category was selected";

                // const newDraft = {
                //   ...filters.draft,
                //   category: selectedCategory,
                // };

                // console.log(newDraft);

                if (!selectedCategory.is_folder) {
                  // dispatch(setFilters({ ...filters, draft: newDraft, saved: newDraft }));
                  // dispatch(setFiltersUpdated(true));
                  dispatch(toggleModal({ key: "categorySelectorModal", value: false }));
                }
              } catch (error) {
                setError(error);
              }
            }}
            disabled={!selectedCategory || selectedCategory?.is_folder}
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
