"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

export type MeetingStatus =
  | "Draft"
  | "Sent"
  | "Waiting Confirm"
  | "Confirmed"
  | "Completed"
  | "Declined"
  | "Postponed"
  | "No-show"

export type MeetingType = "ORM" | "Marcom"
export type SurveyStatus = "Pending" | "Submitted" | "N/A" | "Overdue"

export interface Meeting {
  id: number
  hotel: string
  type: MeetingType
  ownerAE: string
  tier: "A" | "B" | "C"
  tierPct: number
  orm: string
  date: string
  time: string
  status: MeetingStatus
  surveyStatus: SurveyStatus
  hotelStatus: string
  note?: string
}

export type NewMeeting = Omit<Meeting, "id">

const initialMeetings: Meeting[] = [
  { id: 1, hotel: "Riverside Krabi Resort", type: "ORM", ownerAE: "Somchai K.", tier: "A", tierPct: 92, orm: "Niran T.", date: "2026-09-10", time: "09:00", status: "Completed", surveyStatus: "Submitted", hotelStatus: "Active" },
  { id: 2, hotel: "Sunset Villa Phuket", type: "Marcom", ownerAE: "Pranee S.", tier: "A", tierPct: 88, orm: "Wanchai P.", date: "2026-09-12", time: "13:00", status: "Completed", surveyStatus: "Submitted", hotelStatus: "Active" },
  { id: 3, hotel: "Bay Resort Pattaya", type: "ORM", ownerAE: "Somchai K.", tier: "B", tierPct: 74, orm: "Niran T.", date: "2026-09-15", time: "09:00", status: "Completed", surveyStatus: "Overdue", hotelStatus: "Active" },
  { id: 4, hotel: "Ocean View Koh Samui", type: "Marcom", ownerAE: "Wanchai P.", tier: "A", tierPct: 95, orm: "Pranee S.", date: "2026-09-23", time: "15:00", status: "Confirmed", surveyStatus: "N/A", hotelStatus: "Active" },
  { id: 5, hotel: "Hillside Chiang Mai", type: "ORM", ownerAE: "Somchai K.", tier: "B", tierPct: 80, orm: "Niran T.", date: "2026-09-25", time: "13:00", status: "Confirmed", surveyStatus: "N/A", hotelStatus: "Active" },
  { id: 6, hotel: "Azure Beach Hua Hin", type: "Marcom", ownerAE: "Niran T.", tier: "B", tierPct: 65, orm: "Wanchai P.", date: "2026-09-28", time: "09:00", status: "Waiting Confirm", surveyStatus: "N/A", hotelStatus: "Onboarding" },
  { id: 7, hotel: "Palm Garden Rayong", type: "ORM", ownerAE: "Somchai K.", tier: "C", tierPct: 50, orm: "Niran T.", date: "2026-09-30", time: "13:00", status: "Sent", surveyStatus: "N/A", hotelStatus: "Onboarding" },
  { id: 8, hotel: "Lagoon Resort Krabi", type: "Marcom", ownerAE: "Pranee S.", tier: "B", tierPct: 71, orm: "Wanchai P.", date: "2026-10-02", time: "15:00", status: "Draft", surveyStatus: "N/A", hotelStatus: "Active" },
  { id: 9, hotel: "Mountain View Pai", type: "ORM", ownerAE: "Wanchai P.", tier: "C", tierPct: 45, orm: "Niran T.", date: "2026-10-05", time: "09:00", status: "Draft", surveyStatus: "N/A", hotelStatus: "Active" },
  { id: 10, hotel: "Ocean View Phuket + Sunset Villa", type: "Marcom", ownerAE: "Somchai K.", tier: "A", tierPct: 90, orm: "Pranee S.", date: "2026-09-08", time: "13:00", status: "Completed", surveyStatus: "Submitted", hotelStatus: "Active" },
  { id: 11, hotel: "Sea Breeze Trat", type: "ORM", ownerAE: "Niran T.", tier: "C", tierPct: 52, orm: "Wanchai P.", date: "2026-09-06", time: "09:00", status: "Declined", surveyStatus: "N/A", hotelStatus: "Active" },
  { id: 12, hotel: "Hilltop View Chiang Rai", type: "Marcom", ownerAE: "Pranee S.", tier: "A", tierPct: 85, orm: "Niran T.", date: "2026-09-18", time: "15:00", status: "Postponed", surveyStatus: "N/A", hotelStatus: "Active" },
  { id: 13, hotel: "Lotus Garden Sukhothai", type: "ORM", ownerAE: "Somchai K.", tier: "B", tierPct: 68, orm: "Wanchai P.", date: "2026-09-20", time: "13:00", status: "No-show", surveyStatus: "N/A", hotelStatus: "Active" },
]

interface MeetingContextValue {
  meetings: Meeting[]
  addMeeting: (meeting: NewMeeting) => Meeting
  updateMeeting: (id: number, updates: Partial<Meeting>) => void
}

const MeetingContext = createContext<MeetingContextValue | null>(null)

export function MeetingProvider({ children }: { children: ReactNode }) {
  const [meetings, setMeetings] = useState<Meeting[]>(initialMeetings)

  function addMeeting(meeting: NewMeeting) {
    const created = {
      ...meeting,
      id: Math.max(0, ...meetings.map((item) => item.id)) + 1,
    }
    setMeetings((current) => [...current, created])
    return created
  }

  function updateMeeting(id: number, updates: Partial<Meeting>) {
    setMeetings((current) =>
      current.map((meeting) =>
        meeting.id === id ? { ...meeting, ...updates } : meeting,
      ),
    )
  }

  return (
    <MeetingContext.Provider value={{ meetings, addMeeting, updateMeeting }}>
      {children}
    </MeetingContext.Provider>
  )
}

export function useMeetings() {
  const value = useContext(MeetingContext)
  if (!value) throw new Error("useMeetings must be used inside MeetingProvider")
  return value
}
