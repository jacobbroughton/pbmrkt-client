import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toggleModal } from "../../../redux/modals";
import { smoothScrollOptions } from "../../../utils/constants";
import { supabase } from "../../../utils/supabase";
import {
  collapseAllCategoryFolders,
  expandAllCategoryFolders,
  nestItemCategories,
  setCategoryChecked,
  toggleCategoryFolder,
} from "../../../utils/usefulFunctions";
import { CategorySelectorModal } from "../../ui/CategorySelectorModal/CategorySelectorModal";
import { FieldErrorButtons } from "../../ui/FieldErrorButtons/FieldErrorButtons";
import { SortIcon } from "../../ui/Icons/SortIcon";
import { RadioOptions } from "../../ui/RadioOptions/RadioOptions";
import "./CreateWantedItem.css";
import { useNavigate } from "react-router-dom";

export const CreateWantedItem = () => {
  const [markedFieldKey, setMarkedFieldKey] = useState(null);
  const [whatIsIt, setWhatIsIt] = useState("");
  const [radioOptions, setRadioOptions] = useState({
    shippingOptions: [
      {
        id: 0,
        value: "Ok with shipping",
        title: "I am ok with someone shipping this item to me",
        description: "",
        checked: true,
      },
      {
        id: 1,
        value: "Local Only",
        title: "No, I want to meet up in-person",
        description: "",
        checked: false,
      },
    ],
  });
  const [budget, setBudget] = useState(null);
  const [description, setDescription] = useState("");
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState({
    draft: {
      all: null,
      selected: null,
    },
    saved: {
      all: null,
      selected: null,
    },
  });

  const filters = useSelector((state) => state.filters);
  const { categorySelectorModalToggled } = useSelector((state) => state.modals);
  const { session } = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const whatIsItRef = useRef(null);
  const budgetRef = useRef(null);
  const categoryRef = useRef(null);

  const fieldErrors = [
    {
      fieldKey: "whatIsIt",
      warningText: "Include a summary (one line) for this item",
      active: !whatIsIt,
      onClick: (e) => {
        e.preventDefault();
        whatIsItRef.current.scrollIntoView(smoothScrollOptions);
      },
    },
    {
      fieldKey: "category",
      warningText: "Select a category",
      active: !categories.saved.selected,
      onClick: (e) => {
        e.preventDefault();
        categoryRef.current.scrollIntoView(smoothScrollOptions);
      },
    },
    {
      fieldKey: "budget",
      warningText: "Add your budget",
      active: !budget,
      onClick: (e) => {
        e.preventDefault();
        budgetRef.current.scrollIntoView(smoothScrollOptions);
      },
    },
  ];

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const checkedShippingValue = radioOptions.shippingOptions.find((op) => op.checked);
      let okWithShipping = checkedShippingValue.value === "Ok with shipping" ? 1 : 0;
      const {
        data: [createdWantedItem],
        error,
      } = await supabase.rpc("add_wanted_item", {
        p_title: whatIsIt,
        p_description: description,
        p_budget: budget,
        p_shipping_ok: okWithShipping,
        p_category_id: categories.saved.selected?.id,
        p_created_by_id: session.user.auth_id,
      });

      if (error) throw error.message;

      if (!createdWantedItem) throw new Error("No new wanted post was created");

      console.log("add_item_request", createdWantedItem);
      navigate(`/wanted/${createdWantedItem.id}`);
    } catch (error) {
      console.error(error);
      setError(error.toString());
    }
  }

  useEffect(() => {
    console.log(markedFieldKey);
    if (
      (markedFieldKey == "whatIsIt" && whatIsIt != "") ||
      (markedFieldKey == "budget" && budget) ||
      (markedFieldKey == "category" && categories.saved.selected)
    )
      setMarkedFieldKey(null);
  }, [whatIsIt, budget, categories.saved.selected?.id, markedFieldKey]);

  useEffect(() => {
    const getItemCategories = async () => {
      try {
        const { data, error } = await supabase.rpc("get_item_categories", {
          p_search_value: "",
          p_brand: filters.saved.brand,
          p_model: filters.saved.model,
          p_min_price: filters.saved.minPrice || 0,
          p_max_price: filters.saved.maxPrice,
          p_state: filters.saved.state == "All" ? null : filters.saved.state,
          p_condition: filters.saved.conditionOptions
            .filter((option) => option.checked)
            .map((option) => option.value),
          p_shipping: filters.saved.shippingOptions
            .filter((option) => option.checked)
            .map((option) => option.value),
          p_trades: filters.saved.tradeOptions
            .filter((option) => option.checked)
            .map((option) => option.value),
          p_negotiable: filters.saved.negotiableOptions
            .filter((option) => option.checked)
            .map((option) => option.value),
          p_seller_id: null,
          p_city: filters.saved.city == "All" ? null : filters.saved.city,
          p_category_id: filters.saved.category?.id || null,
        });

        if (error) throw error.message;

        const nestedItemCategories = nestItemCategories(data, null);

        setCategories({
          draft: {
            ...categories.draft,
            all: nestedItemCategories,
          },
          saved: {
            ...categories.saved,
            all: nestedItemCategories,
          },
        });
      } catch (error) {
        console.error(error);
        setError(error);
      }
    };

    getItemCategories();
  }, []);

  const submitDisabled = !whatIsIt || !budget;

  return (
    <div className="wanted">
      {error && <p className="error-text small-text">{error}</p>}
      <h1>Create Wanted Post</h1>
      <form className="standard" onSubmit={handleSubmit}>
        <div className="form-block">
          <div className="content">
            <div className="form-groups-parent">
              <div
                className={`form-group ${markedFieldKey == "whatIsIt" ? "marked" : ""}`}
                ref={whatIsItRef}
              >
                <label>What are you looking for?</label>
                <input
                  placeholder="What you're looking for"
                  value={whatIsIt}
                  onChange={(e) => setWhatIsIt(e.target.value)}
                />
              </div>

              <div
                className={`form-group ${markedFieldKey == "category" ? "marked" : ""}`}
                ref={categoryRef}
              >
                <label>Select the most accurate category for this item</label>

                <button
                  onClick={() =>
                    dispatch(toggleModal({ key: "categorySelectorModal", value: true }))
                  }
                  className={`${
                    categories.saved?.selected == null ? "empty" : ""
                  } select-category-modal-toggle`}
                  type="button"
                  title={`Click this to open a menu and select an item category to filter your results on`}
                >
                  {categories.saved?.selected?.plural_name ?? "No Category Selected"}{" "}
                  <SortIcon />{" "}
                </button>
              </div>

              <div
                className={`form-group ${markedFieldKey == "budget" ? "marked" : ""}`}
                ref={budgetRef}
              >
                <label>Enter your budget (optional)</label>
                <div className="input-container">
                  <input
                    onChange={(e) => setBudget(parseFloat(e.target.value))}
                    type="number"
                    step={0.01}
                    value={budget}
                    placeholder="Budget"
                    className="dollars"
                    id="budget"
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Describe what you're looking for (optional)</label>
                <textarea
                  placeholder="..."
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <RadioOptions
                options={radioOptions.shippingOptions}
                handleRadioOptionClick={(clickedOption) =>
                  setRadioOptions({
                    ...radioOptions,
                    shippingOptions: radioOptions.shippingOptions.map((option) => {
                      return {
                        ...option,
                        checked: clickedOption.id == option.id,
                      };
                    }),
                  })
                }
              />
            </div>
          </div>
        </div>

        {fieldErrors.filter((fieldError) => fieldError.active).length >= 1 ? (
          <FieldErrorButtons
            fieldErrors={fieldErrors}
            setMarkedFieldKey={setMarkedFieldKey}
          />
        ) : (
          false
        )}

        <button type="submit" disabled={submitDisabled}>
          Submit
        </button>
      </form>

      {categorySelectorModalToggled && (
        <>
          <CategorySelectorModal
            categories={categories.draft.all}
            setCategories={setCategories}
            handleCategoryClick={(category) => {
              // setSelectedCategory(category);
              if (category.is_folder) {
                setCategories({
                  ...categories,
                  draft: {
                    ...categories.draft,
                    all: toggleCategoryFolder(category, categories.draft.all),
                  },
                });
              } else {
                setCategories({
                  ...categories,
                  draft: {
                    ...categories.draft,
                    selected: category.checked ? null : category,
                    all: setCategoryChecked(category, categories.draft.all),
                  },
                });
                // setCategories(setCategoryChecked(category, categories));
              }
            }}
            handleModalClick={() => {
              // TODO - reset draft categories
            }}
            handleApply={() => {
              setCategories({
                ...categories,
                saved: {
                  all: categories.draft.all,
                  selected: categories.draft.selected,
                },
              });
              dispatch(toggleModal({ key: "categorySelectorModal", value: false }));
            }}
            applyDisabled={
              categories.draft?.selected?.id == categories.saved?.selected?.id
            }
            handleExpandAll={() => {
              setCategories({
                ...categories,
                draft: {
                  ...categories.draft,
                  all: expandAllCategoryFolders(categories.draft.all),
                },
              });
            }}
            handleCollapseAll={() => {
              setCategories({
                ...categories,
                draft: {
                  ...categories.draft,
                  all: collapseAllCategoryFolders(categories.draft.all),
                },
              });
            }}
            showResultNumbers={false}
          />
        </>
      )}
    </div>
  );
};
