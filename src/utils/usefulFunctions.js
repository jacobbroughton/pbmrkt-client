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
      console.log(i);

      remainingRating -= 1;
      stars[i - 1] = "full";
    }

    if (remainingRating) stars[sellerRating - 0.5] = "half";
  }

  return stars;
}
