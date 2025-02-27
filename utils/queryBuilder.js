const MAX_LIMIT = 10;

module.exports = async function (queryChain, queryOptions) {
  // Filtering
  const filteredQueryOptions = { ...queryOptions };
  const excludedFields = ["page", "sort", "limit", "fields"];
  excludedFields.forEach((el) => delete filteredQueryOptions[el]);

  let queryString = JSON.stringify(filteredQueryOptions);
  queryString = queryString.replace(
    /\b(gte|gt|lte|lt)\b/g,
    (match) => `$${match}`
  );

  queryChain = queryChain.find(JSON.parse(queryString));

  // Sorting
  if (queryOptions.sort) {
    const sortBy = queryOptions.sort.split(",").join(" ");
    queryChain = queryChain.sort(sortBy);
  } else {
    queryChain = queryChain.sort("-createdAt");
  }

  // Field limiting
  if (queryOptions.fields) {
    const fields = queryOptions.fields.split(",");
    queryChain = queryChain.select(fields);
  } else {
    queryChain = queryChain.select("-__v");
  }

  // Pagination
  const page = queryOptions.page * 1 || 1;
  const limit =
    queryOptions.limit * 1 < MAX_LIMIT ? queryOptions.limit * 1 : MAX_LIMIT;
  const skip = (page - 1) * limit;
  queryChain = queryChain.skip(skip).limit(limit);

  return queryChain;
};
