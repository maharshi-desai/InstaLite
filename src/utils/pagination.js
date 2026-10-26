function parsePagination(query) {
  const parsePositiveInteger = (value, fallback) => {
    if (value === undefined) return fallback;
    if (!/^\d+$/.test(String(value))) return null;
    const parsed = Number(value);
    return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
  };

  const page = parsePositiveInteger(query.page, 1);
  const requestedLimit = parsePositiveInteger(query.limit, 10);
  if (page === null || requestedLimit === null) return { error: 'page and limit must be positive integers' };
  return { page, limit: Math.min(requestedLimit, 50), skip: (page - 1) * Math.min(requestedLimit, 50) };
}

function paginated(data, total, page, limit) {
  return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

module.exports = { parsePagination, paginated };
