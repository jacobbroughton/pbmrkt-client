import { useDispatch } from "react-redux";
import { toggleModal } from "../../../redux/modals";
import CategorySelector from "../CategorySelector/CategorySelector";
import XIcon from "../../ui/Icons/XIcon";
import ModalOverlay from "../ModalOverlay/ModalOverlay";
import "./CategorySelectorModal.css";

const CategorySelectorModal = ({
  categories,
  setCategories,
  handleCategoryClick,
  handleModalClick,
  handleApply,
  applyDisabled,
}) => {
  const dispatch = useDispatch();

  return (
    <>
      <div className="modal category-selector-modal">
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
            disabled={applyDisabled}
          >
            Apply
          </button>
        </div>
      </div>

      <ModalOverlay
        zIndex={5}
        onClick={() => {
          dispatch(toggleModal({ key: "categorySelectorModal", value: false }));
          handleModalClick();
        }}
      />
    </>
  );
};
export default CategorySelectorModal;
