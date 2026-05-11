/**
 * This
 * @name changeSearchParams
 * @function
 * @param {SearchParams} searchParams -
 * @param {String} field -
 * @param {String} value -
 * @returns {SearchParams}
 */
export function changeSearchParams(searchParams, field, value) {
  // if query field is undefined, delete searchParams
  if (field === undefined) {
    return new URLSearchParams();
  } else if (field === "_") {
    // if query field is base, update default sort by
    // TODO pick default sortBy from task === "date"
    const sortBy = value;

    return new URLSearchParams(`_=${value}&.sortBy=${sortBy}`);
  } else if (field !== "") {
    // if query field is defined, update searchParams
    if (value === undefined) {
      // if query value is undefined, remove query field
      searchParams.delete(field);

      return searchParams;
    } else {
      // if query value is defined, set query field
      searchParams.set(field, value);

      return searchParams;
    }
  }

  return searchParams;
}

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
