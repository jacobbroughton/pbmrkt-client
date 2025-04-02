import { useDispatch, useSelector } from "react-redux";
import { setFilters, setFiltersUpdated } from "../../../redux/filters";
import { setViewLayout } from "../../../redux/view";

export const OverviewOptionList = ({ options, level = 0, loading }) => {
  const dispatch = useDispatch();

  const filters = useSelector((state) => state.filters);

  function handleCategoryClick(category) {
    try {
      dispatch(
        setFilters({
          ...filters,
          saved: {
            ...filters.saved,
            ["For Sale"]: {
              ...filters.saved["For Sale"],
              categories: options,
              category: category,
            },
          },
        })
      );
      dispatch(setFiltersUpdated(true));
      dispatch(setViewLayout("Grid"));
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <>
      <ul className={`overview-option-list tier-${level + 1}`}>
        {options?.map((category, id) => {
          const newLevel = level + 2;
          return (
            <li
              key={id}
              className={`${category.children.length >= 1 ? "has-children" : ""}`}
            >
              {category.is_folder ? (
                <p className="label">{category.plural_name}</p>
              ) : (
                <button
                  className="link-button"
                  onClick={() => handleCategoryClick(category)}
                  id={id}
                >
                  {category.plural_name}{" "}
                  <span>
                    {loading ? (
                      <div className="loading-result-number"></div>
                    ) : (
                      `(${category.num_results || 0})`
                    )}
                  </span>
                </button>
              )}
              {category.children.length >= 1 && (
                <OverviewOptionList
                  options={category.children}
                  level={newLevel}
                  loading={loading}
                />
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
};
