import { matchRoutes, useLocation } from "react-router-dom";

export function capitalizeWords(str: string) {
  return str
    .toLowerCase()
    .split(" ")
    .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
    .join(" ");
}

export function determineStarFillArray(sellerRating: number) {
  const stars = ["empty", "empty", "empty", "empty", "empty"];

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
    year: { suffix: "y", value: 31536000 },
    month: { suffix: "mon", value: 2592000 },
    week: { suffix: "w", value: 604800 },
    day: { suffix: "d", value: 86400 },
    hour: { suffix: "h", value: 3600 },
    minute: { suffix: "m", value: 60 },
    second: { suffix: "s", value: 1 },
  };

  for (const [, info] of Object.entries(intervals)) {
    const count = Math.floor(seconds / info.value);
    if (count > 0) {
      // return `${count}${determinePrefix(unit.charAt(0))} ago`;
      return `${count}${info.suffix} ago`;
    }
  }

  return "just now";
}

export function formatDollars(dollars: number) {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });

  return formatter.format(dollars);
}

const routes = [{ path: "/members/:id" }];

export const useCurrentPath = () => {
  const location = useLocation();
  const [{ route }] = matchRoutes(routes, location);

  return route.path;
};

export function nestItemCategories(flatCategories, defaultCheckedID) {
  const pathArr = [];
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
        checked: child.id == defaultCheckedID || false,
      };
    });
  }

  return nest(null);
}

type FlatCategoryType = {
  created_at: string;
  id: number;
  is_deleted: boolean;
  is_folder: boolean;
  num_results: number;
  parent_id: number | number;
  plural_name: string;
  singular_name: string;
};

interface NestedCategoryType extends FlatCategoryType {
  toggled: boolean;
  checked: boolean;
  children: NestedCategoryType[];
}

export function nestItemCategoriesExperimental(
  flatCategories: FlatCategoryType[],
  defaultCheckedID: null | number
) {
  console.log({ flatCategories });
  const pathArr = [];
  let lastParentId: number | null = null;
  let preSelectedCategory = null;

  function nest(parentId: number | null): NestedCategoryType[] {
    let self = null;

    if (parentId && parentId == lastParentId) {
      self = flatCategories.find((cat) => cat.id == parentId);
      console.log("here!! self:", self);
      if (self) pathArr.push(self.value);
    }

    const children = flatCategories.filter((cat) => cat.parent_id == parentId);

    lastParentId = parentId;

    return children.map((child) => {
      if (child.id == defaultCheckedID) preSelectedCategory = child;

      return {
        ...child,
        children: nest(child.id),
        // toggled: child.is_folder,
        toggled: false,
        checked: child.id == defaultCheckedID || false,
      };
    });
  }

  return { nestedCategories: nest(null), preSelectedCategory };
}

export function toggleCategoryFolder(clickedFolder, nestedCategories) {
  const categories = [...nestedCategories];

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
  const categories = [...nestedCategories];

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
  const categories = [...(passedCategories || [])];

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

  const categories = [...(passedCategories || [])];

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
  const categories = [...(passedCategories || [])];

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

export function isOnMobile() {
  return (function (a) {
    return (
      /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
        a
      ) ||
      /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
        a.substr(0, 4)
      )
    );
  })(navigator.userAgent || window.opera);
}

export const isValidEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

// { } | \ ” % ~ # < >
export const isValidUsername = (username) => {
  return !String(username).match(/\.|[{]|[}]|\||\\|["]|[%]|[~]|[#]|[<]|[>]|[\s]/g);
};

export function getCheckedOps(options) {
  return options.filter((option) => option.checked).map((option) => option.value);
}
