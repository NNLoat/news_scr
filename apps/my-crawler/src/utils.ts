/**
 * Utility funtion that I use occasionally. Mostly some helper function
 */

/**
 * Remove substring after matched substring in a string
 * @param originalString 
 * @param substringToRemoveAfter 
 * @returns 
 */
export function removeAfterSubstring(originalString:string, substringToRemoveAfter:string) {
  const index = originalString.indexOf(substringToRemoveAfter);
  if (index === -1) {
    // Substring not found, return the original string
    return originalString;
  }
  // Return the part of the string from the beginning up to (but not including) the matched substring
  return originalString.substring(0, index);
}