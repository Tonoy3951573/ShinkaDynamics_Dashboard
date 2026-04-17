import { CriteriaPanel } from '../components/dashboard/CriteriaPanel'
import { HeroPanel } from '../components/dashboard/HeroPanel'
import { InsightPanel } from '../components/dashboard/InsightPanel'
import { LiveFeedPanel } from '../components/dashboard/LiveFeedPanel'
import { OverviewStatsPanel } from '../components/dashboard/OverviewStatsPanel'
import { ScoreTrendCard } from '../components/dashboard/ScoreTrendCard'
import { StatsGrid } from '../components/dashboard/StatsGrid'
import { TeamSpotlight } from '../components/dashboard/TeamSpotlight'
import { useDashboard } from '../context/useDashboard'
import { cn } from '../lib/ui'

export function OverviewPage() {
  const { dashboardData, filteredFeed, sortedEmployees } = useDashboard()

  return (
    <>
      <HeroPanel
        site={dashboardData.site}
        summary={dashboardData.summary}
        scoreDistribution={dashboardData.scoreDistribution}
      />
      <StatsGrid stats={dashboardData.stats} />
      <OverviewStatsPanel
        stats={dashboardData.overviewStats}
        highlights={dashboardData.overviewHighlights}
      />
      <div
        className={cn(
          'reveal-on-scroll grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]',
        )}
      >
        <CriteriaPanel criteria={dashboardData.criteria} />
        <ScoreTrendCard
          chartPoints={dashboardData.scoreTrend}
          weekdayHighlights={dashboardData.weekdayHighlights}
        />
      </div>
      <div
        className="reveal-on-scroll grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]"
        style={{ '--reveal-delay': '120ms' }}
      >
        <LiveFeedPanel feed={filteredFeed} alerts={dashboardData.alerts} />
        <TeamSpotlight employees={sortedEmployees.slice(0, 3)} />
      </div>
      <InsightPanel
        compliance={dashboardData.compliance}
        recommendations={dashboardData.recommendations}
      />
    </>
  )
}
