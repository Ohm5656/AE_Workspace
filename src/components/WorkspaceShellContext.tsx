"use client"

import { createContext, useContext } from "react"

export type WorkspacePage =
  | "tasks"
  | "onboarding"
  | "calendar"
  | "meetings"
  | "surveys"

export type WorkspaceRole = "AE" | "Manager"

export interface WorkspaceNotification {
  id: number
  title: string
  description: string
  time: string
  type: "error" | "warning" | "info" | "success"
  target: WorkspacePage
  read: boolean
}

interface NewNotification {
  title: string
  description: string
  type: WorkspaceNotification["type"]
  target: WorkspacePage
}

export interface CreatedCoachingTask {
  id: number
  title: string
  hotel: string
  dueDate: string
  dueStatus: "today" | "soon"
  dueLabel: string
}

interface WorkspaceShellValue {
  role: WorkspaceRole
  navigate: (page: WorkspacePage) => void
  addNotification: (notification: NewNotification) => void
  createdCoachingTasks: CreatedCoachingTask[]
  createCoachingTask: (hotel: string) => void
}

const WorkspaceShellContext = createContext<WorkspaceShellValue | null>(null)

export const WorkspaceShellProvider = WorkspaceShellContext.Provider

export function useWorkspaceShell() {
  const value = useContext(WorkspaceShellContext)

  if (!value) {
    throw new Error("useWorkspaceShell must be used inside WorkspaceShellProvider")
  }

  return value
}
