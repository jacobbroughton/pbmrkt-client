import { useState } from "react";
import { categories } from "../../../utils/categories.js";
import "./CategorySelector.css";
import Caret from "../Icons/Caret.jsx";
import RadioIcon from "../Icons/RadioIcon.jsx";

const CategorySelector = ({ selectedCategory, setSelectedCategory }) => {
  return (
    <div className="category-selector">
      <CategoriesList
        categories={categories}
        isNested={false}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />
    </div>
  );
};

const CategoryButton = ({ category, selectedCategory, setSelectedCategory }) => {
  const [listToggled, setListToggled] = useState(false);


  console.log(category.label, selectedCategory)
  return (
    <button
      className="category-button"
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        setListToggled(!listToggled);
        console.log(category);
        setSelectedCategory(category);
      }}
    >
      <div className="label-and-arrow">
        <span>{category.isIndex ? "..." : category.label}</span>

        {category.children.length >= 1 ? (
          <Caret direction={listToggled ? "down" : "right"} />
        ) : <RadioIcon checked={category.label == selectedCategory?.label}/>}
        
      </div>

      {category.children.length >= 1 && listToggled && (
        <CategoriesList
          categories={category.children}
          isNested={true}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />
      )}
    </button>
  );
};

const CategoriesList = ({ categories, isNested, selectedCategory, setSelectedCategory }) => {
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
            />
          ))}
        </div>
      </div>
    </div>
  );
};
export default CategorySelector;
