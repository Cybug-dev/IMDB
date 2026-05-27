
export const getInitials = (name) => {
  if (!name) return ""; // Guard clause to prevent errors if name is empty
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};
