import { useState } from "react";
import { categories as initialCategories } from "../../../utils/categories.js";
import "./CategorySelector.css";
import Caret from "../Icons/Caret.jsx";
import RadioIcon from "../Icons/RadioIcon.jsx";
import {
  collapseAllCategoryFolders,
  expandAllCategoryFolders,
} from "../../../utils/usefulFunctions.js";

const CategorySelector = ({
  categories,
  setCategories,
  selectedCategory,
  setSelectedCategory,
  handleCategoryClick,
  forModal,
}) => {
  // const [categories, setCategories] = useState(initialCategories);
  return (
    <div className={`category-selector ${forModal ? "for-modal" : ""}`}>
      <div className="category-list-buttons">
        {/* <p className={`selected-category ${selectedCategory ? "" : "red"}`}>
          {selectedCategory?.path || "Select a Category"}
        </p> */}

        <button
          type="button"
          onClick={() => setCategories(expandAllCategoryFolders(categories))}
        >
          Expand All
        </button>
        <button
          type="button"
          onClick={() => setCategories(collapseAllCategoryFolders(categories))}
        >
          Collapse All
        </button>
      </div>
      <CategoriesList
        categories={categories}
        setCategories={setCategories}
        isNested={false}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        handleCategoryClick={handleCategoryClick}
      />
    </div>
  );
};

const CategoryButton = ({
  category,
  handleCategoryClick,
  selectedCategory,
  setSelectedCategory,
}) => {
  return (
    <button
      className={`category-button ${category.is_folder ? "is-folder" : ""}`}
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        handleCategoryClick(category);

        if (!category.is_folder) setSelectedCategory(category.checked ? null : category);
      }}
    >
      <div className="label-and-arrow">
        <span>{category.isIndex ? "..." : category.value}</span>
        {category.is_folder ? (
          <Caret direction={category.toggled ? "down" : "right"} />
        ) : (
          // <RadioIcon checked={category.id == selectedCategory?.id} />
          <RadioIcon checked={category.checked} />
        )}
      </div>

      {category.children?.length >= 1 && category.toggled && (
        <CategoriesList
          categories={category.children}
          handleCategoryClick={handleCategoryClick}
          isNested={true}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />
      )}
    </button>
  );
};

const CategoriesList = ({
  categories,
  isNested,
  selectedCategory,
  setSelectedCategory,
  handleCategoryClick,
}) => {
  return (
    <div className={`categories-list-container ${isNested ? "is-nested" : ""}`}>
      <div className="list-and-nest-bar">
        {isNested && <button className="nest-bar"></button>}
        <div className="categories-list">
          {categories?.map((category) => (
            <CategoryButton
              category={category}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              handleCategoryClick={handleCategoryClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
export default CategorySelector;
