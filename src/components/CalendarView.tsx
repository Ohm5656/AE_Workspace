import { useState } from 'react'

interface CalMeeting {
  id: number
  hotel: string
  type: 'ORM' | 'Marcom'
  status: 'Draft' | 'Waiting Confirm' | 'Confirmed' | 'Completed'
  day: number
  time: string
  tier: string
}

interface UnassignedHotel {
  id: number
  name: string
  tier: 'A' | 'B' | 'C'
}

const initialMeetings: CalMeeting[] = [
  { id: 1, hotel: 'Riverside Krabi Resort',  type: 'ORM',    status: 'Confirmed',      day: 2,  time: '09:00', tier: 'A' },
  { id: 2, hotel: 'Sunset Villa Phuket',     type: 'Marcom', status: 'Confirmed',      day: 3,  time: '13:00', tier: 'A' },
  { id: 3, hotel: 'Bay Resort Pattaya',      type: 'ORM',    status: 'Draft',          day: 5,  time: '09:00', tier: 'B' },
  { id: 4, hotel: 'Ocean View Koh Samui',    type: 'Marcom', status: 'Waiting Confirm',day: 8,  time: '15:00', tier: 'A' },
  { id: 5, hotel: 'Hillside Chiang Mai',     type: 'ORM',    status: 'Confirmed',      day: 10, time: '13:00', tier: 'B' },
  { id: 6, hotel: 'Azure Beach Hua Hin',     type: 'Marcom', status: 'Completed',      day: 15, time: '09:00', tier: 'B' },
  { id: 7, hotel: 'Palm Garden Rayong',      type: 'ORM',    status: 'Waiting Confirm',day: 17, time: '13:00', tier: 'C' },
  { id: 8, hotel: 'Lagoon Resort Krabi',     type: 'Marcom', status: 'Draft',          day: 20, time: '15:00', tier: 'B' },
  { id: 9, hotel: 'Mountain View Pai',       type: 'ORM',    status: 'Confirmed',      day: 22, time: '09:00', tier: 'C' },
]

const unassignedInit: UnassignedHotel[] = [
  { id: 1, name: 'The Harbor Pattaya',       tier: 'A' },
  { id: 2, name: 'Coral Bay Samui',          tier: 'A' },
  { id: 3, name: 'Dune Resort Krabi',        tier: 'A' },
  { id: 4, name: 'Sea Breeze Trat',          tier: 'A' },
  { id: 5, name: 'Jungle Lodge Kanchanaburi',tier: 'B' },
  { id: 6, name: 'Baan Suan Pattaya',        tier: 'B' },
]

const weekDays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const times    = ['09:00','11:00','13:00','15:00','17:00']

function statusStyle(status: CalMeeting['status'], type: CalMeeting['type']) {
  if (status === 'Confirmed')      return type === 'ORM' ? { bg: '#1A56DB', text: '#fff' }   : { bg: '#0A7A3E', text: '#fff' }
  if (status === 'Waiting Confirm') return { bg: '#FFF8E6', text: '#D97706' }
  if (status === 'Draft')           return { bg: '#F5F7FA', text: '#6B7280' }
  if (status === 'Completed')       return { bg: '#F0FDF4', text: '#16A34A' }
  return { bg: '#F5F7FA', text: '#6B7280' }
}

const statusSummary = [
  { label: 'Draft',    count: 4, color: '#9CA3AF' },
  { label: 'Waiting',  count: 4, color: '#D97706' },
  { label: 'Confirmed',count: 3, color: '#1A56DB' },
  { label: 'Completed',count: 3, color: '#16A34A' },
  { label: 'Rejected', count: 1, color: '#DC2626' },
  { label: 'Postponed',count: 1, color: '#7C3AED' },
]

export default function CalendarView() {
  const [meetings, setMeetings]     = useState<CalMeeting[]>(initialMeetings)
  const [dragHotel, setDragHotel]   = useState<UnassignedHotel | null>(null)
  const [scheduleModal, setScheduleModal] = useState<{ hotel: UnassignedHotel; day: number } | null>(null)
  const [selectedMeeting, setSelectedMeeting] = useState<CalMeeting | null>(null)
  const [newType, setNewType]       = useState<'ORM' | 'Marcom'>('ORM')
  const [newTime, setNewTime]       = useState('09:00')
  const [syncTime, setSyncTime]     = useState('Today, 09:34 AM')
  const [unassigned, setUnassigned] = useState(unassignedInit)
  const [filterType, setFilterType] = useState<'All' | 'ORM' | 'Marcom'>('All')
  const [showUnassigned, setShowUnassigned] = useState(false)

  function handleDrop(day: number) {
    if (dragHotel) { setScheduleModal({ hotel: dragHotel, day }); setDragHotel(null) }
  }

  function confirmSchedule() {
    if (!scheduleModal) return
    setMeetings((prev) => [
      ...prev,
      { id: prev.length + 100, hotel: scheduleModal.hotel.name, type: newType, status: 'Draft', day: scheduleModal.day, time: newTime, tier: scheduleModal.hotel.tier },
    ])
    setUnassigned((prev) => prev.filter((h) => h.id !== scheduleModal.hotel.id))
    setScheduleModal(null)
  }

  function sync() {
    const now = new Date()
    setSyncTime(`${now.getHours()}:${String(now.getMinutes()).padStart(2,'0')} · ${now.getDate()} Sep`)
  }

  const tierA = unassigned.filter((h) => h.tier === 'A')
  const tierB = unassigned.filter((h) => h.tier === 'B')

  const days = Array.from({ length: 30 }, (_, i) => i + 1)

  return (
    <div className="h-full overflow-auto p-4 md:p-8">
      {/* Header */}
      <div className="mb-5 md:mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-heading text-xl md:text-2xl font-semibold" style={{ color: 'var(--color-text)' }}>Calendar</h1>
          <p className="text-xs md:text-sm mt-1 font-thai" style={{ color: 'var(--color-text-muted)' }}>
            ปฏิทินนัดหมาย ORM & Marcom · September 2026
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs hidden sm:block" style={{ color: 'var(--color-text-muted)' }}>Synced: {syncTime}</span>
          <button className="btn-ghost text-xs" onClick={sync} style={{ color: 'var(--color-navy)', borderColor: '#C7D7FF' }}>⟳ Sync ORM</button>
          <button className="btn-ghost text-xs" onClick={sync} style={{ color: 'var(--color-forest)', borderColor: '#A7F0C4' }}>⟳ Sync Marcom</button>
          <button
            className="btn-ghost text-xs md:hidden"
            onClick={() => setShowUnassigned(!showUnassigned)}
            style={{ color: 'var(--color-text-2)' }}
          >
            Hotels ({unassigned.length})
          </button>
        </div>
      </div>

      {/* Mobile unassigned panel */}
      {showUnassigned && (
        <div className="md:hidden mb-4 rounded-2xl border bg-white p-4" style={{ borderColor: 'var(--color-border)' }}>
          <div className="text-xs font-bold mb-3" style={{ color: 'var(--color-text)' }}>Un-assigned Hotels</div>
          <div className="flex flex-wrap gap-2">
            {unassigned.map((h) => (
              <button
                key={h.id}
                className="text-xs px-3 py-1.5 rounded-xl border font-medium"
                style={{
                  background: h.tier === 'A' ? '#EBF2FF' : '#F0FDF4',
                  borderColor: h.tier === 'A' ? '#C7D7FF' : '#A7F0C4',
                  color: h.tier === 'A' ? '#1A56DB' : '#16A34A',
                }}
                onClick={() => setScheduleModal({ hotel: h, day: 23 })}
              >
                {h.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-5">
        {/* Calendar */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Status summary */}
          <div className="flex flex-wrap gap-3 p-3 rounded-2xl border bg-white" style={{ borderColor: 'var(--color-border)' }}>
            {statusSummary.map((s) => (
              <div key={s.label} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{s.label}</span>
                <span className="text-xs font-bold" style={{ color: 'var(--color-text)' }}>{s.count}</span>
              </div>
            ))}
            <div className="ml-auto flex gap-1.5">
              {(['All', 'ORM', 'Marcom'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className="text-xs px-2.5 py-1 rounded-lg transition-all font-semibold"
                  style={{
                    background: filterType === t ? 'var(--color-navy)' : 'var(--color-surface)',
                    color:      filterType === t ? '#fff' : 'var(--color-text-muted)',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          <div className="rounded-2xl border bg-white overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
            <div className="grid grid-cols-7 border-b" style={{ borderColor: 'var(--color-border)' }}>
              {weekDays.map((d) => (
                <div key={d} className="py-2 text-center text-xs font-bold" style={{ color: 'var(--color-text-muted)' }}>
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {/* Sep 2026 starts Tuesday — offset 2 */}
              {[0, 1].map((i) => (
                <div key={i} className="border-b border-r min-h-[70px] md:min-h-[80px]" style={{ borderColor: 'var(--color-border)' }} />
              ))}
              {days.map((day) => {
                const dayMeetings = meetings.filter((m) => m.day === day && (filterType === 'All' || m.type === filterType))
                const isToday = day === 23
                return (
                  <div
                    key={day}
                    className="border-b border-r min-h-[70px] md:min-h-[80px] p-1 md:p-1.5 transition-colors cursor-pointer hover:bg-blue-50/30"
                    style={{ borderColor: 'var(--color-border)', background: isToday ? '#EBF2FF40' : 'transparent' }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop(day)}
                  >
                    <div
                      className="text-xs font-bold mb-1 w-5 h-5 flex items-center justify-center rounded-full"
                      style={{
                        background: isToday ? 'var(--color-navy)' : 'transparent',
                        color:      isToday ? '#fff' : 'var(--color-text-muted)',
                        boxShadow:  isToday ? '0 2px 8px rgba(26,86,219,.4)' : 'none',
                      }}
                    >
                      {day}
                    </div>
                    <div className="space-y-0.5">
                      {dayMeetings.slice(0, 2).map((m) => {
                        const sc = statusStyle(m.status, m.type)
                        return (
                          <div
                            key={m.id}
                            className="text-xs px-1 py-0.5 rounded-lg truncate cursor-pointer transition-opacity hover:opacity-80"
                            style={{ background: sc.bg, color: sc.text, fontSize: '10px' }}
                            onClick={() => setSelectedMeeting(m)}
                          >
                            {m.time} {m.hotel.split(' ')[0]}
                          </div>
                        )
                      })}
                      {dayMeetings.length > 2 && (
                        <div className="text-xs" style={{ color: 'var(--color-text-muted)', fontSize: '10px' }}>
                          +{dayMeetings.length - 2}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Un-assign box (desktop only) */}
        <div className="hidden md:block w-56 shrink-0">
          <div className="rounded-2xl border bg-white overflow-hidden sticky top-4" style={{ borderColor: 'var(--color-border)' }}>
            <div className="px-3 py-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <div className="text-xs font-bold" style={{ color: 'var(--color-text)' }}>Un-assigned Hotels</div>
              <div className="text-xs mt-0.5 font-thai" style={{ color: 'var(--color-text-muted)' }}>ลากลงปฏิทิน</div>
            </div>
            <div className="p-2 space-y-3 max-h-[60vh] overflow-y-auto">
              {tierA.length > 0 && (
                <div>
                  <div className="text-xs font-bold px-1 mb-1.5" style={{ color: '#1A56DB' }}>
                    Tier A Required ({tierA.length})
                  </div>
                  {tierA.map((h) => (
                    <div
                      key={h.id}
                      draggable
                      onDragStart={() => setDragHotel(h)}
                      className="flex items-center gap-2 px-2 py-2 rounded-xl border mb-1.5 cursor-grab hover:shadow-sm transition-all active:cursor-grabbing"
                      style={{ background: '#EBF2FF', borderColor: '#C7D7FF' }}
                    >
                      <span className="text-xs opacity-50">⠿</span>
                      <span className="text-xs font-semibold truncate" style={{ color: '#1A56DB' }}>{h.name}</span>
                    </div>
                  ))}
                </div>
              )}
              {tierB.length > 0 && (
                <div>
                  <div className="text-xs font-bold px-1 mb-1.5" style={{ color: '#16A34A' }}>
                    Tier B Optional ({tierB.length})
                  </div>
                  {tierB.map((h) => (
                    <div
                      key={h.id}
                      draggable
                      onDragStart={() => setDragHotel(h)}
                      className="flex items-center gap-2 px-2 py-2 rounded-xl border mb-1.5 cursor-grab hover:shadow-sm transition-all active:cursor-grabbing"
                      style={{ background: '#F0FDF4', borderColor: '#A7F0C4' }}
                    >
                      <span className="text-xs opacity-50">⠿</span>
                      <span className="text-xs font-semibold truncate" style={{ color: '#16A34A' }}>{h.name}</span>
                    </div>
                  ))}
                </div>
              )}
              {unassigned.length === 0 && (
                <div className="text-center py-6 text-xs font-thai" style={{ color: 'var(--color-text-muted)' }}>
                  จัดทุกโรงแรมเรียบร้อย 🎉
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Modal */}
      {scheduleModal && (
        <div className="fixed inset-0 bg-black/30 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="w-full max-w-sm rounded-2xl p-6 bg-white shadow-2xl">
            <h3 className="font-heading text-lg font-semibold mb-1" style={{ color: 'var(--color-text)' }}>สร้างนัดหมาย</h3>
            <p className="text-sm mb-5 font-thai" style={{ color: 'var(--color-text-muted)' }}>
              {scheduleModal.hotel.name} · {scheduleModal.day} Sep 2026
            </p>
            <div className="space-y-4 mb-5">
              <div>
                <label className="text-xs font-bold mb-2 block" style={{ color: 'var(--color-text-muted)' }}>ประเภทประชุม</label>
                <div className="flex gap-2">
                  {(['ORM', 'Marcom'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setNewType(t)}
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all"
                      style={{
                        background:  newType === t ? (t === 'ORM' ? '#1A56DB' : '#0A7A3E') : '#fff',
                        color:       newType === t ? '#fff' : 'var(--color-text-2)',
                        borderColor: newType === t ? (t === 'ORM' ? '#1A56DB' : '#0A7A3E') : 'var(--color-border)',
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold mb-2 block" style={{ color: 'var(--color-text-muted)' }}>เวลา</label>
                <div className="flex flex-wrap gap-2">
                  {times.map((t) => (
                    <button
                      key={t}
                      onClick={() => setNewTime(t)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold border-2 transition-all"
                      style={{
                        background:  newTime === t ? 'var(--color-navy)' : '#fff',
                        color:       newTime === t ? '#fff' : 'var(--color-text-2)',
                        borderColor: newTime === t ? 'var(--color-navy)' : 'var(--color-border)',
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="btn-primary flex-1 text-center" onClick={confirmSchedule}>สร้าง Draft</button>
              <button className="btn-ghost flex-1 text-center" onClick={() => setScheduleModal(null)}>ยกเลิก</button>
            </div>
          </div>
        </div>
      )}

      {/* Meeting detail */}
      {selectedMeeting && (
        <div className="fixed inset-0 bg-black/30 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="w-full max-w-sm rounded-2xl p-6 bg-white shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <span
                className="badge"
                style={(() => { const sc = statusStyle(selectedMeeting.status, selectedMeeting.type); return { background: sc.bg, color: sc.text } })()}
              >
                {selectedMeeting.type} · {selectedMeeting.status}
              </span>
              <button
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                onClick={() => setSelectedMeeting(null)}
                style={{ color: 'var(--color-text-muted)' }}
              >✕</button>
            </div>
            <h3 className="font-heading text-lg font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
              {selectedMeeting.hotel}
            </h3>
            <p className="text-sm mb-5 font-thai" style={{ color: 'var(--color-text-muted)' }}>
              {selectedMeeting.day} Sep 2026 · {selectedMeeting.time}
            </p>
            {(selectedMeeting.status === 'Draft' || selectedMeeting.status === 'Waiting Confirm') && (
              <button
                className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                style={{ background: 'var(--color-forest)', boxShadow: '0 2px 8px rgba(10,122,62,.3)' }}
                onClick={() => {
                  setMeetings((prev) => prev.map((m) => m.id === selectedMeeting.id ? { ...m, status: 'Confirmed' } : m))
                  setSelectedMeeting(null)
                }}
              >
                Confirm Meeting ✓
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
