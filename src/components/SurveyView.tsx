import { useState } from 'react'
import { useMeetings } from './MeetingContext'
import { useWorkspaceShell } from './WorkspaceShellContext'

interface SurveyItem {
  id: number; hotel: string; meetingType: 'ORM' | 'Marcom'; meetingDate: string; tier: string; orm: string
}
interface SubmittedSurvey {
  id: number; hotel: string; meetingType: 'ORM' | 'Marcom'; meetingDate: string
  submittedDate: string; score: number; status: 'Waiting Customer' | 'Confirmed' | 'Flagged'; tier: string
}
interface FlaggedSurvey {
  id: number; hotel: string; meetingType: 'ORM' | 'Marcom'
  score: number; lowQs: string[]; routeTo: string; routeTeam: string
}

const inquiries: SurveyItem[] = [
  { id: 1,  hotel: 'Ocean View Koh Samui',    meetingType: 'ORM',    meetingDate: '2026-09-23', tier: 'A', orm: 'Niran T.'   },
  { id: 2,  hotel: 'Hillside Chiang Mai',     meetingType: 'ORM',    meetingDate: '2026-09-25', tier: 'B', orm: 'Niran T.'   },
  { id: 3,  hotel: 'Azure Beach Hua Hin',     meetingType: 'Marcom', meetingDate: '2026-09-28', tier: 'B', orm: 'Wanchai P.' },
  { id: 4,  hotel: 'Palm Garden Rayong',      meetingType: 'ORM',    meetingDate: '2026-09-30', tier: 'C', orm: 'Niran T.'   },
  { id: 5,  hotel: 'Lagoon Resort Krabi',     meetingType: 'Marcom', meetingDate: '2026-10-02', tier: 'B', orm: 'Wanchai P.' },
  { id: 6,  hotel: 'Mountain View Pai',       meetingType: 'ORM',    meetingDate: '2026-10-05', tier: 'C', orm: 'Niran T.'   },
  { id: 7,  hotel: 'The Harbor Pattaya',      meetingType: 'Marcom', meetingDate: '2026-10-08', tier: 'A', orm: 'Pranee S.'  },
  { id: 8,  hotel: 'Coral Bay Samui',         meetingType: 'ORM',    meetingDate: '2026-10-10', tier: 'A', orm: 'Niran T.'   },
  { id: 9,  hotel: 'Dune Resort Krabi',       meetingType: 'Marcom', meetingDate: '2026-10-12', tier: 'C', orm: 'Wanchai P.' },
  { id: 10, hotel: 'Baan Suan Pattaya',       meetingType: 'ORM',    meetingDate: '2026-10-15', tier: 'B', orm: 'Niran T.'   },
  { id: 11, hotel: 'Sea Breeze Trat',         meetingType: 'Marcom', meetingDate: '2026-10-18', tier: 'C', orm: 'Pranee S.'  },
  { id: 12, hotel: 'Hilltop View Chiang Rai', meetingType: 'ORM',    meetingDate: '2026-10-20', tier: 'A', orm: 'Niran T.'   },
]

const pendingQueue: SurveyItem[] = [
  { id: 101, hotel: 'Riverside Krabi Resort', meetingType: 'ORM',    meetingDate: '2026-09-18', tier: 'A', orm: 'Niran T.'   },
  { id: 102, hotel: 'Bay Resort Pattaya',     meetingType: 'ORM',    meetingDate: '2026-09-15', tier: 'B', orm: 'Niran T.'   },
  { id: 103, hotel: 'Ocean View Phuket',      meetingType: 'Marcom', meetingDate: '2026-09-20', tier: 'A', orm: 'Pranee S.'  },
]

const overdueDays: Record<number, number> = { 101: 5, 102: 8, 103: 3 }

const initialSubmittedSurveys: SubmittedSurvey[] = [
  { id: 201, hotel: 'Riverside Krabi Resort',         meetingType: 'ORM',    meetingDate: '2026-09-10', submittedDate: '2026-09-11', score: 8.5, status: 'Confirmed',       tier: 'A' },
  { id: 202, hotel: 'Sunset Villa Phuket',             meetingType: 'Marcom', meetingDate: '2026-09-12', submittedDate: '2026-09-13', score: 9.2, status: 'Confirmed',       tier: 'A' },
  { id: 203, hotel: 'Bay Resort Pattaya',              meetingType: 'ORM',    meetingDate: '2026-09-08', submittedDate: '2026-09-09', score: 5.6, status: 'Flagged',         tier: 'B' },
  { id: 204, hotel: 'Ocean View Phuket + Sunset Villa',meetingType: 'Marcom', meetingDate: '2026-09-08', submittedDate: '2026-09-08', score: 7.8, status: 'Waiting Customer', tier: 'A' },
  { id: 205, hotel: 'Hillside Chiang Mai',             meetingType: 'ORM',    meetingDate: '2026-09-05', submittedDate: '2026-09-06', score: 8.0, status: 'Confirmed',       tier: 'B' },
  { id: 206, hotel: 'Azure Beach Hua Hin',             meetingType: 'Marcom', meetingDate: '2026-09-03', submittedDate: '2026-09-04', score: 6.5, status: 'Waiting Customer', tier: 'B' },
  { id: 207, hotel: 'Lagoon Resort Krabi',             meetingType: 'ORM',    meetingDate: '2026-09-01', submittedDate: '2026-09-02', score: 4.5, status: 'Flagged',         tier: 'B' },
  { id: 208, hotel: 'Mountain View Pai',               meetingType: 'Marcom', meetingDate: '2026-08-28', submittedDate: '2026-08-29', score: 9.0, status: 'Confirmed',       tier: 'C' },
]

const initialFlaggedSurveys: FlaggedSurvey[] = [
  { id: 301, hotel: 'Sunset Villa Phuket', meetingType: 'ORM',    score: 4.8, lowQs: ['Q3: Communication (3/10)', 'Q5: Response time (4/10)'], routeTo: 'Niran T.',   routeTeam: 'GRM'        },
  { id: 302, hotel: 'Bay Resort Pattaya',  meetingType: 'Marcom', score: 5.6, lowQs: ['Q5: Content quality (4/10)'],                           routeTo: 'Wanchai P.', routeTeam: 'Marcom Lead' },
]

const surveyQuestions = [
  'Q1: Overall satisfaction with the meeting',
  'Q2: Clarity of agenda and objectives',
  'Q3: Communication quality from ORM/Marcom team',
  'Q4: Timeliness and preparation',
  'Q5: Response time to hotel inquiries',
  'Q6: Would you recommend this meeting format?',
]

type Zone = 'A' | 'B' | 'C' | 'D'

const SUBMITTED_STATUS: Record<string, { bg: string; text: string }> = {
  Confirmed:       { bg: '#F0FDF4', text: '#16A34A' },
  Flagged:         { bg: '#FFF0F0', text: '#DC2626' },
  'Waiting Customer': { bg: '#FFF8E6', text: '#D97706' },
}

export default function SurveyView() {
  const { meetings, updateMeeting } = useMeetings()
  const { addNotification, createCoachingTask } = useWorkspaceShell()
  const [activeZone, setActiveZone]       = useState<Zone>('A')
  const [fillSurveyHotel, setFillSurveyHotel] = useState<SurveyItem | null>(null)
  const [answers, setAnswers]             = useState<Record<number, number>>({})
  const [pendingItems, setPendingItems] = useState<SurveyItem[]>(pendingQueue)
  const [submittedList, setSubmittedList] = useState<SubmittedSurvey[]>(initialSubmittedSurveys)
  const [flaggedList, setFlaggedList] = useState<FlaggedSurvey[]>(initialFlaggedSurveys)
  const [routedFlags, setRoutedFlags] = useState<Set<number>>(new Set())
  const [coachingFlags, setCoachingFlags] = useState<Set<number>>(new Set())
  const [previewHotel, setPreviewHotel]   = useState<SurveyItem | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  function submitSurvey() {
    if (!fillSurveyHotel) return
    const scores = Object.values(answers)
    if (scores.length < surveyQuestions.length) return
    const avg = scores.reduce((a, b) => a + b, 0) / surveyQuestions.length
    const lowEntries = Object.entries(answers).filter(([, value]) => value <= 4)
    const hasLow = lowEntries.length > 0 || avg <= 5
    const createdId = Date.now()
    const today = '2026-09-23'

    setSubmittedList((current) => [
      {
        id: createdId,
        hotel: fillSurveyHotel.hotel,
        meetingType: fillSurveyHotel.meetingType,
        meetingDate: fillSurveyHotel.meetingDate,
        submittedDate: today,
        score: avg,
        status: hasLow ? 'Flagged' : 'Confirmed',
        tier: fillSurveyHotel.tier,
      },
      ...current,
    ])

    if (hasLow) {
      const routeTeam = fillSurveyHotel.meetingType === 'ORM' ? 'GRM' : 'Marcom Lead'
      setFlaggedList((current) => [
        {
          id: createdId,
          hotel: fillSurveyHotel.hotel,
          meetingType: fillSurveyHotel.meetingType,
          score: avg,
          lowQs: lowEntries.length > 0
            ? lowEntries.map(([index, score]) => `${surveyQuestions[Number(index)].split(': ')[0]} (${score}/10)`)
            : [`Average score (${avg.toFixed(1)}/10)`],
          routeTo: fillSurveyHotel.orm,
          routeTeam,
        },
        ...current,
      ])
      addNotification({
        title: 'Low survey score flagged',
        description: `${fillSurveyHotel.hotel} scored ${avg.toFixed(1)} · route to ${routeTeam}`,
        type: 'error',
        target: 'surveys',
      })
    } else {
      addNotification({
        title: 'Survey submitted',
        description: `${fillSurveyHotel.hotel} scored ${avg.toFixed(1)}/10`,
        type: 'success',
        target: 'surveys',
      })
    }

    const relatedMeeting = meetings.find((meeting) => meeting.hotel === fillSurveyHotel.hotel)
    if (relatedMeeting) updateMeeting(relatedMeeting.id, { surveyStatus: 'Submitted' })
    setPendingItems((current) => current.filter((item) => item.id !== fillSurveyHotel.id))
    setSuccessMessage(`ส่ง Survey ของ ${fillSurveyHotel.hotel} แล้ว · คะแนน ${avg.toFixed(1)}/10${hasLow ? ' · สร้าง Flag อัตโนมัติ' : ''}`)
    setActiveZone(hasLow ? 'D' : 'C')
    setFillSurveyHotel(null)
    setAnswers({})
  }

  function routeFlag(flag: FlaggedSurvey) {
    setRoutedFlags((current) => new Set([...current, flag.id]))
    addNotification({
      title: `Routed to ${flag.routeTeam}`,
      description: `${flag.hotel} assigned to ${flag.routeTo}`,
      type: 'info',
      target: 'surveys',
    })
  }

  function addCoaching(flag: FlaggedSurvey) {
    setCoachingFlags((current) => new Set([...current, flag.id]))
    createCoachingTask(flag.hotel)
  }

  const zones: { id: Zone; label: string; labelThai: string; count: number; accent: string }[] = [
    { id: 'A', label: 'Inquiry',   labelThai: 'ที่กำลังจะมา',    count: inquiries.length, accent: '#1A56DB' },
    { id: 'B', label: 'Pending',   labelThai: 'รอกรอก Survey',   count: pendingItems.length, accent: '#D97706' },
    { id: 'C', label: 'Submitted', labelThai: 'ส่งแล้วเดือนนี้', count: submittedList.length, accent: '#16A34A' },
    { id: 'D', label: 'Flagged',   labelThai: 'ต้องดำเนินการ',   count: flaggedList.length, accent: '#DC2626' },
  ]

  return (
    <div className="h-full overflow-auto p-4 md:p-8">
      {/* Header */}
      <div className="mb-5 md:mb-6">
        <h1 className="font-heading text-xl md:text-2xl font-semibold" style={{ color: 'var(--color-text)' }}>
          Surveys
        </h1>
        <p className="text-xs md:text-sm mt-1 font-thai" style={{ color: 'var(--color-text-muted)' }}>
          แบบประเมินหลังประชุม · จัดการและติดตามผลการประเมิน
        </p>
      </div>

      {successMessage && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2 rounded-xl border px-4 py-3 text-xs font-thai" style={{ background: '#F0FDF4', borderColor: '#BBF7D0', color: '#166534' }}>
          <span>✓ {successMessage}</span>
          <button className="font-bold" onClick={() => setSuccessMessage(null)} aria-label="ปิดข้อความ">✕</button>
        </div>
      )}

      {/* Zone tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-3 mb-6">
        {zones.map((z) => {
          const active = activeZone === z.id
          return (
            <button
              key={z.id}
              onClick={() => setActiveZone(z.id)}
              className="text-left px-4 py-3 rounded-2xl border-2 transition-all"
              style={{
                background:  active ? z.accent : '#fff',
                borderColor: active ? z.accent : 'var(--color-border)',
                boxShadow:   active ? `0 4px 16px ${z.accent}30` : '0 1px 4px rgba(0,0,0,.04)',
              }}
            >
              <div className="text-xl font-heading font-bold" style={{ color: active ? '#fff' : z.accent }}>
                {z.count}
              </div>
              <div className="text-xs font-bold mt-0.5" style={{ color: active ? 'rgba(255,255,255,.9)' : 'var(--color-text)' }}>
                {z.label}
              </div>
              <div className="text-xs font-thai mt-0.5" style={{ color: active ? 'rgba(255,255,255,.65)' : 'var(--color-text-muted)' }}>
                {z.labelThai}
              </div>
            </button>
          )
        })}
      </div>

      {/* ── Zone A ── */}
      {activeZone === 'A' && (
        <div className="space-y-2 pb-8">
          <p className="text-xs font-bold mb-3 tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
            UPCOMING — ยังไม่สามารถกรอก Survey ได้จนกว่าการประชุมจะเสร็จสิ้น
          </p>
          {inquiries.map((item) => (
            <div
              key={item.id}
              className="flex flex-wrap sm:flex-nowrap items-center gap-3 px-4 py-3.5 rounded-2xl border bg-white transition-all"
              style={{ borderColor: 'var(--color-border)', boxShadow: '0 1px 4px rgba(0,0,0,.04)' }}
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{item.hotel}</div>
                <div className="text-xs mt-0.5 font-thai" style={{ color: 'var(--color-text-muted)' }}>
                  {item.meetingType} · {item.meetingDate} · {item.orm} · Tier {item.tier}
                </div>
              </div>
              <span className="badge" style={{ background: 'var(--color-surface)', color: 'var(--color-text-muted)' }}>
                Upcoming
              </span>
              <button
                className="btn-ghost text-xs py-1.5 px-3"
                onClick={() => setPreviewHotel(item)}
              >
                Preview Form
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── Zone B ── */}
      {activeZone === 'B' && (
        <div className="space-y-2 pb-8">
          <p className="text-xs font-bold mb-3 tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
            PENDING QUEUE — กรอกภายใน 24 ชั่วโมงหลังประชุม
          </p>
          {pendingItems.map((item) => {
            const days = overdueDays[item.id] ?? 1
            const isOver = days > 1
            return (
              <div
                key={item.id}
                className="flex flex-wrap sm:flex-nowrap items-center gap-3 px-4 py-3.5 rounded-2xl border bg-white"
                style={{
                  borderColor: isOver ? '#DC2626' : 'var(--color-border)',
                  borderLeftWidth: isOver ? '3px' : '1px',
                  boxShadow: '0 1px 4px rgba(0,0,0,.04)',
                }}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{item.hotel}</div>
                  <div className="text-xs mt-0.5 font-thai" style={{ color: 'var(--color-text-muted)' }}>
                    {item.meetingType} · {item.meetingDate} · Tier {item.tier}
                  </div>
                </div>
                {isOver && (
                  <span className="badge" style={{ background: '#FFF0F0', color: '#DC2626' }}>
                    Overdue {days} days
                  </span>
                )}
                <button
                  className="btn-primary text-xs py-1.5 px-4"
                  onClick={() => setFillSurveyHotel(item)}
                >
                  Fill Survey
                </button>
              </div>
            )
          })}
          {pendingItems.length === 0 && (
            <div className="text-center py-16 text-sm font-thai" style={{ color: 'var(--color-text-muted)' }}>
              ไม่มี Survey ที่ค้างอยู่ 🎉
            </div>
          )}
        </div>
      )}

      {/* ── Zone C ── */}
      {activeZone === 'C' && (
        <div className="pb-8">
          <p className="text-xs font-bold mb-3 tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
            SUBMITTED — {submittedList.length} รายการในเดือนนี้
          </p>
          {/* Mobile: cards */}
          <div className="md:hidden space-y-2">
            {submittedList.map((s) => {
              const ss = SUBMITTED_STATUS[s.status]
              const scoreColor = s.score >= 8 ? '#16A34A' : s.score >= 6 ? '#D97706' : '#DC2626'
              return (
                <div
                  key={s.id}
                  className="rounded-2xl border bg-white p-4"
                  style={{ borderColor: 'var(--color-border)', boxShadow: '0 1px 4px rgba(0,0,0,.04)' }}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{s.hotel}</div>
                    <span className="font-heading font-bold text-lg" style={{ color: scoreColor }}>{s.score.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{s.meetingDate} · Tier {s.tier}</span>
                    <span className="badge" style={{ background: ss.bg, color: ss.text }}>{s.status}</span>
                  </div>
                </div>
              )
            })}
          </div>
          {/* Desktop: table */}
          <div
            className="hidden md:block rounded-2xl border bg-white overflow-hidden"
            style={{ borderColor: 'var(--color-border)', boxShadow: '0 2px 8px rgba(0,0,0,.04)' }}
          >
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--color-surface)' }}>
                  {['Hotel', 'Type', 'Meeting', 'Submitted', 'Score', 'Status'].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-bold border-b"
                      style={{ color: 'var(--color-text-muted)', borderColor: 'var(--color-border)' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {submittedList.map((s, i) => {
                  const ss = SUBMITTED_STATUS[s.status]
                  const scoreColor = s.score >= 8 ? '#16A34A' : s.score >= 6 ? '#D97706' : '#DC2626'
                  return (
                    <tr
                      key={s.id}
                      className="border-b hover:bg-blue-50/10 transition-colors"
                      style={{ borderColor: 'var(--color-border)', background: i % 2 === 0 ? 'transparent' : '#FAFBFC' }}
                    >
                      <td className="px-4 py-3 text-xs font-semibold" style={{ color: 'var(--color-text)' }}>{s.hotel}</td>
                      <td className="px-4 py-3">
                        <span
                          className="badge"
                          style={{
                            background: s.meetingType === 'ORM' ? '#EBF2FF' : '#F0FDF4',
                            color:      s.meetingType === 'ORM' ? '#1A56DB' : '#0A7A3E',
                          }}
                        >
                          {s.meetingType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--color-text-2)' }}>{s.meetingDate}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--color-text-2)' }}>{s.submittedDate}</td>
                      <td className="px-4 py-3">
                        <span className="font-heading font-bold text-base" style={{ color: scoreColor }}>{s.score.toFixed(1)}</span>
                        <span className="text-xs ml-1" style={{ color: 'var(--color-text-muted)' }}>/10</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="badge" style={{ background: ss.bg, color: ss.text }}>{s.status}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Zone D ── */}
      {activeZone === 'D' && (
        <div className="space-y-4 pb-8">
          <p className="text-xs font-bold mb-3 tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
            FLAGGED SURVEYS — สร้าง Flag เมื่อคะแนนเฉลี่ย ≤ 5 หรือมีคำตอบข้อใดข้อหนึ่ง ≤ 4
          </p>
          {flaggedList.map((f) => (
            <div
              key={f.id}
              className="rounded-2xl border bg-white p-5"
              style={{
                borderColor: '#DC2626',
                borderLeftWidth: '4px',
                boxShadow: '0 4px 16px rgba(220,38,38,.08)',
              }}
            >
              <div className="flex items-start justify-between mb-3 gap-3">
                <div>
                  <h3 className="font-heading text-base font-bold" style={{ color: 'var(--color-text)' }}>
                    {f.hotel}
                  </h3>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{f.meetingType} Meeting</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-heading text-3xl font-bold" style={{ color: '#DC2626' }}>
                    {f.score.toFixed(1)}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>/10</div>
                </div>
              </div>

              <div className="mb-4">
                <div className="text-xs font-bold mb-2 tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
                  คำถามที่ได้คะแนนต่ำ
                </div>
                <div className="flex flex-wrap gap-2">
                  {f.lowQs.map((q) => (
                    <span
                      key={q}
                      className="badge"
                      style={{ background: '#FFF0F0', color: '#DC2626' }}
                    >
                      {q}
                    </span>
                  ))}
                </div>
              </div>

              <div
                className="flex items-center justify-between px-3 py-2.5 rounded-xl mb-4"
                style={{ background: 'var(--color-surface)' }}
              >
                <div>
                  <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Route to</div>
                  <div className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                    {f.routeTo} · {f.routeTeam}
                  </div>
                </div>
                <span className="badge" style={{ background: '#FFF0F0', color: '#DC2626' }}>{f.routeTeam}</span>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  className="btn-primary flex-1 min-w-[120px] text-center"
                  style={{ background: '#DC2626', boxShadow: '0 2px 8px rgba(220,38,38,.25)' }}
                  disabled={routedFlags.has(f.id)}
                  onClick={() => routeFlag(f)}
                >
                  {routedFlags.has(f.id) ? `Routed to ${f.routeTeam} ✓` : `Route to ${f.routeTeam}`}
                </button>
                <button
                  className="btn-ghost flex-1 min-w-[120px] text-center disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={coachingFlags.has(f.id)}
                  onClick={() => addCoaching(f)}
                >
                  {coachingFlags.has(f.id) ? 'Coaching Task Created ✓' : 'Create Coaching Task'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Fill Survey Modal ── */}
      {fillSurveyHotel && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 overflow-y-auto">
          <div className="w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl">
            <div
              className="px-5 py-4 border-b flex items-center justify-between sticky top-0 bg-white rounded-t-2xl"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <div>
                <h3 className="font-heading text-base font-bold" style={{ color: 'var(--color-text)' }}>
                  กรอก Survey
                </h3>
                <p className="text-xs font-thai mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                  {fillSurveyHotel.hotel} · {fillSurveyHotel.meetingType} · {fillSurveyHotel.meetingDate}
                </p>
              </div>
              <button
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                onClick={() => setFillSurveyHotel(null)}
                style={{ color: 'var(--color-text-muted)' }}
              >✕</button>
            </div>
            <div className="px-5 py-5 space-y-5">
              <div className="rounded-xl border px-3 py-2.5 text-xs font-thai" style={{ background: '#FFF8E6', borderColor: '#FDE68A', color: '#92400E' }}>
                เกณฑ์อัตโนมัติ: หากคะแนนเฉลี่ย ≤ 5 หรือคำตอบข้อใดข้อหนึ่ง ≤ 4 ระบบจะสร้าง Flag และส่งต่อทีมที่รับผิดชอบ
              </div>
              {surveyQuestions.map((q, i) => (
                <div key={i}>
                  <div className="text-sm font-semibold mb-2.5" style={{ color: 'var(--color-text)' }}>{q}</div>
                  <div className="flex gap-1.5 flex-wrap">
                    {[1,2,3,4,5,6,7,8,9,10].map((v) => {
                      const sel = answers[i] === v
                      const accent = v <= 4 ? '#DC2626' : v <= 6 ? '#D97706' : '#16A34A'
                      return (
                        <button
                          key={v}
                          onClick={() => setAnswers((prev) => ({ ...prev, [i]: v }))}
                          className="w-9 h-9 rounded-xl text-xs font-bold transition-all hover:scale-105"
                          style={{
                            background:  sel ? accent : 'var(--color-surface)',
                            color:       sel ? '#fff' : 'var(--color-text-muted)',
                            border:      sel ? 'none' : '1.5px solid var(--color-border)',
                            boxShadow:   sel ? `0 2px 8px ${accent}40` : 'none',
                          }}
                        >
                          {v}
                        </button>
                      )
                    })}
                  </div>
                  {answers[i] !== undefined && answers[i] <= 4 && (
                    <p className="text-xs mt-1.5 font-medium" style={{ color: '#DC2626' }}>
                      ⚠️ คะแนนต่ำ — จะสร้าง Flag อัตโนมัติ
                    </p>
                  )}
                </div>
              ))}
            </div>
            <div
              className="px-5 py-4 border-t flex gap-2 sticky bottom-0 bg-white"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <button
                className="btn-primary flex-1 text-center disabled:opacity-40 disabled:cursor-not-allowed"
                disabled={Object.keys(answers).length < surveyQuestions.length}
                onClick={submitSurvey}
              >
                Submit ({Object.keys(answers).length}/{surveyQuestions.length})
              </button>
              <button className="btn-ghost px-5" onClick={() => setFillSurveyHotel(null)}>ยกเลิก</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Preview Modal ── */}
      {previewHotel && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl max-h-[85vh] flex flex-col">
            <div
              className="px-5 py-4 border-b flex items-center justify-between"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <div>
                <h3 className="font-heading text-base font-bold" style={{ color: 'var(--color-text)' }}>ตัวอย่างแบบประเมิน</h3>
                <p className="text-xs font-thai mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                  {previewHotel.hotel} · {previewHotel.meetingDate}
                </p>
              </div>
              <button
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                onClick={() => setPreviewHotel(null)}
                style={{ color: 'var(--color-text-muted)' }}
              >✕</button>
            </div>
            <div className="overflow-y-auto px-5 py-4 space-y-4 opacity-60 pointer-events-none">
              {surveyQuestions.map((q, i) => (
                <div key={i}>
                  <div className="text-sm mb-2" style={{ color: 'var(--color-text)' }}>{q}</div>
                  <div className="flex gap-1.5 flex-wrap">
                    {[1,2,3,4,5,6,7,8,9,10].map((v) => (
                      <div
                        key={v}
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-xs"
                        style={{ background: 'var(--color-surface)', color: 'var(--color-text-muted)', border: '1.5px solid var(--color-border)' }}
                      >
                        {v}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div
              className="px-5 py-3 border-t text-center text-xs font-thai"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
            >
              กรอกได้หลังการประชุมเสร็จสิ้น
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
