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