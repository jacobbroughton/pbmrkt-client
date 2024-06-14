import "./CategorySelector.css";
import Caret from "../Icons/Caret.jsx";
import RadioIcon from "../Icons/RadioIcon.jsx";

const CategorySelector = ({
  categories,
  handleCategoryClick,
  forModal,
  handleExpandAll,
  handleCollapseAll,
}) => {
  return (
    <div className={`category-selector ${forModal ? "for-modal" : ""}`}>
      <div className="category-list-buttons">
        <button type="button" onClick={handleCollapseAll}>
          Expand All
        </button>
        <button type="button" onClick={handleExpandAll}>
          Collapse All
        </button>
      </div>
      <CategoriesList
        categories={categories}
        isNested={false}
        handleCategoryClick={handleCategoryClick}
      />
    </div>
  );
};

const CategoriesList = ({ categories, isNested, handleCategoryClick }) => {
  return (
    <div className={`categories-list-container ${isNested ? "is-nested" : ""}`}>
      <div className="list-and-nest-bar">
        {isNested && <button className="nest-bar"></button>}
        <div className="categories-list">
          {categories?.map((category) => (
            <CategoryButton
              category={category}
              handleCategoryClick={handleCategoryClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const CategoryButton = ({ category, handleCategoryClick }) => {
  return (
    <button
      className={`category-button ${category.is_folder ? "is-folder" : ""}`}
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        handleCategoryClick(category);
      }}
    >
      <div className="label-and-arrow">
        <span>
          {category.isIndex ? "..." : category.value}
          {!category.is_folder ? ` (${category.num_results})` : ""}
        </span>
        {category.is_folder ? (
          <Caret direction={category.toggled ? "down" : "right"} />
        ) : (
          <>
            <RadioIcon checked={category.checked} />
          </>
        )}
      </div>

      {category.children?.length >= 1 && category.toggled && (
        <CategoriesList
          categories={category.children}
          handleCategoryClick={handleCategoryClick}
          isNested={true}
        />
      )}
    </button>
  );
};

export default CategorySelector;
