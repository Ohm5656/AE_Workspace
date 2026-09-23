import { useState } from 'react'
import { type Meeting, type MeetingStatus, useMeetings } from './MeetingContext'
import { useWorkspaceShell } from './WorkspaceShellContext'

interface UnassignedHotel {
  id: number
  name: string
  tier: 'A' | 'B' | 'C'
}

const unassignedInit: UnassignedHotel[] = [
  { id: 1, name: 'The Harbor Pattaya',       tier: 'A' },
  { id: 2, name: 'Coral Bay Samui',          tier: 'A' },
  { id: 3, name: 'Dune Resort Krabi',        tier: 'A' },
  { id: 4, name: 'Sea Breeze Trat',          tier: 'A' },
  { id: 5, name: 'Jungle Lodge Kanchanaburi',tier: 'B' },
  { id: 6, name: 'Baan Suan Pattaya',        tier: 'B' },
  { id: 7, name: 'Forest Retreat Nan',        tier: 'C' },
  { id: 8, name: 'River House Ayutthaya',     tier: 'C' },
]

const weekDays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const times    = ['09:00','11:00','13:00','15:00','17:00']

function statusStyle(status: MeetingStatus, type: Meeting['type']) {
  if (status === 'Confirmed')      return type === 'ORM' ? { bg: '#1A56DB', text: '#fff' }   : { bg: '#0A7A3E', text: '#fff' }
  if (status === 'Waiting Confirm') return { bg: '#FFF8E6', text: '#D97706' }
  if (status === 'Draft')           return { bg: '#F5F7FA', text: '#6B7280' }
  if (status === 'Completed')       return { bg: '#F0FDF4', text: '#16A34A' }
  if (status === 'Sent')            return { bg: '#FFF8E6', text: '#D97706' }
  if (status === 'Declined')        return { bg: '#FFF0F0', text: '#DC2626' }
  if (status === 'Postponed')       return { bg: '#F5F0FF', text: '#7C3AED' }
  if (status === 'No-show')         return { bg: '#FFF3E0', text: '#B35A00' }
  return { bg: '#F5F7FA', text: '#6B7280' }
}

const summaryStatuses: { label: MeetingStatus; color: string }[] = [
  { label: 'Draft', color: '#9CA3AF' },
  { label: 'Sent', color: '#D97706' },
  { label: 'Waiting Confirm', color: '#F59E0B' },
  { label: 'Confirmed', color: '#1A56DB' },
  { label: 'Completed', color: '#16A34A' },
  { label: 'Declined', color: '#DC2626' },
  { label: 'Postponed', color: '#7C3AED' },
  { label: 'No-show', color: '#B35A00' },
]

export default function CalendarView() {
  const { meetings, addMeeting, updateMeeting } = useMeetings()
  const { addNotification } = useWorkspaceShell()
  const [dragHotel, setDragHotel]   = useState<UnassignedHotel | null>(null)
  const [scheduleModal, setScheduleModal] = useState<{ hotel: UnassignedHotel; day: number } | null>(null)
  const [selectedMeetingId, setSelectedMeetingId] = useState<number | null>(null)
  const [newType, setNewType]       = useState<'ORM' | 'Marcom'>('ORM')
  const [newTime, setNewTime]       = useState('09:00')
  const [syncTimes, setSyncTimes] = useState({ ORM: 'Today, 09:34 AM', Marcom: 'Today, 09:34 AM' })
  const [syncing, setSyncing] = useState<'ORM' | 'Marcom' | null>(null)
  const [unassigned, setUnassigned] = useState(unassignedInit)
  const [filterType, setFilterType] = useState<'All' | 'ORM' | 'Marcom'>('All')
  const [showUnassigned, setShowUnassigned] = useState(false)

  function handleDrop(day: number) {
    if (dragHotel) { setScheduleModal({ hotel: dragHotel, day }); setDragHotel(null) }
  }

  function confirmSchedule() {
    if (!scheduleModal) return
    addMeeting({
      hotel: scheduleModal.hotel.name,
      type: newType,
      status: 'Draft',
      date: `2026-09-${String(scheduleModal.day).padStart(2, '0')}`,
      time: newTime,
      tier: scheduleModal.hotel.tier,
      tierPct: scheduleModal.hotel.tier === 'A' ? 90 : scheduleModal.hotel.tier === 'B' ? 70 : 50,
      ownerAE: 'Somchai K.',
      orm: newType === 'ORM' ? 'Niran T.' : 'Wanchai P.',
      surveyStatus: 'N/A',
      hotelStatus: 'Active',
    })
    setUnassigned((prev) => prev.filter((h) => h.id !== scheduleModal.hotel.id))
    addNotification({
      title: 'Meeting draft created',
      description: `${scheduleModal.hotel.name} · ${scheduleModal.day} Sep at ${newTime}`,
      type: 'success',
      target: 'meetings',
    })
    setScheduleModal(null)
  }

  function sync(type: 'ORM' | 'Marcom') {
    const now = new Date()
    setSyncing(type)
    setSyncTimes((current) => ({
      ...current,
      [type]: `${now.getHours()}:${String(now.getMinutes()).padStart(2,'0')} · ${now.getDate()} Sep`,
    }))
    window.setTimeout(() => setSyncing(null), 700)
  }

  const tierA = unassigned.filter((h) => h.tier === 'A')
  const tierB = unassigned.filter((h) => h.tier === 'B')
  const tierC = unassigned.filter((h) => h.tier === 'C')

  const calendarMeetings = meetings.filter((meeting) => meeting.date.startsWith('2026-09-'))
  const selectedMeeting = meetings.find((meeting) => meeting.id === selectedMeetingId) ?? null
  const selectedTimeUnavailable = scheduleModal
    ? meetings.some((meeting) => meeting.date === `2026-09-${String(scheduleModal.day).padStart(2, '0')}` && meeting.time === newTime && meeting.status !== 'Declined')
    : false

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
          <span className="text-xs hidden lg:block" style={{ color: 'var(--color-text-muted)' }}>ORM: {syncTimes.ORM} · Marcom: {syncTimes.Marcom}</span>
          <button className="btn-ghost text-xs" onClick={() => sync('ORM')} style={{ color: 'var(--color-navy)', borderColor: '#C7D7FF' }}>{syncing === 'ORM' ? 'Syncing…' : '⟳ Sync ORM'}</button>
          <button className="btn-ghost text-xs" onClick={() => sync('Marcom')} style={{ color: 'var(--color-forest)', borderColor: '#A7F0C4' }}>{syncing === 'Marcom' ? 'Syncing…' : '⟳ Sync Marcom'}</button>
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
                  background: h.tier === 'A' ? '#EBF2FF' : h.tier === 'B' ? '#F0FDF4' : '#F5F7FA',
                  borderColor: h.tier === 'A' ? '#C7D7FF' : h.tier === 'B' ? '#A7F0C4' : '#E5E7EB',
                  color: h.tier === 'A' ? '#1A56DB' : h.tier === 'B' ? '#16A34A' : '#6B7280',
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
            {summaryStatuses.map((s) => (
              <div key={s.label} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{s.label === 'Waiting Confirm' ? 'Waiting' : s.label}</span>
                <span className="text-xs font-bold" style={{ color: 'var(--color-text)' }}>{calendarMeetings.filter((meeting) => meeting.status === s.label).length}</span>
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
                const dayMeetings = calendarMeetings.filter((m) => Number(m.date.slice(-2)) === day && (filterType === 'All' || m.type === filterType))
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
                            onClick={() => setSelectedMeetingId(m.id)}
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
              {tierC.length > 0 && (
                <div>
                  <div className="text-xs font-bold px-1 mb-1.5" style={{ color: '#6B7280' }}>
                    Tier C Optional ({tierC.length})
                  </div>
                  {tierC.map((h) => (
                    <div
                      key={h.id}
                      draggable
                      onDragStart={() => setDragHotel(h)}
                      className="flex items-center gap-2 px-2 py-2 rounded-xl border mb-1.5 cursor-grab hover:shadow-sm transition-all active:cursor-grabbing"
                      style={{ background: '#F5F7FA', borderColor: '#E5E7EB' }}
                    >
                      <span className="text-xs opacity-50">⠿</span>
                      <span className="text-xs font-semibold truncate" style={{ color: '#6B7280' }}>{h.name}</span>
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
                    (() => {
                      const unavailable = meetings.some((meeting) => meeting.date === `2026-09-${String(scheduleModal.day).padStart(2, '0')}` && meeting.time === t && meeting.status !== 'Declined')
                      return (
                    <button
                      key={t}
                      onClick={() => setNewTime(t)}
                      disabled={unavailable}
                      title={unavailable ? 'ช่วงเวลานี้ไม่ว่าง' : 'ช่วงเวลาว่าง'}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold border-2 transition-all disabled:cursor-not-allowed disabled:opacity-35"
                      style={{
                        background:  newTime === t ? 'var(--color-navy)' : '#fff',
                        color:       newTime === t ? '#fff' : 'var(--color-text-2)',
                        borderColor: newTime === t ? 'var(--color-navy)' : 'var(--color-border)',
                      }}
                    >
                      {t}{unavailable ? ' · Busy' : ''}
                    </button>
                      )
                    })()
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="btn-primary flex-1 text-center disabled:cursor-not-allowed disabled:opacity-40" disabled={selectedTimeUnavailable} onClick={confirmSchedule}>สร้าง Draft</button>
              <button className="btn-ghost flex-1 text-center" onClick={() => setScheduleModal(null)}>ยกเลิก</button>
            </div>
            {selectedTimeUnavailable && (
              <p className="mt-2 text-center text-xs font-thai" style={{ color: '#DC2626' }}>ช่วงเวลานี้ไม่ว่าง กรุณาเลือกเวลาอื่น</p>
            )}
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
                onClick={() => setSelectedMeetingId(null)}
                style={{ color: 'var(--color-text-muted)' }}
              >✕</button>
            </div>
            <h3 className="font-heading text-lg font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
              {selectedMeeting.hotel}
            </h3>
            <p className="text-sm mb-5 font-thai" style={{ color: 'var(--color-text-muted)' }}>
              {Number(selectedMeeting.date.slice(-2))} Sep 2026 · {selectedMeeting.time}
            </p>
            {(['Draft', 'Sent', 'Waiting Confirm'] as MeetingStatus[]).includes(selectedMeeting.status) && (
              <button
                className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                style={{ background: 'var(--color-forest)', boxShadow: '0 2px 8px rgba(10,122,62,.3)' }}
                onClick={() => {
                  const nextStatus: MeetingStatus = selectedMeeting.status === 'Draft'
                    ? 'Sent'
                    : selectedMeeting.status === 'Sent'
                      ? 'Waiting Confirm'
                      : 'Confirmed'
                  updateMeeting(selectedMeeting.id, { status: nextStatus })
                  addNotification({
                    title: `Meeting ${nextStatus}`,
                    description: `${selectedMeeting.hotel} · ${selectedMeeting.date} ${selectedMeeting.time}`,
                    type: nextStatus === 'Confirmed' ? 'success' : 'info',
                    target: 'meetings',
                  })
                  setSelectedMeetingId(null)
                }}
              >
                {selectedMeeting.status === 'Draft' ? 'Send Invitation →' : selectedMeeting.status === 'Sent' ? 'Mark Waiting Confirm →' : 'Confirm Meeting ✓'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
