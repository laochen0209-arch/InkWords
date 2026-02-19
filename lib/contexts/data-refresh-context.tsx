"use client"

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react"

interface DataRefreshContextType {
  refreshTrigger: number
  triggerRefresh: () => void
  lastRefreshTime: Date | null
}

const DataRefreshContext = createContext<DataRefreshContextType | undefined>(undefined)

export function DataRefreshProvider({ children }: { children: ReactNode }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null)

  const triggerRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1)
    setLastRefreshTime(new Date())
    console.log('[DataRefresh] 数据刷新已触发')
  }, [])

  const value: DataRefreshContextType = {
    refreshTrigger,
    triggerRefresh,
    lastRefreshTime,
  }

  return (
    <DataRefreshContext.Provider value={value}>
      {children}
    </DataRefreshContext.Provider>
  )
}

export function useDataRefresh() {
  const context = useContext(DataRefreshContext)
  if (!context) {
    throw new Error("useDataRefresh must be used within a DataRefreshProvider")
  }
  return context
}
