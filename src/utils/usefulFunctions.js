export function capitalizeWords(str) {
  return str
    .toLowerCase()
    .split(" ")
    .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
    .join(" ");
}

export function determineStarFillArray(sellerRating) {
  let stars = ["empty", "empty", "empty", "empty", "empty"];

  if (sellerRating) {
    let remainingRating = sellerRating;

    for (let i = 1; i < sellerRating; i++) {
      remainingRating -= 1;
      stars[i - 1] = "full";
    }

    if (remainingRating) stars[sellerRating - 0.5] = "half";
  }

  return stars;
}

export function getTimeAgo(date) {
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1,
  };

  for (const [unit, value] of Object.entries(intervals)) {
    const count = Math.floor(seconds / value);
    if (count > 0) {
      return `${count}${unit.charAt(0)} ago`;
    }
  }

  return "just now";
}

export function formatDollars(dollars) {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });

  return formatter.format(dollars);
}

import { matchRoutes, useLocation } from "react-router-dom";

const routes = [{ path: "/members/:id" }];

export const useCurrentPath = () => {
  const location = useLocation();
  const [{ route }] = matchRoutes(routes, location);

  return route.path;
};

export function nestItemCategories(flatCategories) {
  let pathArr = [];
  let lastParentId = null;

  function nest(parentId) {
    let self = null;

    if (parentId && parentId == lastParentId) {
      self = flatCategories.find((cat) => cat.id == parentId);
      pathArr.push(self.value);
    }

    const children = flatCategories.filter((cat) => cat.parent_id == parentId);

    lastParentId = parentId;

    return children.map((child) => {
      return {
        ...child,
        children: nest(child.id),
        // toggled: child.is_folder,
        toggled: false,
        checked: false,
      };
    });
  }

  return nest(null);
}

export function toggleCategoryFolder(clickedFolder, nestedCategories) {
  let categories = [...nestedCategories];

  function searchCategories(categoriesToSearch) {
    return categoriesToSearch.map((cat) => {
      return {
        ...cat,
        toggled: cat.id == clickedFolder.id ? !cat.toggled : cat.toggled,
        children: searchCategories(cat.children),
      };
    });
  }

  return searchCategories(categories);
}

export function setCategoryChecked(clickedCategory, nestedCategories) {
  let categories = [...nestedCategories];

  function searchCategories(categoriesToSearch) {
    return categoriesToSearch.map((cat) => {
      return {
        ...cat,
        ...(!cat.is_folder && {
          checked: cat.id == clickedCategory.id ? !cat.checked : false,
        }),
        children: searchCategories(cat.children),
      };
    });
  }

  return searchCategories(categories);
}

export function collapseAllCategoryFolders(passedCategories) {
  if (!passedCategories || passedCategories?.length == 0) return [];
  let categories = [...(passedCategories || [])];

  function searchCategories(categoriesToSearch) {
    return categoriesToSearch.map((cat) => {
      return {
        ...cat,
        ...(cat.is_folder && {
          toggled: false,
          children: searchCategories(cat.children),
        }),
      };
    });
  }

  return searchCategories(categories);
}

export function expandAllCategoryFolders(passedCategories) {
  if (!passedCategories || passedCategories?.length == 0) return [];

  let categories = [...(passedCategories || [])];

  function searchCategories(categoriesToSearch) {
    return categoriesToSearch.map((cat) => {
      return {
        ...cat,
        ...(cat.is_folder && {
          toggled: true,
          children: searchCategories(cat.children),
        }),
      };
    });
  }

  return searchCategories(categories);
}

export function resetCategories(passedCategories) {
  if (!passedCategories || passedCategories?.length == 0) return [];
  let categories = [...(passedCategories || [])];

  function searchCategories(categoriesToSearch) {
    return categoriesToSearch.map((cat) => {
      return {
        ...cat,
        checked: false,
        ...(cat.is_folder && {
          toggled: false,
          children: searchCategories(cat.children),
        }),
      };
    });
  }

  return searchCategories(categories);
}

export function isValidPhoneNumber(phoneNumberStr) {
  return phoneNumberStr.match(/^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/);
}
