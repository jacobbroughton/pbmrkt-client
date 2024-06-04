export const categories = [
  {
    label: "Guns",
    children: [
      {
        label: "Index",
        isIndex: true,
        children: [],
      },
      {
        label: "Spare Parts/Maintainance",
        children: [],
        isIndex: false,
      },
    ],
  },
  {
    label: "Hoppers",
    children: [
      {
        label: "Index",
        isIndex: true,
        children: [],
      },
      {
        label: "Parts & Accessories",
        children: [],
        isIndex: false,
      },
    ],
  },
  {
    label: "Tanks",
    children: [
      {
        label: "Compressed Air Tanks",
        children: [
          {
            label: "Index",
            isIndex: true,
            children: [],
          },
          {
            label: "Bottles",
            children: [],
          },
          {
            label: "Regulators",
            children: [],
          },
          {
            label: "Accessories",
            children: [],
          },
        ],
      },
      {
        label: "C02 Tanks & Accessories",
        children: [],
        isIndex: false,
      },
    ],
  },
  {
    label: "Masks",
    children: [
      {
        label: "Index",
        isIndex: true,
        children: [],
      },
      {
        label: "Lenses",
        children: [],
        isIndex: false,
      },
      {
        label: "Frames",
        children: [],
        isIndex: false,
      },
      {
        label: "Straps",
        children: [],
        isIndex: false,
      },
      {
        label: "Visors",
        children: [],
        isIndex: false,
      },
      {
        label: "Bottoms",
        children: [],
        isIndex: false,
      },
      {
        label: "Ears",
        children: [],
        isIndex: false,
      },
      {
        label: "Other",
        children: [],
        isIndex: false,
      },
    ],
  },
  {
    label: "Barrels",
    children: [
      {
        label: "Index",
        isIndex: true,
        children: [],
      },
      {
        label: "Barrel Kits",
        children: [],
        isIndex: false,
      },
      {
        label: "Barrel Swabs",
        children: [],
        isIndex: false,
      },
      {
        label: "Other",
        children: [],
        isIndex: false,
      },
    ],
  },
  {
    label: "Clothing | Apparel",
    children: [
      {
        label: "Paintball Clothing",
        children: [
          {
            label: "Pants",
            children: [],
          },
          {
            label: "Jerseys",
            children: [],
          },
          {
            label: "Headwear",
            children: [
              {
                label: "Headbands",
                children: [],
              },
              {
                label: "Head Wraps",
                children: [],
              },
              {
                label: "Padded Beanie/Hat",
                children: [],
              },
            ],
          },
          {
            label: "Gloves",
            children: [],
          },
          {
            label: "Other",
            children: [],
          },
        ],
      },
      {
        label: "Casual Clothing",
        children: [
          {
            label: "Shirts",
            children: [],
          },
          {
            label: "Pants",
            children: [],
          },
          {
            label: "Headwear",
            children: [],
          },
          {
            label: "Other",
            children: [],
          },
        ],
      },
    ],
  },
  {
    label: "Pod Packs & Pods",
    children: [
      {
        label: "Pod Packs",
        children: [],
        isIndex: false,
      },
      {
        label: "Pods",
        children: [],
        isIndex: false,
      },
      {
        label: "Pod Swabs",
        children: [],
        isIndex: false,
      },
      {
        label: "Pod Bags",
        children: [],
        isIndex: false,
      },
      {
        label: "Other",
        children: [],
        isIndex: false,
      },
    ],
  },
  {
    label: "Protective Gear",
    children: [
      {
        label: "Chest Protection",
        children: [],
        isIndex: false,
      },
      {
        label: "Neck Protection",
        children: [],
        isIndex: false,
      },
      {
        label: "Elbow/Arm Pads",
        children: [],
        isIndex: false,
      },
      {
        label: "Knee Pads",
        children: [],
        isIndex: false,
      },
      {
        label: "Slide Shorts",
        children: [],
        isIndex: false,
      },
      {
        label: "Gloves",
        children: [],
        isIndex: false,
      },
      {
        label: "Other",
        children: [],
        isIndex: false,
      },
    ],
  },
  {
    label: "Gear Bags & Cases",
    children: [
      {
        label: "Gear Bags",
        children: [
          {
            label: "Backpacks",
            children: [],
          },
          {
            label: "Roller Bags",
            children: [],
          },
          {
            label: "Duffel Bags",
            children: [],
          },
          {
            label: "Other",
            children: [],
          },
        ],
      },
      {
        label: "Cases",
        children: [
          {
            label: "Gun Case",
            children: [],
          },
          {
            label: "Mask Case",
            children: [],
          },
          {
            label: "Tank Case",
            children: [],
          },
          {
            label: "Hopper/Loader Case",
            children: [],
          },
          {
            label: "Barrel Case/Wrap",
            children: [],
          },
          {
            label: "Other",
            children: [],
          },
        ],
      },
    ],
  },
];

// export const categories = {
//   Guns: {
//     Index: [],
//     "Spare Parts/Maintainance": [],
//   },
//   Hoppers: {
//     Index: [],
//     "Parts & Accessories": [],
//   },
//   Tanks: {
//     "Compressed Air Tanks": {
//       Index: [],
//       Bottles: [],
//       Regulators: [],
//       Accessories: [],
//     },
//     "C02 Tanks & Accessories": [],
//   },
//   Masks: {
//     Index: [],
//     Lenses: [],
//     Frames: [],
//     Straps: [],
//     Visors: [],
//     Bottoms: [],
//     Ears: [],
//     Other: [],
//   },
//   Barrels: {
//     Index: [],
//     "Barrel Kits": [],
//     "Barrel Swabs": [],
//     Other: [],
//   },
//   "Clothing | Apparel": {
//     "Paintball Clothing": {
//       Pants: [],
//       Jerseys: [],
//       Headwear: {
//         Headbands: [],
//         "Head Wraps": [],
//         "Padded Beanie/Hat": [],
//       },
//       Gloves: [],
//       Other: [],
//     },
//     "Casual Clothing": {
//       Shirts: [],
//       Pants: [],
//       Headwear: [],
//       Other: [],
//     },
//   },
//   "Pod Packs & Pods": {
//     "Pod Packs": [],
//     Pods: [],
//     "Pod Swabs": [],
//     "Pod Bags": [],
//     Other: [],
//   },
//   "Protective Gear": {
//     "Chest Protection": [],
//     "Neck Protection": [],
//     "Elbow/Arm Pads": [],
//     "Knee Pads": [],
//     "Slide Shorts": [],
//     Gloves: [],
//     Other: [],
//   },
//   "Gear Bags & Cases": {
//     "Gear Bags": {
//       Backpacks: [],
//       "Roller Bags": [],
//       "Duffel Bags": [],
//       Other: [],
//     },
//     Cases: {
//       "Gun Case": [],
//       "Mask Case": [],
//       "Tank Case": [],
//       "Hopper/Loader Case": [],
//       "Barrel Case/Wrap": [],
//       Other: [],
//     },
//   },
// };
