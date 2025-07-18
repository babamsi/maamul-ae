"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface DialogContextType {
  isAnyDialogOpen: boolean
  setDialogOpen: (open: boolean) => void
}

const DialogContext = createContext<DialogContextType | undefined>(undefined)

export function DialogProvider({ children }: { children: ReactNode }) {
  const [isAnyDialogOpen, setIsAnyDialogOpen] = useState(false)

  const setDialogOpen = (open: boolean) => {
    setIsAnyDialogOpen(open)
  }

  return <DialogContext.Provider value={{ isAnyDialogOpen, setDialogOpen }}>{children}</DialogContext.Provider>
}

export function useDialog() {
  const context = useContext(DialogContext)
  if (context === undefined) {
    throw new Error("useDialog must be used within a DialogProvider")
  }
  return context
}
