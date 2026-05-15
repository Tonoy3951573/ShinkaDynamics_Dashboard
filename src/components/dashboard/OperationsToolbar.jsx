import { cn, metricLabel, panelCard } from '../../lib/ui'
import { useDashboard } from '../../context/useDashboard'

const feedFilterOptions = [
  { value: 'all', label: 'All feed' },
  { value: 'positive', label: 'High quality' },
  { value: 'watchlist', label: 'Needs review' },
]

const employeeSortOptions = [
  { value: 'score', label: 'Top score' },
  { value: 'momentum', label: 'Best momentum' },
  { value: 'risk', label: 'Highest risk' },
]

export function OperationsToolbar() {
  const {
    feedFilter,
    filteredFeed,
    minimumScore,
    employeeSort,
    searchQuery,
    setEmployeeSort,
    setFeedFilter,
    setMinimumScore,
    setSearchQuery,
    sortedEmployees,
  } = useDashboard()
  const sortSelectId = 'employee-sort'
  const minimumScoreId = 'minimum-score'

  return (
    <section className={cn(panelCard, 'reveal-on-scroll is-visible')}>
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <label className="grid flex-1 gap-2" htmlFor="ops-search">
          <span className={metricLabel}>Search employee, station, or note</span>
          <input
            id="ops-search"
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search by name, station, or keyword..."
            className="w-full rounded-[18px] border border-[color:var(--line)] bg-[color:var(--bg-panel)] px-4 py-3 text-[color:var(--text)] outline-none transition placeholder:text-[color:var(--muted)] focus:border-[color:var(--accent-blue)]"
          />
        </label>
        <label className="grid gap-2" htmlFor={sortSelectId}>
          <span className={metricLabel}>Employee sort</span>
          <select
            id={sortSelectId}
            value={employeeSort}
            onChange={(event) => setEmployeeSort(event.target.value)}
            className="min-w-[220px] rounded-[18px] border border-[color:var(--line)] bg-[color:var(--bg-panel)] px-4 py-3 text-[color:var(--text)] outline-none transition focus:border-[color:var(--accent-blue)]"
          >
            {employeeSortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-5 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Live feed filter"
        >
          {feedFilterOptions.map((option) => (
            <button
              key={option.value}
              className={cn(
                'rounded-full border px-4 py-2.5 text-sm font-semibold transition',
                feedFilter === option.value
                  ? 'border-transparent bg-[color:var(--accent-blue)] text-white'
                  : 'border-[color:var(--line)] bg-[color:var(--bg-panel)] text-[color:var(--muted)] hover:border-[color:var(--line-strong)] hover:bg-[color:var(--bg-strong)] hover:text-[color:var(--text)]',
              )}
              type="button"
              onClick={() => setFeedFilter(option.value)}
              aria-pressed={feedFilter === option.value}
            >
              {option.label}
            </button>
          ))}
        </div>
        <label className="grid min-w-[220px] gap-2" htmlFor={minimumScoreId}>
          <span className={metricLabel}>Minimum score: {minimumScore}</span>
          <input
            id={minimumScoreId}
            type="range"
            min="0"
            max="100"
            step="5"
            value={minimumScore}
            onChange={(event) => setMinimumScore(Number(event.target.value))}
            className="w-full accent-[var(--accent-blue)]"
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-[20px] border border-[color:var(--line)] bg-[color:var(--bg-panel)] px-4 py-3">
            <strong className="block text-xl font-bold text-[color:var(--text)]">
              {sortedEmployees.length}
            </strong>
            <span className="text-sm text-[color:var(--muted)]">
              Employees visible
            </span>
          </div>
          <div className="rounded-[20px] border border-[color:var(--line)] bg-[color:var(--bg-panel)] px-4 py-3">
            <strong className="block text-xl font-bold text-[color:var(--text)]">
              {filteredFeed.length}
            </strong>
            <span className="text-sm text-[color:var(--muted)]">
              Feed items visible
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
