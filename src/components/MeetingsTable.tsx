import { useState } from 'react'

type MeetingStatus = 'Draft' | 'Sent' | 'Confirmed' | 'Completed' | 'Declined' | 'Postponed' | 'No-show'
type MeetingType   = 'ORM' | 'Marcom'

interface Meeting {
  id: number; hotel: string; type: MeetingType; ownerAE: string
  tier: string; tierPct: number; orm: string; date: string; time: string
  status: MeetingStatus; surveyStatus: 'Pending' | 'Submitted' | 'N/A' | 'Overdue'; hotelStatus: string
}

const meetings: Meeting[] = [
  { id:  1, hotel: 'Riverside Krabi Resort',            type: 'ORM',    ownerAE: 'Somchai K.', tier: 'A', tierPct: 92, orm: 'Niran T.',   date: '2026-09-10', time: '09:00', status: 'Completed', surveyStatus: 'Submitted', hotelStatus: 'Active'    },
  { id:  2, hotel: 'Sunset Villa Phuket',               type: 'Marcom', ownerAE: 'Pranee S.',  tier: 'A', tierPct: 88, orm: 'Wanchai P.', date: '2026-09-12', time: '13:00', status: 'Completed', surveyStatus: 'Submitted', hotelStatus: 'Active'    },
  { id:  3, hotel: 'Bay Resort Pattaya',                type: 'ORM',    ownerAE: 'Somchai K.', tier: 'B', tierPct: 74, orm: 'Niran T.',   date: '2026-09-15', time: '09:00', status: 'Completed', surveyStatus: 'Overdue',   hotelStatus: 'Active'    },
  { id:  4, hotel: 'Ocean View Koh Samui',              type: 'Marcom', ownerAE: 'Wanchai P.', tier: 'A', tierPct: 95, orm: 'Pranee S.',  date: '2026-09-23', time: '15:00', status: 'Confirmed', surveyStatus: 'N/A',       hotelStatus: 'Active'    },
  { id:  5, hotel: 'Hillside Chiang Mai',               type: 'ORM',    ownerAE: 'Somchai K.', tier: 'B', tierPct: 80, orm: 'Niran T.',   date: '2026-09-25', time: '13:00', status: 'Confirmed', surveyStatus: 'N/A',       hotelStatus: 'Active'    },
  { id:  6, hotel: 'Azure Beach Hua Hin',               type: 'Marcom', ownerAE: 'Niran T.',   tier: 'B', tierPct: 65, orm: 'Wanchai P.', date: '2026-09-28', time: '09:00', status: 'Sent',      surveyStatus: 'N/A',       hotelStatus: 'Onboarding'},
  { id:  7, hotel: 'Palm Garden Rayong',                type: 'ORM',    ownerAE: 'Somchai K.', tier: 'C', tierPct: 50, orm: 'Niran T.',   date: '2026-09-30', time: '13:00', status: 'Sent',      surveyStatus: 'N/A',       hotelStatus: 'Onboarding'},
  { id:  8, hotel: 'Lagoon Resort Krabi',               type: 'Marcom', ownerAE: 'Pranee S.',  tier: 'B', tierPct: 71, orm: 'Wanchai P.', date: '2026-10-02', time: '15:00', status: 'Draft',     surveyStatus: 'N/A',       hotelStatus: 'Active'    },
  { id:  9, hotel: 'Mountain View Pai',                 type: 'ORM',    ownerAE: 'Wanchai P.', tier: 'C', tierPct: 45, orm: 'Niran T.',   date: '2026-10-05', time: '09:00', status: 'Draft',     surveyStatus: 'N/A',       hotelStatus: 'Active'    },
  { id: 10, hotel: 'Ocean View Phuket + Sunset Villa',  type: 'Marcom', ownerAE: 'Somchai K.', tier: 'A', tierPct: 90, orm: 'Pranee S.',  date: '2026-09-08', time: '13:00', status: 'Completed', surveyStatus: 'Submitted', hotelStatus: 'Active'    },
  { id: 11, hotel: 'Sea Breeze Trat',                   type: 'ORM',    ownerAE: 'Niran T.',   tier: 'C', tierPct: 52, orm: 'Wanchai P.', date: '2026-09-06', time: '09:00', status: 'Declined',  surveyStatus: 'N/A',       hotelStatus: 'Active'    },
  { id: 12, hotel: 'Hilltop View Chiang Rai',           type: 'Marcom', ownerAE: 'Pranee S.',  tier: 'A', tierPct: 85, orm: 'Niran T.',   date: '2026-09-18', time: '15:00', status: 'Postponed', surveyStatus: 'N/A',       hotelStatus: 'Active'    },
  { id: 13, hotel: 'Lotus Garden Sukhothai',            type: 'ORM',    ownerAE: 'Somchai K.', tier: 'B', tierPct: 68, orm: 'Wanchai P.', date: '2026-09-20', time: '13:00', status: 'No-show',   surveyStatus: 'N/A',       hotelStatus: 'Active'    },
]

const STATUS_STYLES: Record<MeetingStatus, { bg: string; text: string }> = {
  Draft:     { bg: '#F5F7FA', text: '#6B7280' },
  Sent:      { bg: '#FFF8E6', text: '#D97706' },
  Confirmed: { bg: '#EBF2FF', text: '#1A56DB' },
  Completed: { bg: '#F0FDF4', text: '#16A34A' },
  Declined:  { bg: '#FFF0F0', text: '#DC2626' },
  Postponed: { bg: '#F5F0FF', text: '#7C3AED' },
  'No-show': { bg: '#FFF3E0', text: '#B35A00' },
}

const SURVEY_STYLES: Record<string, { bg: string; text: string }> = {
  Submitted: { bg: '#F0FDF4', text: '#16A34A' },
  Overdue:   { bg: '#FFF0F0', text: '#DC2626' },
  Pending:   { bg: '#FFF8E6', text: '#D97706' },
  'N/A':     { bg: 'transparent', text: '#9CA3AF' },
}

export default function MeetingsTable() {
  const [filterStatus, setFilterStatus] = useState<MeetingStatus | 'All'>('All')
  const [filterType,   setFilterType]   = useState<MeetingType   | 'All'>('All')
  const [filterTier,   setFilterTier]   = useState('All')
  const [search, setSearch]             = useState('')
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null)
  const [postponeModal, setPostponeModal] = useState<Meeting | null>(null)
  const [postponeDate, setPostponeDate] = useState('')
  const [postponeReason, setPostponeReason] = useState('')

  const filtered = meetings.filter((m) => {
    if (filterStatus !== 'All' && m.status !== filterStatus) return false
    if (filterType   !== 'All' && m.type   !== filterType)   return false
    if (filterTier   !== 'All' && m.tier   !== filterTier)   return false
    if (search && !m.hotel.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const statuses: (MeetingStatus | 'All')[] = ['All','Draft','Sent','Confirmed','Completed','Declined','Postponed','No-show']

  return (
    <div className="h-full overflow-auto p-4 md:p-8">
      {/* Header */}
      <div className="mb-5 md:mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-heading text-xl md:text-2xl font-semibold" style={{ color: 'var(--color-text)' }}>
            Meetings
          </h1>
          <p className="text-xs md:text-sm mt-1 font-thai" style={{ color: 'var(--color-text-muted)' }}>
            รายการนัดหมายทั้งหมด · {meetings.length} รายการ
          </p>
        </div>
        <button className="btn-primary">+ New Meeting</button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-5">
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl border flex-1 min-w-[160px]"
          style={{ background: '#fff', borderColor: 'var(--color-border)' }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
            <circle cx="6" cy="6" r="4.5" stroke="#9CA3AF" strokeWidth="1.4"/>
            <path d="M10 10l2.5 2.5" stroke="#9CA3AF" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาชื่อโรงแรม..."
            className="flex-1 text-sm bg-transparent outline-none font-thai"
            style={{ color: 'var(--color-text)' }}
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as MeetingStatus | 'All')}
          className="text-sm px-3 py-2 rounded-xl border outline-none"
          style={{ background: '#fff', borderColor: 'var(--color-border)', color: 'var(--color-text-2)' }}
        >
          {statuses.map((s) => <option key={s} value={s}>{s === 'All' ? 'All Status' : s}</option>)}
        </select>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as MeetingType | 'All')}
          className="text-sm px-3 py-2 rounded-xl border outline-none"
          style={{ background: '#fff', borderColor: 'var(--color-border)', color: 'var(--color-text-2)' }}
        >
          <option value="All">All Types</option>
          <option value="ORM">ORM</option>
          <option value="Marcom">Marcom</option>
        </select>
        <select
          value={filterTier}
          onChange={(e) => setFilterTier(e.target.value)}
          className="text-sm px-3 py-2 rounded-xl border outline-none"
          style={{ background: '#fff', borderColor: 'var(--color-border)', color: 'var(--color-text-2)' }}
        >
          <option value="All">All Tiers</option>
          <option value="A">Tier A</option>
          <option value="B">Tier B</option>
          <option value="C">Tier C</option>
        </select>
      </div>

      {/* Mobile: Card list */}
      <div className="md:hidden space-y-3 pb-8">
        {filtered.map((m) => {
          const ss  = STATUS_STYLES[m.status]
          const svs = SURVEY_STYLES[m.surveyStatus]
          return (
            <div
              key={m.id}
              className="rounded-2xl border bg-white p-4 cursor-pointer transition-all hover:shadow-md"
              style={{ borderColor: 'var(--color-border)', boxShadow: '0 1px 4px rgba(0,0,0,.04)' }}
              onClick={() => setSelectedMeeting(m)}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="font-semibold text-sm leading-tight" style={{ color: 'var(--color-text)' }}>
                  {m.hotel}
                </div>
                <span className="badge shrink-0" style={{ background: ss.bg, color: ss.text }}>{m.status}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 mb-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                <span
                  className="badge"
                  style={{
                    background: m.type === 'ORM' ? '#EBF2FF' : '#F0FDF4',
                    color:      m.type === 'ORM' ? '#1A56DB' : '#0A7A3E',
                    padding: '2px 8px',
                  }}
                >
                  {m.type}
                </span>
                <span>{m.date} · {m.time}</span>
                <span>Tier {m.tier}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {m.ownerAE} · {m.orm}
                </span>
                {m.surveyStatus !== 'N/A' && (
                  <span className="badge" style={{ background: svs.bg, color: svs.text }}>
                    Survey: {m.surveyStatus}
                  </span>
                )}
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-sm font-thai" style={{ color: 'var(--color-text-muted)' }}>
            ไม่พบรายการที่ตรงกับเงื่อนไข
          </div>
        )}
      </div>

      {/* Desktop: Table */}
      <div
        className="hidden md:block rounded-2xl border overflow-hidden bg-white"
        style={{ borderColor: 'var(--color-border)', boxShadow: '0 2px 8px rgba(0,0,0,.04)' }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'var(--color-surface)' }}>
              {['Hotel', 'Type', 'Owner AE', 'Tier', 'ORM', 'Date & Time', 'Status', 'Survey', 'Actions'].map((h) => (
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
            {filtered.map((m, i) => {
              const ss  = STATUS_STYLES[m.status]
              const svs = SURVEY_STYLES[m.surveyStatus]
              const tc  = m.tier === 'A' ? { bg: '#EBF2FF', text: '#1A56DB' }
                        : m.tier === 'B' ? { bg: '#F0FDF4', text: '#16A34A' }
                        :                  { bg: '#F5F7FA', text: '#6B7280' }
              return (
                <tr
                  key={m.id}
                  className="border-b cursor-pointer transition-colors hover:bg-blue-50/20"
                  style={{ borderColor: 'var(--color-border)', background: i % 2 === 0 ? 'transparent' : '#FAFBFC' }}
                  onClick={() => setSelectedMeeting(m)}
                >
                  <td className="px-4 py-3">
                    <div className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>{m.hotel}</div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{m.hotelStatus}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="badge"
                      style={{
                        background: m.type === 'ORM' ? '#EBF2FF' : '#F0FDF4',
                        color:      m.type === 'ORM' ? '#1A56DB' : '#0A7A3E',
                      }}
                    >
                      {m.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--color-text-2)' }}>{m.ownerAE}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="badge" style={{ background: tc.bg, color: tc.text }}>{m.tier}</span>
                      <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{m.tierPct}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--color-text-2)' }}>{m.orm}</td>
                  <td className="px-4 py-3">
                    <div className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>{m.date}</div>
                    <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{m.time}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="badge" style={{ background: ss.bg, color: ss.text }}>{m.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="badge" style={{ background: svs.bg, color: svs.text }}>{m.surveyStatus}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="btn-ghost text-xs py-1 px-2"
                        onClick={() => setSelectedMeeting(m)}
                      >
                        View
                      </button>
                      {(m.status === 'Confirmed' || m.status === 'Sent') && (
                        <button
                          className="badge cursor-pointer hover:opacity-80"
                          style={{ background: '#FFF8E6', color: '#D97706' }}
                          onClick={() => setPostponeModal(m)}
                        >
                          Postpone
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-sm font-thai" style={{ color: 'var(--color-text-muted)' }}>
            ไม่พบรายการที่ตรงกับเงื่อนไข
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedMeeting && (
        <div className="fixed inset-0 bg-black/30 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="w-full max-w-md rounded-2xl p-6 bg-white shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <span
                  className="badge"
                  style={{
                    background: selectedMeeting.type === 'ORM' ? '#EBF2FF' : '#F0FDF4',
                    color:      selectedMeeting.type === 'ORM' ? '#1A56DB' : '#0A7A3E',
                  }}
                >
                  {selectedMeeting.type}
                </span>
                <span
                  className="badge"
                  style={{ background: STATUS_STYLES[selectedMeeting.status].bg, color: STATUS_STYLES[selectedMeeting.status].text }}
                >
                  {selectedMeeting.status}
                </span>
              </div>
              <button
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                onClick={() => setSelectedMeeting(null)}
                style={{ color: 'var(--color-text-muted)' }}
              >✕</button>
            </div>
            <h2 className="font-heading text-xl font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
              {selectedMeeting.hotel}
            </h2>
            <p className="text-sm mb-5 font-thai" style={{ color: 'var(--color-text-muted)' }}>
              {selectedMeeting.date} · {selectedMeeting.time}
            </p>
            <div className="grid grid-cols-2 gap-2 mb-5">
              {[
                ['Owner AE', selectedMeeting.ownerAE],
                ['ORM', selectedMeeting.orm],
                ['Tier', `${selectedMeeting.tier} (${selectedMeeting.tierPct}%)`],
                ['Survey', selectedMeeting.surveyStatus],
              ].map(([label, value]) => (
                <div key={label} className="px-3 py-2.5 rounded-xl" style={{ background: 'var(--color-surface)' }}>
                  <div className="text-xs mb-0.5" style={{ color: 'var(--color-text-muted)' }}>{label}</div>
                  <div className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{value}</div>
                </div>
              ))}
            </div>
            {selectedMeeting.status === 'Confirmed' && (
              <button
                className="w-full py-2.5 rounded-xl text-sm font-bold"
                style={{ background: '#FFF8E6', color: '#D97706' }}
                onClick={() => { setPostponeModal(selectedMeeting); setSelectedMeeting(null) }}
              >
                Postpone Meeting
              </button>
            )}
          </div>
        </div>
      )}

      {/* Postpone Modal */}
      {postponeModal && (
        <div className="fixed inset-0 bg-black/30 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="w-full max-w-sm rounded-2xl p-6 bg-white shadow-2xl">
            <h3 className="font-heading text-lg font-semibold mb-1" style={{ color: 'var(--color-text)' }}>เลื่อนนัดหมาย</h3>
            <p className="text-sm mb-4 font-thai" style={{ color: 'var(--color-text-muted)' }}>{postponeModal.hotel}</p>
            <div className="space-y-3 mb-5">
              <div>
                <label className="text-xs font-bold mb-1.5 block" style={{ color: 'var(--color-text-muted)' }}>วันที่ใหม่</label>
                <input
                  type="date"
                  value={postponeDate}
                  onChange={(e) => setPostponeDate(e.target.value)}
                  className="w-full text-sm px-3 py-2.5 rounded-xl border outline-none"
                  style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                />
              </div>
              <div>
                <label className="text-xs font-bold mb-1.5 block" style={{ color: 'var(--color-text-muted)' }}>เหตุผล</label>
                <textarea
                  value={postponeReason}
                  onChange={(e) => setPostponeReason(e.target.value)}
                  className="w-full text-sm px-3 py-2.5 rounded-xl border outline-none resize-none font-thai"
                  rows={3}
                  placeholder="ระบุเหตุผลในการเลื่อนนัด..."
                  style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button className="btn-primary flex-1 text-center" onClick={() => setPostponeModal(null)}>ยืนยันเลื่อน</button>
              <button className="btn-ghost flex-1 text-center" onClick={() => setPostponeModal(null)}>ยกเลิก</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
