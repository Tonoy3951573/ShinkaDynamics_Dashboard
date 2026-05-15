// ── Pagination Utility ───────────────────────────────────────────────────────
// Standardized pagination for any Express + SQLite route.
// Designed to be table-agnostic — the caller provides the SQL and params,
// this module handles LIMIT/OFFSET and the response envelope.

/**
 * Extracts and validates pagination parameters from an Express request.
 * Clamps values to safe ranges to prevent memory abuse.
 *
 * @param {import('express').Request} req
 * @param {Object} [defaults]
 * @param {number} [defaults.limit=25]  - Default page size
 * @param {number} [defaults.maxLimit=100] - Maximum allowed page size
 * @returns {{ page: number, limit: number, offset: number }}
 */
export function parsePagination(req, defaults = {}) {
  const { limit: defaultLimit = 25, maxLimit = 100 } = defaults;

  let page = parseInt(req.query.page, 10);
  let limit = parseInt(req.query.limit, 10);

  // Clamp page to >= 1
  if (!Number.isFinite(page) || page < 1) page = 1;

  // Clamp limit to [1, maxLimit]
  if (!Number.isFinite(limit) || limit < 1) limit = defaultLimit;
  if (limit > maxLimit) limit = maxLimit;

  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

/**
 * Runs a COUNT(*) query followed by a paginated data query.
 * Returns a standardized response envelope.
 *
 * @param {import('sqlite3').Database} db - SQLite database instance
 * @param {Object} opts
 * @param {string} opts.countSql  - COUNT query, e.g. 'SELECT COUNT(*) as total FROM employees WHERE organization_id = ?'
 * @param {string} opts.dataSql   - Data query WITHOUT LIMIT/OFFSET, e.g. 'SELECT data FROM employees WHERE organization_id = ?'
 * @param {Array}  opts.params    - Bound parameters (used for BOTH count and data queries — ensures tenant scoping)
 * @param {number} opts.page      - Current page (from parsePagination)
 * @param {number} opts.limit     - Page size (from parsePagination)
 * @param {string} [opts.orderBy] - ORDER BY clause, e.g. 'ORDER BY created_at DESC' (appended to dataSql before LIMIT)
 *
 * @returns {Promise<{ data: any[], pagination: { currentPage: number, totalPages: number, totalCount: number, limit: number } }>}
 */
export function paginatedQuery(db, { countSql, dataSql, params = [], page, limit, orderBy = '' }) {
  return new Promise((resolve, reject) => {
    // Step 1: Get total count
    db.get(countSql, params, (err, countRow) => {
      if (err) return reject(err);

      const totalCount = countRow?.total ?? 0;
      const totalPages = Math.max(1, Math.ceil(totalCount / limit));
      const offset = (page - 1) * limit;

      // Step 2: Get paginated data
      const fullDataSql = `${dataSql} ${orderBy} LIMIT ? OFFSET ?`;
      const dataParams = [...params, limit, offset];

      db.all(fullDataSql, dataParams, (err, rows) => {
        if (err) return reject(err);

        resolve({
          data: rows,
          pagination: {
            currentPage: page,
            totalPages,
            totalCount,
            limit,
          },
        });
      });
    });
  });
}
