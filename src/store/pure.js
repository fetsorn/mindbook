/**
 * This finds first available string value for sorting
 * @name findFirstSortBy
 * @function
 * @param {object} branch -
 * @param {String} value -
 * @returns {String}
 */
export function findFirstSortBy(branch, value) {
  // if array, take first item
  const car = Array.isArray(value) ? value[0] : value;

  // it object, take base field
  const key = typeof car === "object" ? car[branch] : car;

  // if undefined, return empty string
  const sortBy = key === undefined ? "" : key;

  return sortBy;
}

export function sortCallback(sortBy, sortDirection) {
  return (a, b) => {
    const valueA = findFirstSortBy(sortBy, a[sortBy]);

    const valueB = findFirstSortBy(sortBy, b[sortBy]);

    switch (sortDirection) {
      case "first":
        return valueA.localeCompare(valueB);
      case "last":
        return valueB.localeCompare(valueA);
      default:
        return valueA.localeCompare(valueB);
    }
  };
}
