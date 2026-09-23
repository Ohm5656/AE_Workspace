import { useEffect, useState } from "react"
import { useWorkspaceShell } from "./WorkspaceShellContext"

type TaskType = "Renewals" | "Onboarding" | "Coaching" | "Surveys"
type DueStatus = "overdue" | "today" | "soon" | "normal"

interface Task {
  id: number
  type: TaskType
  title: string
  hotel: string
  dueDate: string
  dueStatus: DueStatus
  dueLabel: string
  stage?: string
}

const tasks: Task[] = [
  {
    id: 1,
    type: "Renewals",
    title: "Contract Renewal Review",
    hotel: "Riverside Krabi Resort",
    dueDate: "2026-09-23",
    dueStatus: "today",
    dueLabel: "Due today",
  },
  {
    id: 2,
    type: "Renewals",
    title: "Rate Negotiation Follow-up",
    hotel: "Sunset Villa Phuket",
    dueDate: "2026-09-25",
    dueStatus: "soon",
    dueLabel: "Due in 2 days",
  },
  {
    id: 3,
    type: "Renewals",
    title: "Contract Renewal Review",
    hotel: "Bay Resort Pattaya",
    dueDate: "2026-09-20",
    dueStatus: "overdue",
    dueLabel: "Overdue 3 days",
  },
  {
    id: 4,
    type: "Renewals",
    title: "Annual Rate Review",
    hotel: "Ocean View Koh Samui",
    dueDate: "2026-09-28",
    dueStatus: "normal",
    dueLabel: "Due in 5 days",
  },
  {
    id: 5,
    type: "Renewals",
    title: "Contract Extension Approval",
    hotel: "Hillside Chiang Mai",
    dueDate: "2026-10-02",
    dueStatus: "normal",
    dueLabel: "Due in 9 days",
  },
  {
    id: 6,
    type: "Onboarding",
    title: "Kick-off Meeting",
    hotel: "Azure Beach Hua Hin",
    dueDate: "2026-09-23",
    dueStatus: "today",
    dueLabel: "Due today",
    stage: "Introduction & Sent Form",
  },
  {
    id: 7,
    type: "Onboarding",
    title: "Collect CI Assets",
    hotel: "Palm Garden Rayong",
    dueDate: "2026-09-19",
    dueStatus: "overdue",
    dueLabel: "Overdue 4 days",
    stage: "Collect Data",
  },
  {
    id: 8,
    type: "Onboarding",
    title: "Stage 8 Checklist Review",
    hotel: "Mountain View Pai",
    dueDate: "2026-09-26",
    dueStatus: "soon",
    dueLabel: "Due in 3 days",
    stage: "1st Check & Follow up",
  },
  {
    id: 9,
    type: "Onboarding",
    title: "Final Property Approval",
    hotel: "Lagoon Resort Krabi",
    dueDate: "2026-09-30",
    dueStatus: "normal",
    dueLabel: "Due in 7 days",
    stage: "Final Check",
  },
  {
    id: 10,
    type: "Coaching",
    title: "Post-Survey Coaching Session",
    hotel: "Bay Resort Pattaya",
    dueDate: "2026-09-24",
    dueStatus: "soon",
    dueLabel: "Due tomorrow",
  },
  {
    id: 11,
    type: "Coaching",
    title: "SLA Overdue Follow-up",
    hotel: "Riverside Krabi Resort",
    dueDate: "2026-09-23",
    dueStatus: "today",
    dueLabel: "Due today",
  },
  {
    id: 12,
    type: "Coaching",
    title: "Marcom Feedback Review",
    hotel: "Sunset Villa Phuket",
    dueDate: "2026-09-21",
    dueStatus: "overdue",
    dueLabel: "Overdue 2 days",
  },
  {
    id: 13,
    type: "Coaching",
    title: "Performance Review Meeting",
    hotel: "Ocean View Koh Samui",
    dueDate: "2026-10-01",
    dueStatus: "normal",
    dueLabel: "Due in 8 days",
  },
  {
    id: 14,
    type: "Surveys",
    title: "Fill ORM Survey",
    hotel: "Hillside Chiang Mai",
    dueDate: "2026-09-23",
    dueStatus: "today",
    dueLabel: "Due today",
  },
  {
    id: 15,
    type: "Surveys",
    title: "Fill Marcom Survey",
    hotel: "Riverside Krabi Resort",
    dueDate: "2026-09-18",
    dueStatus: "overdue",
    dueLabel: "Overdue 5 days",
  },
  {
    id: 16,
    type: "Surveys",
    title: "Customer Satisfaction Survey",
    hotel: "Azure Beach Hua Hin",
    dueDate: "2026-09-25",
    dueStatus: "soon",
    dueLabel: "Due in 2 days",
  },
  {
    id: 17,
    type: "Surveys",
    title: "Post-Meeting ORM Survey",
    hotel: "Palm Garden Rayong",
    dueDate: "2026-09-29",
    dueStatus: "normal",
    dueLabel: "Due in 6 days",
  },
  {
    id: 18,
    type: "Surveys",
    title: "Quarterly Review Survey",
    hotel: "Bay Resort Pattaya",
    dueDate: "2026-10-03",
    dueStatus: "normal",
    dueLabel: "Due in 10 days",
  },
]

const TYPE_COLORS: Record<TaskType, { bg: string; text: string; glow: string }> =
  {
    Renewals: { bg: "#EBF2FF", text: "#1A56DB", glow: "rgba(26,86,219,.12)" },
    Onboarding: { bg: "#F0FDF4", text: "#16A34A", glow: "rgba(22,163,74,.12)" },
    Coaching: { bg: "#FFF8E6", text: "#D97706", glow: "rgba(217,119,6,.12)" },
    Surveys: { bg: "#F5F0FF", text: "#7C3AED", glow: "rgba(124,58,237,.12)" },
  }

const DUE_STYLES: Record<DueStatus, { text: string; bg: string }> = {
  overdue: { text: "#DC2626", bg: "#FFF0F0" },
  today: { text: "#D97706", bg: "#FFF8E6" },
  soon: { text: "#0A7A3E", bg: "#F0FDF4" },
  normal: { text: "#6B7280", bg: "#F5F7FA" },
}

const ACTION_LABEL: Record<TaskType, string> = {
  Renewals: "Open Renewal",
  Onboarding: "Open Onboarding",
  Coaching: "Open Coaching",
  Surveys: "Fill Survey",
}

export default function MyTasks() {
  const { navigate, addNotification, role, createdCoachingTasks } = useWorkspaceShell()
  const [taskItems, setTaskItems] = useState<Task[]>(tasks)
  const [filterType, setFilterType] = useState<TaskType | "All">("All")
  const [filterDue, setFilterDue] = useState("All")
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState<"due" | "type">("due")
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [lastCompleted, setLastCompleted] = useState<string | null>(null)

  useEffect(() => {
    setTaskItems((current) => {
      const newTasks: Task[] = createdCoachingTasks
        .filter((task) => !current.some((item) => item.id === task.id))
        .map((task) => ({ ...task, type: "Coaching" }))
      return newTasks.length > 0 ? [...current, ...newTasks] : current
    })
  }, [createdCoachingTasks])

  const filtered = taskItems
    .filter((t) => filterType === "All" || t.type === filterType)
    .filter((t) => filterDue === "All" || t.dueStatus === filterDue)
    .filter(
      (t) =>
        search === "" ||
        t.hotel.toLowerCase().includes(search.toLowerCase()) ||
        t.title.toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) =>
      sort === "due"
        ? new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        : a.type.localeCompare(b.type),
    )

  const grouped = ([
    "Renewals",
    "Onboarding",
    "Coaching",
    "Surveys",
  ] as TaskType[]).reduce(
    (acc, type) => {
      const items = filtered.filter((t) => t.type === type)
      if (items.length) acc[type] = items
      return acc
    },
    {} as Record<TaskType, Task[]>,
  )

  const overdueCount = taskItems.filter((t) => t.dueStatus === "overdue").length
  const todayCount = taskItems.filter((t) => t.dueStatus === "today").length

  function openTask(task: Task) {
    if (task.type === "Onboarding") {
      navigate("onboarding")
      return
    }

    if (task.type === "Surveys") {
      navigate("surveys")
      return
    }

    addNotification({
      title: `${task.type} task opened`,
      description: `${task.title} · ${task.hotel}`,
      type: "info",
      target: "tasks",
    })
    setLastCompleted(`เปิดรายละเอียด ${task.title} แล้ว`)
  }

  function completeTask(task: Task) {
    setTaskItems((current) => current.filter((item) => item.id !== task.id))
    setSelectedTask(null)
    setLastCompleted(`ทำเครื่องหมาย “${task.title}” เสร็จแล้ว`)
    addNotification({
      title: "Task completed",
      description: `${task.title} · ${task.hotel}`,
      type: "success",
      target: "tasks",
    })
  }

  return (
    <div className="flex h-full" style={{ minHeight: "100svh" }}>
      {/* ─── Content ─── */}
      <div className="flex-1 overflow-auto p-4 md:p-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1
                className="font-heading text-xl md:text-2xl font-semibold"
                style={{ color: "var(--color-text)" }}
              >
                {role === "AE" ? "My Tasks" : "Team Tasks"}
              </h1>
              <p
                className="text-xs md:text-sm mt-1 font-thai"
                style={{ color: "var(--color-text-muted)" }}
              >
                {role === "AE"
                  ? "รวมงานประจำวัน งานเร่งด่วน และสิ่งที่ต้องติดตามของคุณ"
                  : "ภาพรวมงานของทีมสำหรับติดตามภาระงานและรายการเกินกำหนด"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {overdueCount > 0 && (
                <span
                  className="badge"
                  style={{ background: "#FFF0F0", color: "#DC2626" }}
                >
                  {overdueCount} เกินกำหนด
                </span>
              )}
              <span
                className="badge"
                style={{ background: "#FFF8E6", color: "#D97706" }}
              >
                {todayCount} due today
              </span>
            </div>
          </div>

          {/* Stat chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-3 mt-5">
            {([
              "Renewals",
              "Onboarding",
              "Coaching",
              "Surveys",
            ] as TaskType[]).map((type) => {
              const c = TYPE_COLORS[type]
              const active = filterType === type
              return (
                <button
                  key={type}
                  onClick={() => setFilterType(active ? "All" : type)}
                  className="interactive-card text-left px-4 py-3 rounded-2xl border-2 transition-all hover:shadow-md"
                  style={{
                    background: active ? c.bg : "#fff",
                    borderColor: active ? c.text : "var(--color-border)",
                    boxShadow: active ? `0 4px 16px ${c.glow}` : "none",
                  }}
                >
                  <div
                    className="text-xl font-heading font-bold"
                    style={{ color: c.text }}
                  >
                    {taskItems.filter((t) => t.type === type).length}
                  </div>
                  <div
                    className="text-xs font-semibold mt-0.5"
                    style={{ color: active ? c.text : "var(--color-text-2)" }}
                  >
                    {type}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {lastCompleted && (
          <div
            className="mb-4 flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-xs font-thai"
            style={{
              background: "#F0FDF4",
              borderColor: "#BBF7D0",
              color: "#166534",
            }}
          >
            <span>✓ {lastCompleted}</span>
            <button
              className="font-bold"
              onClick={() => setLastCompleted(null)}
              aria-label="ปิดข้อความ"
            >
              ✕
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-5">
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl border flex-1 min-w-[160px]"
            style={{ background: "#fff", borderColor: "var(--color-border)" }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              className="shrink-0"
            >
              <circle
                cx="6"
                cy="6"
                r="4.5"
                stroke="#9CA3AF"
                strokeWidth="1.4"
              />
              <path
                d="M10 10l2.5 2.5"
                stroke="#9CA3AF"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาชื่อโรงแรมหรืองาน..."
              className="flex-1 text-sm bg-transparent outline-none font-thai"
              style={{ color: "var(--color-text)" }}
            />
          </div>
          <select
            value={filterDue}
            onChange={(e) => setFilterDue(e.target.value)}
            className="text-sm px-3 py-2 rounded-xl border outline-none"
            style={{
              background: "#fff",
              borderColor: "var(--color-border)",
              color: "var(--color-text-2)",
            }}
          >
            <option value="All">All due dates</option>
            <option value="overdue">Overdue</option>
            <option value="today">Due today</option>
            <option value="soon">Due soon</option>
            <option value="normal">Upcoming</option>
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as "due" | "type")}
            className="text-sm px-3 py-2 rounded-xl border outline-none"
            style={{
              background: "#fff",
              borderColor: "var(--color-border)",
              color: "var(--color-text-2)",
            }}
          >
            <option value="due">Sort by Due Date</option>
            <option value="type">Sort by Type</option>
          </select>
        </div>

        {/* Task groups */}
        <div className="space-y-6 pb-8">
          {Object.entries(grouped).map(([type, items]) => {
            const c = TYPE_COLORS[(type as TaskType)]
            return (
              <section key={type}>
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="badge"
                    style={{ background: c.bg, color: c.text }}
                  >
                    {type}
                  </span>
                  <span
                    className="text-xs"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    {items.length} งาน
                  </span>
                </div>
                <div className="space-y-2">
                  {items.map((task) => {
                    const dc = DUE_STYLES[task.dueStatus]
                    return (
                      <div
                        key={task.id}
                        className="interactive-card group flex items-center gap-3 md:gap-4 px-4 py-3.5 rounded-2xl border transition-all cursor-pointer hover:shadow-md"
                        style={{
                          background: "#fff",
                          borderColor:
                            task.dueStatus === "overdue"
                              ? "#DC2626"
                              : "var(--color-border)",
                          borderLeftWidth:
                            task.dueStatus === "overdue" ? "3px" : "1px",
                          boxShadow: "0 1px 4px rgba(0,0,0,.04)",
                        }}
                        onClick={() => setSelectedTask(task)}
                      >
                        {/* Type dot */}
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ background: c.text }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className="text-sm font-semibold"
                              style={{ color: "var(--color-text)" }}
                            >
                              {task.title}
                            </span>
                            {task.stage && (
                              <span
                                className="text-xs px-2 py-0.5 rounded-lg hidden sm:inline"
                                style={{
                                  background: "var(--color-surface)",
                                  color: "var(--color-text-muted)",
                                }}
                              >
                                {task.stage}
                              </span>
                            )}
                          </div>
                          <div
                            className="text-xs mt-0.5 font-thai truncate"
                            style={{ color: "var(--color-text-muted)" }}
                          >
                            🏨 {task.hotel}
                          </div>
                        </div>
                        <span
                          className="badge shrink-0"
                          style={{ background: dc.bg, color: dc.text }}
                        >
                          {task.dueLabel}
                        </span>
                        <button
                          className="btn-primary shrink-0 hidden group-hover:inline-flex text-xs py-1.5 px-3"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedTask(task)
                          }}
                        >
                          {ACTION_LABEL[(task.type as TaskType)]}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </section>
            )
          })}
          {filtered.length === 0 && (
            <div
              className="text-center py-16 text-sm font-thai"
              style={{ color: "var(--color-text-muted)" }}
            >
              ไม่พบงานที่ตรงกับเงื่อนไข
            </div>
          )}
        </div>
      </div>

      {/* ─── Detail Drawer (desktop slide-in / mobile full overlay) ─── */}
      {selectedTask && (
        <>
          {/* Mobile backdrop */}
          <div
            className="fixed inset-0 z-40 md:hidden"
            style={{ background: "rgba(0,0,0,.3)" }}
            onClick={() => setSelectedTask(null)}
          />
          <div
            className="fixed md:relative inset-y-0 right-0 z-50 w-full max-w-sm md:w-80 md:max-w-none flex flex-col border-l overflow-auto transition-transform duration-300"
            style={{
              background: "#fff",
              borderColor: "var(--color-border)",
              boxShadow: "-4px 0 24px rgba(0,0,0,.08)",
            }}
          >
            <div className="p-5 md:p-6">
              <div className="flex items-center justify-between mb-5">
                <span
                  className="badge"
                  style={{
                    background: TYPE_COLORS[selectedTask.type].bg,
                    color: TYPE_COLORS[selectedTask.type].text,
                  }}
                >
                  {selectedTask.type}
                </span>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-full transition-colors hover:bg-gray-100"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  ✕
                </button>
              </div>
              <h2
                className="font-heading text-lg font-semibold mb-1"
                style={{ color: "var(--color-text)" }}
              >
                {selectedTask.title}
              </h2>
              <p
                className="text-sm font-thai mb-5"
                style={{ color: "var(--color-text-muted)" }}
              >
                🏨 {selectedTask.hotel}
              </p>
              <div
                className="rounded-xl p-3 mb-5 text-sm font-medium"
                style={{
                  background: DUE_STYLES[selectedTask.dueStatus].bg,
                  color: DUE_STYLES[selectedTask.dueStatus].text,
                }}
              >
                📅 {selectedTask.dueLabel} · {selectedTask.dueDate}
              </div>
              {selectedTask.stage && (
                <div className="mb-5">
                  <div
                    className="text-xs font-bold mb-2 tracking-wide"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    STAGE
                  </div>
                  <div
                    className="text-sm px-3 py-2.5 rounded-xl font-medium"
                    style={{
                      background: "var(--color-surface)",
                      color: "var(--color-text-2)",
                    }}
                  >
                    {selectedTask.stage}
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <button
                  className="btn-primary w-full text-center"
                  onClick={() => openTask(selectedTask)}
                >
                  {ACTION_LABEL[selectedTask.type]}
                </button>
                <button
                  className="btn-ghost w-full text-center"
                  onClick={() => completeTask(selectedTask)}
                >
                  Mark as Done
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
