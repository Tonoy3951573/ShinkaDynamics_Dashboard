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
import { useEffect } from 'react'

export function OverviewPage() {
  const { dashboardData, sortedEmployees, refreshAnalytics } = useDashboard()

  // Always fetch fresh analytics when arriving at the Overview page
  useEffect(() => { refreshAnalytics() }, [])

  return (
    <>
      {/* HeroPanel self-sources site, summary and scoreDistribution from context */}
      <HeroPanel />
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
        {/* LiveFeedPanel self-sources filteredFeed and alerts from context */}
        <LiveFeedPanel />
        <TeamSpotlight employees={sortedEmployees.slice(0, 3)} />
      </div>
      <InsightPanel
        compliance={dashboardData.compliance}
        recommendations={dashboardData.recommendations}
      />
    </>
  )
}
