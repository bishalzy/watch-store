/**
 * Utility to safely resolve product image URLs.
 * If empty or null, returns a fallback placeholder.
 */
export const getProductImageUrl = (imagePath?: string | null): string => {
  if (!imagePath || imagePath === "null" || imagePath.trim() === "") {
    return "/favicon.png";
  }
  return imagePath;
};
