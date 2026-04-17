export const dashboardData = {
  user: {
    name: 'Amina Rahman',
    role: 'Director of Operations',
  },
  site: {
    label: 'Flagship Branch',
    name: 'Gulshan Premium Store',
    updatedAt: 'Updated 2 min ago',
    coverage: '12 AI-enabled cameras active',
  },
  summary: {
    score: 91,
    trend: '+4.8%',
    insight:
      'Storewide customer interaction quality is healthy, with greeting compliance leading the strongest improvement this week.',
  },
  scoreDistribution: [
    { label: 'Joyful facial expression', value: 93, tone: 'emerald' },
    { label: 'Polite verbal tone', value: 89, tone: 'amber' },
    { label: 'Greeting on entry and exit', value: 95, tone: 'blue' },
  ],
  navigation: [
    { label: 'Overview', active: true },
    { label: 'Live Monitoring' },
    { label: 'Employee Scoring' },
    { label: 'Branch Comparison' },
    { label: 'Alerts' },
    { label: 'Policy & Audit' },
  ],
  stats: [
    {
      label: 'Employees scored today',
      value: '48',
      detail: '6 new hires included in baseline tracking',
    },
    {
      label: 'Average interaction score',
      value: '91.4',
      detail: 'Across 1,286 customer interactions',
    },
    {
      label: 'Greeting compliance',
      value: '96%',
      detail: 'Entry and exit greeting detection',
    },
    {
      label: 'Risky interactions',
      value: '07',
      detail: 'Flagged for manual supervisor review',
    },
  ],
  overviewStats: [
    {
      label: 'Average response time',
      value: '11s',
      detail: 'From customer entry to first staff acknowledgement',
      tone: 'blue',
    },
    {
      label: 'Escalation rate',
      value: '1.8%',
      detail: 'Conversations requiring supervisor support',
      tone: 'red',
    },
    {
      label: 'Peak hour quality',
      value: '88',
      detail: 'Average score between 6 PM and 8 PM',
      tone: 'amber',
    },
    {
      label: 'Training completion',
      value: '92%',
      detail: 'Staff with current service-behavior certification',
      tone: 'emerald',
    },
  ],
  overviewHighlights: [
    {
      title: 'Best-performing zone',
      value: 'Front entrance',
      detail: 'Highest greeting and facial warmth consistency today',
    },
    {
      title: 'Most common risk',
      value: 'Tone pressure at checkout',
      detail: 'Detected mainly during queue spikes and refund requests',
    },
    {
      title: 'Supervisor action queue',
      value: '4 cases',
      detail: 'Awaiting human review before performance escalation',
    },
  ],
  criteria: [
    {
      title: 'Facial expression',
      score: 93,
      weight: '35%',
      description:
        'Measures smiling frequency, relaxed expression, and positive customer-facing presence during the interaction window.',
      metrics: ['Smile consistency 94%', 'Negative expression events 3%', 'Warmth score 92/100'],
    },
    {
      title: 'Verbal expression',
      score: 89,
      weight: '40%',
      description:
        'Evaluates politeness, calm tone, pace, and whether language stays respectful and service-oriented throughout the conversation.',
      metrics: ['Politeness phrases 88%', 'Raised tone incidents 5', 'Empathy confidence 90/100'],
    },
    {
      title: 'Greeting behavior',
      score: 95,
      weight: '25%',
      description:
        'Tracks whether employees greet customers on entry, offer assistance proactively, and close the interaction courteously.',
      metrics: ['Entry greeting 97%', 'Exit greeting 93%', 'Missed opportunities 4'],
    },
  ],
  scoreTrend: [78, 80, 84, 83, 89, 92, 91],
  weekdayHighlights: [
    { day: 'Mon', score: 78 },
    { day: 'Tue', score: 80 },
    { day: 'Wed', score: 84 },
    { day: 'Thu', score: 83 },
    { day: 'Fri', score: 89 },
    { day: 'Sat', score: 92 },
    { day: 'Sun', score: 91 },
  ],
  liveFeed: [
    {
      employee: 'Nadia Rahman',
      station: 'Front entrance',
      status: 'Greeting customer group',
      score: 96,
      sentiment: 'Positive',
    },
    {
      employee: 'Tariq Hassan',
      station: 'Checkout 03',
      status: 'Tone needs follow-up',
      score: 74,
      sentiment: 'Manual review',
    },
    {
      employee: 'Afsana Karim',
      station: 'Customer service desk',
      status: 'Explaining return policy',
      score: 91,
      sentiment: 'Polite and composed',
    },
  ],
  alerts: [
    {
      title: 'Tone escalation detected',
      detail: 'Checkout 03 recorded a sharp vocal spike during a refund discussion.',
      severity: 'High',
    },
    {
      title: 'Missed greeting cluster',
      detail: 'Three customers entered aisle entrance B with no greeting in the last 25 minutes.',
      severity: 'Medium',
    },
  ],
  employees: [
    {
      name: 'Nadia Rahman',
      role: 'Senior Sales Associate',
      score: 96,
      delta: '+6',
      strengths: 'Warm facial cues and consistent greetings',
      metrics: {
        facialExpression: 97,
        verbalExpression: 94,
        greetingBehavior: 98,
        responseTime: '8s',
      },
      info: {
        interactionsToday: 46,
        riskLevel: 'Low',
        peakStation: 'Front entrance',
        lastCoaching: '2 days ago',
      },
      profile: {
        employeeId: 'EMP-1024',
        shift: 'Morning (8:00 AM - 4:00 PM)',
        tenure: '2 years 4 months',
        supervisor: 'Rafiul Karim',
        certifications: ['Greeting Excellence', 'Premium Customer Handling', 'Conflict De-escalation'],
        weeklyScores: [
          { day: 'Mon', score: 92 },
          { day: 'Tue', score: 94 },
          { day: 'Wed', score: 95 },
          { day: 'Thu', score: 97 },
          { day: 'Fri', score: 96 },
        ],
        recentSessions: [
          { time: '09:12 AM', station: 'Front entrance', score: 98, note: 'Proactive welcome with eye contact' },
          { time: '11:40 AM', station: 'Women apparel', score: 94, note: 'Smooth product guidance and upsell' },
          { time: '02:08 PM', station: 'Checkout support', score: 96, note: 'Calm support during payment delay' },
        ],
      },
    },
    {
      name: 'Afsana Karim',
      role: 'Support Desk Specialist',
      score: 91,
      delta: '+3',
      strengths: 'Strong verbal politeness under longer interactions',
      metrics: {
        facialExpression: 90,
        verbalExpression: 93,
        greetingBehavior: 89,
        responseTime: '11s',
      },
      info: {
        interactionsToday: 39,
        riskLevel: 'Medium',
        peakStation: 'Customer service desk',
        lastCoaching: '5 days ago',
      },
      profile: {
        employeeId: 'EMP-1182',
        shift: 'Midday (10:00 AM - 6:00 PM)',
        tenure: '1 year 7 months',
        supervisor: 'Muntaha Islam',
        certifications: ['Returns Desk Standards', 'Service Recovery', 'Policy Communication'],
        weeklyScores: [
          { day: 'Mon', score: 86 },
          { day: 'Tue', score: 88 },
          { day: 'Wed', score: 90 },
          { day: 'Thu', score: 92 },
          { day: 'Fri', score: 91 },
        ],
        recentSessions: [
          { time: '10:26 AM', station: 'Service desk', score: 89, note: 'Clear explanation of return policy' },
          { time: '01:54 PM', station: 'Service desk', score: 93, note: 'Resolved exchange request empathetically' },
          { time: '04:37 PM', station: 'Returns queue', score: 90, note: 'Handled delayed approval without escalation' },
        ],
      },
    },
    {
      name: 'Tariq Hassan',
      role: 'Cashier',
      score: 74,
      delta: '-5',
      strengths: 'Needs coaching on tone control during queue pressure',
      metrics: {
        facialExpression: 76,
        verbalExpression: 69,
        greetingBehavior: 78,
        responseTime: '16s',
      },
      info: {
        interactionsToday: 52,
        riskLevel: 'High',
        peakStation: 'Checkout 03',
        lastCoaching: 'Today',
      },
      profile: {
        employeeId: 'EMP-1249',
        shift: 'Evening (1:00 PM - 9:00 PM)',
        tenure: '10 months',
        supervisor: 'Sabbir Hossain',
        certifications: ['Checkout Protocol Basics', 'Queue Management'],
        weeklyScores: [
          { day: 'Mon', score: 82 },
          { day: 'Tue', score: 79 },
          { day: 'Wed', score: 76 },
          { day: 'Thu', score: 73 },
          { day: 'Fri', score: 74 },
        ],
        recentSessions: [
          { time: '02:18 PM', station: 'Checkout 03', score: 72, note: 'Tone tightened during refund request' },
          { time: '05:03 PM', station: 'Checkout 03', score: 76, note: 'Recovered tone after supervisor prompt' },
          { time: '07:49 PM', station: 'Checkout 02', score: 74, note: 'Fast checkout but greeting consistency low' },
        ],
      },
    },
  ],
  compliance: [
    'Visible AI monitoring notice active at all entrances',
    'Audio retention policy limited to 30 days',
    'Supervisor review required before disciplinary action',
  ],
  recommendations: [
    {
      title: 'Daily greeting drill',
      detail: 'Run a 10-minute opening routine focused on proactive hello and thank-you phrases.',
    },
    {
      title: 'Tone coaching for peak hours',
      detail: 'Target checkout teams between 6 PM and 8 PM where impatience indicators rise fastest.',
    },
    {
      title: 'Supervisor audit queue',
      detail: 'Review all high-severity interactions before using them in employee performance conversations.',
    },
  ],
}
