import { useState } from 'react'
import { useWorkspaceShell } from './WorkspaceShellContext'

type Stage = 'New Property' | 'Introduction & Sent Form' | 'Collect Data' | '1st Check & Follow up' | 'Property Pending' | 'Final Check'

interface Hotel {
  id: number
  name: string
  owner: string
  tier: string
  stage: Stage
  hoursInStage: number
  sla: number
  isMyHotel: boolean
}

interface Activity {
  id: number
  hotel: string
  actor: string
  owner: string
  action: string
  time: string
}

const stages: { name: Stage; sla: number }[] = [
  { name: 'New Property',               sla: 24 },
  { name: 'Introduction & Sent Form',   sla: 24 },
  { name: 'Collect Data',               sla: 72 },
  { name: '1st Check & Follow up',      sla: 24 },
  { name: 'Property Pending',           sla: 48 },
  { name: 'Final Check',                sla: 24 },
]

const initialHotels: Hotel[] = [
  { id:  1, name: 'Azure Beach Hua Hin',       owner: 'Somchai K.',  tier: 'A', stage: 'New Property',             hoursInStage:  8, sla: 24, isMyHotel: true  },
  { id:  2, name: 'Coral Bay Samui',            owner: 'Pranee S.',   tier: 'B', stage: 'New Property',             hoursInStage: 52, sla: 24, isMyHotel: false },
  { id:  3, name: 'Palm Garden Rayong',         owner: 'Somchai K.',  tier: 'B', stage: 'Introduction & Sent Form', hoursInStage: 16, sla: 24, isMyHotel: true  },
  { id:  4, name: 'Dune Resort Krabi',          owner: 'Wanchai P.',  tier: 'C', stage: 'Introduction & Sent Form', hoursInStage: 30, sla: 24, isMyHotel: false },
  { id:  5, name: 'Riverside Krabi Resort',     owner: 'Somchai K.',  tier: 'A', stage: 'Collect Data',             hoursInStage: 85, sla: 72, isMyHotel: true  },
  { id:  6, name: 'Mountain View Pai',          owner: 'Niran T.',    tier: 'C', stage: 'Collect Data',             hoursInStage: 45, sla: 72, isMyHotel: false },
  { id:  7, name: 'Jungle Lodge Kanchanaburi',  owner: 'Pranee S.',   tier: 'C', stage: 'Collect Data',             hoursInStage: 12, sla: 72, isMyHotel: false },
  { id:  8, name: 'Baan Suan Pattaya',          owner: 'Somchai K.',  tier: 'B', stage: '1st Check & Follow up',   hoursInStage: 20, sla: 24, isMyHotel: true  },
  { id:  9, name: 'The Harbor Pattaya',         owner: 'Wanchai P.',  tier: 'A', stage: '1st Check & Follow up',   hoursInStage: 30, sla: 24, isMyHotel: false },
  { id: 10, name: 'Lagoon Resort Krabi',        owner: 'Niran T.',    tier: 'B', stage: 'Property Pending',         hoursInStage: 36, sla: 48, isMyHotel: false },
  { id: 11, name: 'Sea Breeze Trat',            owner: 'Somchai K.',  tier: 'C', stage: 'Property Pending',         hoursInStage: 60, sla: 48, isMyHotel: true  },
  { id: 12, name: 'Hilltop View Chiang Rai',    owner: 'Pranee S.',   tier: 'A', stage: 'Final Check',              hoursInStage: 18, sla: 24, isMyHotel: false },
  { id: 13, name: 'Lotus Garden Sukhothai',     owner: 'Somchai K.',  tier: 'B', stage: 'Final Check',              hoursInStage: 10, sla: 24, isMyHotel: true  },
]

function slaStatus(h: number, sla: number) {
  if (h > sla * 2) return 'critical'
  if (h > sla)     return 'overdue'
  if (h > sla * 0.75) return 'warning'
  return 'ok'
}

const SLA_STYLES = {
  critical: { bg: '#FFF0F0', text: '#DC2626', border: '#FECACA' },
  overdue:  { bg: '#FFF0F0', text: '#DC2626', border: '#FECACA' },
  warning:  { bg: '#FFF8E6', text: '#D97706', border: '#FDE68A' },
  ok:       { bg: '#F0FDF4', text: '#16A34A', border: '#BBF7D0' },
}

const TIER_STYLES: Record<string, { bg: string; text: string }> = {
  A: { bg: '#EBF2FF', text: '#1A56DB' },
  B: { bg: '#F0FDF4', text: '#16A34A' },
  C: { bg: '#F5F7FA', text: '#6B7280' },
}

export default function OnboardingPipeline() {
  const { role, addNotification } = useWorkspaceShell()
  const [hotels, setHotels] = useState<Hotel[]>(initialHotels)
  const [filterMine, setFilterMine] = useState(false)
  const [search, setSearch]         = useState('')
  const [filterTier, setFilterTier] = useState('All')
  const [filterSla, setFilterSla] = useState('All')
  const [filterOwner, setFilterOwner] = useState('All')
  const [moveModal, setMoveModal]   = useState<{ hotel: Hotel; nextStage: Stage } | null>(null)
  const [approveModal, setApproveModal] = useState<Hotel | null>(null)
  const [detailHotel, setDetailHotel]   = useState<Hotel | null>(null)
  const [mobileStage, setMobileStage]   = useState<Stage>('New Property')
  const [approvedCount, setApprovedCount] = useState(0)
  const [activities, setActivities] = useState<Activity[]>([
    {
      id: 1,
      hotel: 'Riverside Krabi Resort',
      actor: 'Somchai K.',
      owner: 'Somchai K.',
      action: 'Updated CI asset checklist',
      time: 'Today, 09:15',
    },
    {
      id: 2,
      hotel: 'Coral Bay Samui',
      actor: 'Nattaya Manager',
      owner: 'Pranee S.',
      action: 'Escalated to Partner Manager (> 2× SLA)',
      time: 'Today, 08:40',
    },
  ])

  const actor = role === 'AE' ? 'Somchai K.' : 'Nattaya Manager'
  const owners = Array.from(new Set(hotels.map((hotel) => hotel.owner)))

  const visible = hotels
    .filter((h) => !filterMine || h.isMyHotel)
    .filter((h) => filterTier === 'All' || h.tier === filterTier)
    .filter((h) => role !== 'Manager' || filterOwner === 'All' || h.owner === filterOwner)
    .filter((h) => {
      const status = slaStatus(h.hoursInStage, h.sla)
      if (filterSla === 'All') return true
      if (filterSla === 'At risk') return status === 'warning'
      if (filterSla === 'Overdue') return status === 'overdue' || status === 'critical'
      return status === 'critical'
    })
    .filter((h) => search === '' || h.name.toLowerCase().includes(search.toLowerCase()))

  function moveHotel(id: number, toStage: Stage) {
    const hotel = hotels.find((item) => item.id === id)
    if (!hotel) return
    setHotels((prev) => prev.map((h) =>
      h.id === id ? { ...h, stage: toStage, hoursInStage: 0, sla: stages.find((s) => s.name === toStage)!.sla } : h
    ))
    setActivities((current) => [
      {
        id: Date.now(),
        hotel: hotel.name,
        actor,
        owner: hotel.owner,
        action: `Moved from ${hotel.stage} to ${toStage}`,
        time: 'Just now',
      },
      ...current,
    ])
    addNotification({
      title: 'Onboarding stage updated',
      description: `${hotel.name} moved to ${toStage} by ${actor}`,
      type: 'success',
      target: 'onboarding',
    })
    setMoveModal(null)
  }

  function approveHotel(id: number) {
    const hotel = hotels.find((item) => item.id === id)
    if (!hotel) return
    setHotels((prev) => prev.filter((h) => h.id !== id))
    setApprovedCount((count) => count + 1)
    setActivities((current) => [
      {
        id: Date.now(),
        hotel: hotel.name,
        actor,
        owner: hotel.owner,
        action: 'Approved final check and completed onboarding',
        time: 'Just now',
      },
      ...current,
    ])
    addNotification({
      title: 'Onboarding completed',
      description: `${hotel.name} passed Final Check`,
      type: 'success',
      target: 'onboarding',
    })
    setApproveModal(null)
  }

  const overdueTotal = hotels.filter((h) => h.hoursInStage > h.sla).length
  const criticalTotal = hotels.filter((h) => h.hoursInStage > h.sla * 2).length

  return (
    <div className="h-full overflow-auto p-4 md:p-8">
      {/* Header */}
      <div className="mb-5 md:mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-heading text-xl md:text-2xl font-semibold" style={{ color: 'var(--color-text)' }}>
            Onboarding Pipeline
          </h1>
          <p className="text-xs md:text-sm mt-1 font-thai" style={{ color: 'var(--color-text-muted)' }}>
            ติดตามโรงแรมใหม่ตั้งแต่เข้าระบบจนผ่านการตรวจขั้นสุดท้าย
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {overdueTotal > 0 && (
            <span className="badge" style={{ background: '#FFF0F0', color: '#DC2626' }}>
              {overdueTotal} overdue
            </span>
          )}
          {criticalTotal > 0 && (
            <span className="badge" style={{ background: '#DC2626', color: '#fff' }}>
              {criticalTotal} escalated
            </span>
          )}
          {approvedCount > 0 && (
            <span className="badge" style={{ background: '#F0FDF4', color: '#16A34A' }}>
              {approvedCount} approved
            </span>
          )}
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl border"
            style={{ background: '#fff', borderColor: 'var(--color-border)' }}
          >
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาโรงแรม..."
              className="text-sm bg-transparent outline-none font-thai w-32 md:w-40"
              style={{ color: 'var(--color-text)' }}
            />
          </div>
          <button
            onClick={() => setFilterMine(!filterMine)}
            className="text-sm px-3 py-2 rounded-xl border font-semibold transition-all"
            style={{
              background: filterMine ? 'var(--color-navy)' : '#fff',
              color:      filterMine ? '#fff' : 'var(--color-text-2)',
              borderColor: filterMine ? 'var(--color-navy)' : 'var(--color-border)',
              boxShadow:   filterMine ? '0 2px 8px rgba(26,86,219,.25)' : 'none',
            }}
          >
            {role === 'AE' ? 'My Hotels' : 'Somchai’s Hotels'}
          </button>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        <select
          value={filterTier}
          onChange={(event) => setFilterTier(event.target.value)}
          className="rounded-xl border bg-white px-3 py-2 text-sm outline-none"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-2)' }}
        >
          <option value="All">All Tiers</option>
          <option value="A">Tier A</option>
          <option value="B">Tier B</option>
          <option value="C">Tier C</option>
        </select>
        <select
          value={filterSla}
          onChange={(event) => setFilterSla(event.target.value)}
          className="rounded-xl border bg-white px-3 py-2 text-sm outline-none"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-2)' }}
        >
          <option value="All">All SLA</option>
          <option value="At risk">At risk</option>
          <option value="Overdue">Overdue</option>
          <option value="Escalated">Escalated &gt; 2×</option>
        </select>
        {role === 'Manager' && (
          <select
            value={filterOwner}
            onChange={(event) => setFilterOwner(event.target.value)}
            className="rounded-xl border bg-white px-3 py-2 text-sm outline-none"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-2)' }}
          >
            <option value="All">All Owners</option>
            {owners.map((owner) => <option key={owner} value={owner}>{owner}</option>)}
          </select>
        )}
      </div>

      {/* ── Mobile: stage tabs + vertical list ── */}
      <div className="md:hidden">
        <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4 no-scrollbar">
          {stages.map((s) => {
            const count = visible.filter((h) => h.stage === s.name).length
            const active = mobileStage === s.name
            return (
              <button
                key={s.name}
                onClick={() => setMobileStage(s.name)}
                className="shrink-0 px-3 py-2 rounded-xl text-xs font-semibold transition-all border"
                style={{
                  background: active ? 'var(--color-navy)' : '#fff',
                  color:      active ? '#fff' : 'var(--color-text-2)',
                  borderColor: active ? 'var(--color-navy)' : 'var(--color-border)',
                }}
              >
                {s.name.split(' ').slice(0, 2).join(' ')}
                <span
                  className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs"
                  style={{
                    background: active ? 'rgba(255,255,255,.25)' : 'var(--color-surface)',
                    color:      active ? '#fff' : 'var(--color-text-muted)',
                  }}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Mobile cards for selected stage */}
        <div className="space-y-2">
          {visible.filter((h) => h.stage === mobileStage).map((hotel) => {
            const status = slaStatus(hotel.hoursInStage, hotel.sla)
            const sc     = SLA_STYLES[status]
            const tc     = TIER_STYLES[hotel.tier]
            const stageIdx  = stages.findIndex((s) => s.name === mobileStage)
            const nextStage = stages[stageIdx + 1]?.name as Stage | undefined

            return (
              <div
                key={hotel.id}
                className="rounded-2xl border p-4 bg-white transition-all"
                style={{
                  borderColor: status === 'ok' ? 'var(--color-border)' : sc.border,
                  borderLeftWidth: status !== 'ok' ? '3px' : '1px',
                  boxShadow: '0 1px 4px rgba(0,0,0,.04)',
                }}
                onClick={() => setDetailHotel(hotel)}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-sm font-semibold leading-snug" style={{ color: 'var(--color-text)' }}>
                    {hotel.name}
                  </span>
                  <span className="badge shrink-0" style={{ background: tc.bg, color: tc.text }}>
                    Tier {hotel.tier}
                  </span>
                </div>
                <div className="text-xs mb-3" style={{ color: 'var(--color-text-muted)' }}>
                  {hotel.owner}{hotel.isMyHotel && <span style={{ color: 'var(--color-sage)' }}> · Mine</span>}
                </div>
                <div
                  className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded-xl mb-3 font-medium"
                  style={{ background: sc.bg, color: sc.text }}
                >
                  <span>{hotel.hoursInStage}h / {hotel.sla}h SLA</span>
                  <span>{status === 'ok' ? 'On-time ✓' : status.charAt(0).toUpperCase() + status.slice(1)}</span>
                </div>
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  {nextStage && (
                    <button
                      className="btn-primary flex-1 text-xs py-2"
                      onClick={() => setMoveModal({ hotel, nextStage })}
                    >
                      Move →
                    </button>
                  )}
                  {mobileStage === 'Final Check' && (
                    <button
                      className="flex-1 text-xs py-2 rounded-xl font-semibold text-white"
                      style={{ background: 'var(--color-forest)', boxShadow: '0 2px 8px rgba(10,122,62,.25)' }}
                      onClick={() => setApproveModal(hotel)}
                    >
                      Approve ✓
                    </button>
                  )}
                </div>
              </div>
            )
          })}
          {visible.filter((h) => h.stage === mobileStage).length === 0 && (
            <div className="text-center py-12 text-sm font-thai" style={{ color: 'var(--color-text-muted)' }}>
              ไม่มีโรงแรมในขั้นตอนนี้
            </div>
          )}
        </div>
      </div>

      {/* ── Desktop: Kanban ── */}
      <div className="hidden md:flex gap-4 overflow-x-auto pb-6">
        {stages.map((stage, stageIdx) => {
          const stageHotels   = visible.filter((h) => h.stage === stage.name)
          const overdueInStage = stageHotels.filter((h) => h.hoursInStage > h.sla).length

          return (
            <div
              key={stage.name}
              className="shrink-0 w-56 rounded-2xl flex flex-col"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            >
              <div className="px-3 py-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold" style={{ color: 'var(--color-text)' }}>
                    {stage.name}
                  </span>
                  <span
                    className="w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold"
                    style={{ background: 'var(--color-border-2)', color: 'var(--color-text-2)' }}
                  >
                    {stageHotels.length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>SLA {stage.sla}h</span>
                  {overdueInStage > 0 && (
                    <span className="text-xs font-semibold" style={{ color: '#DC2626' }}>· {overdueInStage} overdue</span>
                  )}
                </div>
              </div>

              <div className="flex-1 p-2 space-y-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 320px)' }}>
                {stageHotels.map((hotel) => {
                  const status = slaStatus(hotel.hoursInStage, hotel.sla)
                  const sc     = SLA_STYLES[status]
                  const tc     = TIER_STYLES[hotel.tier]
                  const nextStage = stages[stageIdx + 1]?.name as Stage | undefined

                  return (
                    <div
                      key={hotel.id}
                      className="rounded-xl border bg-white p-3 cursor-pointer transition-all hover:shadow-md"
                      style={{
                        borderColor: status === 'ok' ? 'var(--color-border)' : sc.border,
                        borderLeftWidth: status !== 'ok' ? '3px' : '1px',
                        boxShadow: '0 1px 3px rgba(0,0,0,.04)',
                      }}
                      onClick={() => setDetailHotel(hotel)}
                    >
                      <div className="flex items-start justify-between gap-1 mb-1.5">
                        <span className="text-xs font-semibold leading-tight" style={{ color: 'var(--color-text)' }}>
                          {hotel.name}
                        </span>
                        <span className="badge shrink-0" style={{ background: tc.bg, color: tc.text, padding: '2px 6px' }}>
                          {hotel.tier}
                        </span>
                      </div>
                      <div className="text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>
                        {hotel.owner}
                        {hotel.isMyHotel && <span style={{ color: 'var(--color-sage)' }}> · Mine</span>}
                      </div>
                      <div
                        className="flex items-center justify-between text-xs px-2 py-1 rounded-lg mb-2 font-medium"
                        style={{ background: sc.bg, color: sc.text }}
                      >
                        <span>{hotel.hoursInStage}h / {hotel.sla}h</span>
                        <span className="capitalize">{status === 'ok' ? 'On-time' : status}</span>
                      </div>
                      {status === 'critical' && (
                        <div className="mb-2 text-[10px] font-bold" style={{ color: '#DC2626' }}>
                          ⚑ Partner Manager escalated
                        </div>
                      )}
                      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                        {nextStage && (
                          <button
                            className="btn-primary flex-1 text-xs py-1.5 px-2"
                            onClick={() => setMoveModal({ hotel, nextStage })}
                          >
                            Move →
                          </button>
                        )}
                        {stage.name === 'Final Check' && (
                          <button
                            className="flex-1 text-xs py-1.5 rounded-lg font-semibold text-white"
                            style={{ background: 'var(--color-forest)' }}
                            onClick={() => setApproveModal(hotel)}
                          >
                            Approve ✓
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
                {stageHotels.length === 0 && (
                  <div className="text-center py-8 text-xs font-thai" style={{ color: 'var(--color-text-muted)' }}>
                    ไม่มีโรงแรม
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Move Modal ── */}
      {moveModal && (
        <div className="fixed inset-0 bg-black/30 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="w-full max-w-sm rounded-2xl p-6 bg-white shadow-2xl">
            <h3 className="font-heading text-lg font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
              ย้ายขั้นตอน
            </h3>
            <p className="text-sm mb-4 font-thai" style={{ color: 'var(--color-text-muted)' }}>
              {moveModal.hotel.name} → <strong>{moveModal.nextStage}</strong>
            </p>
            <div
              className="text-xs p-3 rounded-xl mb-5 font-thai"
              style={{ background: 'var(--color-surface)', color: 'var(--color-text-2)' }}
            >
              ผู้ดำเนินการ: Somchai K. · เจ้าของโรงแรม: {moveModal.hotel.owner}
            </div>
            <div className="flex gap-2">
              <button className="btn-primary flex-1 text-center" onClick={() => moveHotel(moveModal.hotel.id, moveModal.nextStage)}>
                ยืนยันย้าย
              </button>
              <button className="btn-ghost flex-1 text-center" onClick={() => setMoveModal(null)}>
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Approve Modal ── */}
      {approveModal && (
        <div className="fixed inset-0 bg-black/30 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="w-full max-w-sm rounded-2xl p-6 bg-white shadow-2xl">
            <h3 className="font-heading text-lg font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
              Approve Final Check
            </h3>
            <p className="text-sm mb-5 font-thai" style={{ color: 'var(--color-text-muted)' }}>
              อนุมัติให้ <strong>{approveModal.name}</strong> ผ่านกระบวนการ Onboarding สำเร็จ
            </p>
            <div className="flex gap-2">
              <button
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white"
                style={{ background: 'var(--color-forest)', boxShadow: '0 2px 8px rgba(10,122,62,.3)' }}
                onClick={() => approveHotel(approveModal.id)}
              >
                Approve ✓
              </button>
              <button className="btn-ghost flex-1 text-center" onClick={() => setApproveModal(null)}>ยกเลิก</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Detail Panel ── */}
      {detailHotel && (
        <div className="fixed inset-0 bg-black/30 flex items-end sm:items-center justify-end z-50">
          <div
            className="w-full sm:w-80 h-full sm:h-auto sm:max-h-screen sm:rounded-l-2xl overflow-auto"
            style={{ background: '#fff', boxShadow: '-4px 0 24px rgba(0,0,0,.1)' }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <span className="font-heading font-bold" style={{ color: 'var(--color-text)' }}>
                  Property Detail
                </span>
                <button
                  onClick={() => setDetailHotel(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  ✕
                </button>
              </div>
              <h2 className="font-heading text-lg font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
                {detailHotel.name}
              </h2>
              <p className="text-sm font-thai mb-5" style={{ color: 'var(--color-text-muted)' }}>
                Tier {detailHotel.tier} · {detailHotel.owner}
              </p>
              <div className="grid grid-cols-2 gap-2 mb-5">
                <div className="rounded-xl p-3" style={{ background: 'var(--color-surface)' }}>
                  <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>SLA status</div>
                  <div className="mt-1 text-sm font-bold capitalize" style={{ color: SLA_STYLES[slaStatus(detailHotel.hoursInStage, detailHotel.sla)].text }}>
                    {slaStatus(detailHotel.hoursInStage, detailHotel.sla)}
                  </div>
                </div>
                <div className="rounded-xl p-3" style={{ background: 'var(--color-surface)' }}>
                  <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Services</div>
                  <div className="mt-1 text-sm font-bold" style={{ color: 'var(--color-text)' }}>3 enabled</div>
                </div>
              </div>
              <div className="mb-5">
                <div className="mb-2 text-xs font-bold tracking-wide" style={{ color: 'var(--color-text-muted)' }}>SERVICE CHECKLIST</div>
                {['Extranet account', 'Rates & availability', 'Property content'].map((item, index) => {
                  const complete = index <= stages.findIndex((stage) => stage.name === detailHotel.stage) / 2
                  return (
                    <div key={item} className="mb-1.5 flex items-center gap-2 text-xs" style={{ color: complete ? 'var(--color-forest)' : 'var(--color-text-muted)' }}>
                      <span className="w-4">{complete ? '✓' : '○'}</span>
                      <span>{item}</span>
                    </div>
                  )
                })}
              </div>
              <div className="space-y-2">
                {stages.map((s, i) => {
                  const currentIdx = stages.findIndex((st) => st.name === detailHotel.stage)
                  const done    = i < currentIdx
                  const current = i === currentIdx
                  return (
                    <div key={s.name} className="flex items-center gap-3">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                        style={{
                          background: done ? 'var(--color-forest)' : current ? 'var(--color-navy)' : 'var(--color-border)',
                          color:      done || current ? '#fff' : 'var(--color-text-muted)',
                          boxShadow: current ? '0 0 0 3px rgba(26,86,219,.2)' : 'none',
                        }}
                      >
                        {done ? '✓' : i + 1}
                      </div>
                      <span
                        className="text-xs"
                        style={{
                          color:      current ? 'var(--color-text)' : done ? 'var(--color-forest)' : 'var(--color-text-muted)',
                          fontWeight: current ? 700 : 400,
                        }}
                      >
                        {s.name}
                        {current && (
                          <span className="ml-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                            ({detailHotel.hoursInStage}h elapsed)
                          </span>
                        )}
                      </span>
                    </div>
                  )
                })}
              </div>
              <div className="mt-6 border-t pt-5" style={{ borderColor: 'var(--color-border)' }}>
                <div className="mb-3 text-xs font-bold tracking-wide" style={{ color: 'var(--color-text-muted)' }}>ACTION LOG</div>
                <div className="space-y-3">
                  {activities.filter((activity) => activity.hotel === detailHotel.name).map((activity) => (
                    <div key={activity.id} className="rounded-xl p-3 text-xs" style={{ background: 'var(--color-surface)' }}>
                      <div className="font-semibold" style={{ color: 'var(--color-text)' }}>{activity.action}</div>
                      <div className="mt-1" style={{ color: 'var(--color-text-muted)' }}>
                        Actor: {activity.actor} · Owner: {activity.owner}
                      </div>
                      <div className="mt-1" style={{ color: 'var(--color-warm-taupe)' }}>{activity.time}</div>
                    </div>
                  ))}
                  {activities.filter((activity) => activity.hotel === detailHotel.name).length === 0 && (
                    <div className="text-xs font-thai" style={{ color: 'var(--color-text-muted)' }}>ยังไม่มีประวัติการดำเนินการ</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
