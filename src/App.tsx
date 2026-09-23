"use client"

import { useState } from "react"
import MyTasks from "./components/MyTasks"
import OnboardingPipeline from "./components/OnboardingPipeline"
import CalendarView from "./components/CalendarView"
import MeetingsTable from "./components/MeetingsTable"
import SurveyView from "./components/SurveyView"
import {
  WorkspaceShellProvider,
  type WorkspaceNotification,
  type WorkspacePage,
  type WorkspaceRole,
} from "./components/WorkspaceShellContext"

const navItems: {
  id: WorkspacePage
  label: string
  thai: string
  emoji: string
}[] = [
  { id: "tasks", label: "My Tasks", thai: "งานของฉัน", emoji: "✓" },
  { id: "onboarding", label: "Onboarding", thai: "รับโรงแรมใหม่", emoji: "⬡" },
  { id: "calendar", label: "Calendar", thai: "ปฏิทิน", emoji: "▦" },
  { id: "meetings", label: "Meetings", thai: "นัดหมาย", emoji: "◈" },
  { id: "surveys", label: "Surveys", thai: "แบบประเมิน", emoji: "◉" },
]

const initialNotifications: WorkspaceNotification[] = [
  {
    id: 1,
    title: "SLA Overdue",
    description: "Riverside Krabi exceeded 72h in Collect Data",
    time: "2h ago",
    type: "error",
    target: "onboarding",
    read: false,
  },
  {
    id: 2,
    title: "Survey Pending",
    description: "Bay Resort Pattaya survey is 5 days overdue",
    time: "1d ago",
    type: "warning",
    target: "surveys",
    read: false,
  },
  {
    id: 3,
    title: "Flag Created",
    description: "Sunset Villa was routed to GRM",
    time: "2d ago",
    type: "info",
    target: "surveys",
    read: false,
  },
]

export default function App() {
  const [page, setPage] = useState<WorkspacePage>("tasks")
  const [role, setRole] = useState<WorkspaceRole>("AE")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] =
    useState<WorkspaceNotification[]>(initialNotifications)

  const unreadCount = notifications.filter((item) => !item.read).length

  function navigate(p: WorkspacePage) {
    setPage(p)
    setSidebarOpen(false)
  }

  function addNotification(
    notification: Omit<WorkspaceNotification, "id" | "time" | "read">,
  ) {
    setNotifications((current) => [
      {
        ...notification,
        id: Date.now(),
        time: "Just now",
        read: false,
      },
      ...current,
    ])
  }

  function openNotification(notification: WorkspaceNotification) {
    setNotifications((current) =>
      current.map((item) =>
        item.id === notification.id ? { ...item, read: true } : item,
      ),
    )
    setNotifOpen(false)
    navigate(notification.target)
  }

  function markAllRead() {
    setNotifications((current) =>
      current.map((item) => ({ ...item, read: true })),
    )
  }

  const SidebarContent = () => (
    <>
      {/* Brand */}
      <div
        className="px-5 py-5 border-b"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-sm"
            style={{
              background:
                "linear-gradient(135deg, var(--color-navy) 0%, #3B82F6 100%)",
            }}
          >
            AE
          </div>
        </div>
        {/* Close on mobile */}
        <button
          className="ml-auto md:hidden text-xl leading-none"
          style={{ color: "var(--color-text-muted)" }}
          onClick={() => setSidebarOpen(false)}
          aria-label="ปิดเมนู"
        >
          ✕
        </button>
      </div>

      {/* Role switcher */}
      <div className="px-4 pt-4 pb-3">
        <div
          className="flex rounded-xl overflow-hidden text-xs p-1"
          style={{ background: "var(--color-surface)" }}
        >
          {(["AE", "Manager"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className="flex-1 py-1.5 rounded-lg transition-all font-semibold"
              style={{
                background: role === r ? "var(--color-navy)" : "transparent",
                color: role === r ? "#fff" : "var(--color-text-muted)",
                boxShadow: role === r ? "0 1px 4px rgba(26,86,219,.3)" : "none",
              }}
            >
              {r === "AE" ? "View as AE" : "Manager"}
            </button>
          ))}
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 space-y-0.5 pb-4 overflow-y-auto">
        {navItems.map((item) => {
          const active = page === item.id
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all"
              style={{
                background: active
                  ? "linear-gradient(135deg, var(--color-navy) 0%, #3B82F6 100%)"
                  : "transparent",
                color: active ? "#fff" : "var(--color-text-2)",
                boxShadow: active ? "0 2px 10px rgba(26,86,219,.25)" : "none",
              }}
              onMouseEnter={(e) => {
                if (!active)
                  (e.currentTarget as HTMLElement).style.background =
                    "var(--color-surface)"
              }}
              onMouseLeave={(e) => {
                if (!active)
                  (e.currentTarget as HTMLElement).style.background =
                    "transparent"
              }}
            >
              <span
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0"
                style={{
                  background: active
                    ? "rgba(255,255,255,.2)"
                    : "var(--color-surface)",
                  color: active ? "#fff" : "var(--color-navy)",
                }}
              >
                {item.emoji}
              </span>
              <div>
                <div className="text-sm font-semibold leading-tight">
                  {item.label}
                </div>
                <div
                  className="text-xs leading-tight font-thai"
                  style={{ opacity: 0.65 }}
                >
                  {item.thai}
                </div>
              </div>
            </button>
          )
        })}
      </nav>

      {/* Bottom */}
      <div
        className="border-t px-4 py-4 space-y-2.5"
        style={{ borderColor: "var(--color-border)" }}
      >
        <button
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all relative"
          style={{ color: "var(--color-text-2)" }}
          onClick={() => setNotifOpen(!notifOpen)}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLElement).style.background =
              "var(--color-surface)")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLElement).style.background = "transparent")
          }
        >
          <span className="relative">
            <span className="text-base">🔔</span>
            {unreadCount > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border border-white"
                style={{ background: "var(--color-overdue)" }}
              />
            )}
          </span>
          <span className="font-medium">Notifications</span>
          {unreadCount > 0 && (
            <span
              className="ml-auto text-xs px-2 py-0.5 rounded-full font-bold"
              style={{
                background: "var(--color-overdue-bg)",
                color: "var(--color-overdue)",
              }}
            >
              {unreadCount}
            </span>
          )}
        </button>

        <div
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
          style={{ background: "var(--color-navy-light)" }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
            style={{
              background:
                "linear-gradient(135deg, var(--color-forest) 0%, var(--color-sage) 100%)",
            }}
          >
            SK
          </div>
          <div className="min-w-0">
            <div
              className="text-xs font-semibold truncate"
              style={{ color: "var(--color-text)" }}
            >
              {role === "AE" ? "Somchai Kittipong" : "Nattaya Manager"}
            </div>
            <div
              className="text-xs"
              style={{ color: "var(--color-text-muted)" }}
            >
              {role === "AE" ? "AE · South Region" : "Partner Manager · Thailand"}
            </div>
          </div>
        </div>
      </div>
    </>
  )

  return (
    <WorkspaceShellProvider value={{ role, navigate, addNotification }}>
      <div
        className="flex min-h-screen"
        style={{ background: "var(--color-surface)" }}
      >
      {/* ─── Desktop sidebar ─── */}
      <aside
        className="hidden md:flex flex-col w-60 shrink-0 h-screen sticky top-0"
        style={{
          background: "var(--color-card)",
          borderRight: "1px solid var(--color-border)",
          boxShadow: "2px 0 12px rgba(0,0,0,.04)",
        }}
      >
        <SidebarContent />
      </aside>

      {/* ─── Mobile sidebar overlay ─── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
          style={{ background: "rgba(0,0,0,.35)", backdropFilter: "blur(2px)" }}
        />
      )}
      <aside
        className="fixed inset-y-0 left-0 z-50 flex flex-col w-72 md:hidden transition-transform duration-300"
        style={{
          background: "var(--color-card)",
          borderRight: "1px solid var(--color-border)",
          boxShadow: "4px 0 24px rgba(0,0,0,.12)",
          transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
        }}
      >
        <SidebarContent />
      </aside>

      {/* ─── Main area ─── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile topbar */}
        <header
          className="md:hidden flex items-center gap-3 px-4 py-3 border-b sticky top-0 z-30"
          style={{
            background: "var(--color-card)",
            borderColor: "var(--color-border)",
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-xl"
            style={{
              background: "var(--color-surface)",
              color: "var(--color-text)",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M2 4h14M2 9h14M2 14h14"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
            style={{
              background:
                "linear-gradient(135deg, var(--color-navy) 0%, #3B82F6 100%)",
            }}
          >
            AE
          </div>
          <span
            className="font-heading text-sm font-semibold"
            style={{ color: "var(--color-text)" }}
          >
            {navItems.find((n) => n.id === page)?.label}
          </span>
          <button
            className="ml-auto relative"
            onClick={() => setNotifOpen(!notifOpen)}
          >
            <span className="text-lg">🔔</span>
            {unreadCount > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border border-white"
                style={{ background: "var(--color-overdue)" }}
              />
            )}
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <section className={page === "tasks" ? "block" : "hidden"} aria-hidden={page !== "tasks"}>
            <MyTasks />
          </section>
          <section className={page === "onboarding" ? "block" : "hidden"} aria-hidden={page !== "onboarding"}>
            <OnboardingPipeline />
          </section>
          <section className={page === "calendar" ? "block" : "hidden"} aria-hidden={page !== "calendar"}>
            <CalendarView />
          </section>
          <section className={page === "meetings" ? "block" : "hidden"} aria-hidden={page !== "meetings"}>
            <MeetingsTable />
          </section>
          <section className={page === "surveys" ? "block" : "hidden"} aria-hidden={page !== "surveys"}>
            <SurveyView />
          </section>
        </main>

        {/* Mobile bottom nav */}
        <nav
          className="md:hidden grid grid-cols-5 border-t sticky bottom-0 z-30"
          style={{
            background: "var(--color-card)",
            borderColor: "var(--color-border)",
            boxShadow: "0 -2px 12px rgba(0,0,0,.06)",
          }}
        >
          {navItems.map((item) => {
            const active = page === item.id
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className="relative min-w-0 flex flex-col items-center py-2.5 gap-0.5 transition-all"
                style={{
                  color: active
                    ? "var(--color-navy)"
                    : "var(--color-text-muted)",
                }}
              >
                <span className="text-base leading-none">{item.emoji}</span>
                <span
                  className="w-full truncate px-0.5 text-center font-medium"
                  style={{ fontSize: "9px" }}
                >
                  {item.label}
                </span>
                {active && (
                  <span
                    className="absolute bottom-0 w-8 h-0.5 rounded-full"
                    style={{ background: "var(--color-navy)" }}
                  />
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Notification panel */}
      {notifOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setNotifOpen(false)}
          />
          <div
            className="fixed right-4 top-16 md:top-auto md:bottom-20 md:right-4 w-80 rounded-2xl shadow-2xl z-50 border overflow-hidden"
            style={{
              background: "var(--color-card)",
              borderColor: "var(--color-border)",
              boxShadow: "0 12px 40px rgba(0,0,0,.15)",
            }}
          >
            <div
              className="px-4 py-3 border-b flex items-center justify-between"
              style={{ borderColor: "var(--color-border)" }}
            >
              <span
                className="text-sm font-semibold"
                style={{ color: "var(--color-text)" }}
              >
                Notifications
              </span>
              <button
                className="text-xs font-medium"
                style={{ color: "var(--color-navy)" }}
                onClick={markAllRead}
              >
                Mark all read
              </button>
            </div>
            {notifications.map((notification) => (
              <button
                key={notification.id}
                className="w-full px-4 py-3 border-b hover:bg-gray-50 cursor-pointer text-left transition-colors"
                style={{ borderColor: "var(--color-border)" }}
                onClick={() => openNotification(notification)}
              >
                <div className="flex items-start gap-3">
                  <span
                    className="mt-1 w-2 h-2 rounded-full shrink-0"
                    style={{
                      background:
                        notification.read
                          ? "var(--color-border-2)"
                          : notification.type === "error"
                          ? "var(--color-overdue)"
                          : notification.type === "warning"
                            ? "var(--color-amber)"
                            : notification.type === "success"
                              ? "var(--color-forest)"
                              : "var(--color-navy)",
                    }}
                  />
                  <div>
                    <div
                      className="text-xs font-semibold"
                      style={{ color: "var(--color-text)" }}
                    >
                      {notification.title}
                    </div>
                    <div
                      className="text-xs mt-0.5 leading-relaxed"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      {notification.description}
                    </div>
                    <div
                      className="text-xs mt-1"
                      style={{ color: "var(--color-warm-taupe)" }}
                    >
                      {notification.time}
                    </div>
                  </div>
                </div>
              </button>
            ))}
            {notifications.length === 0 && (
              <div className="px-4 py-8 text-center text-xs" style={{ color: "var(--color-text-muted)" }}>
                ไม่มีการแจ้งเตือน
              </div>
            )}
          </div>
        </>
      )}
      </div>
    </WorkspaceShellProvider>
  )
}
