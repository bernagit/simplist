import { createContext, useContext, useState } from 'react'

export type BreadcrumbItem = {
  label: string
  href?: string
}

interface TopbarContextType {
  breadcrumbs: BreadcrumbItem[]
  setBreadcrumbs: (items: BreadcrumbItem[]) => void
  title: string | undefined
  setTitle: (title: string | undefined) => void
  description: string | undefined
  setDescription: (description: string | undefined) => void
  showTitle: boolean
  setShowTitle: (show: boolean) => void
}

const TopbarContext = createContext<TopbarContextType | null>(null)

export function TopbarProvider({ children }: { children: React.ReactNode }) {
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([])
  const [title, setTitle] = useState<string | undefined>(undefined)
  const [description, setDescription] = useState<string | undefined>(undefined)
  const [showTitle, setShowTitle] = useState<boolean>(false)

  return (
    <TopbarContext.Provider
      value={{
        breadcrumbs,
        setBreadcrumbs,
        title,
        setTitle,
        description,
        setDescription,
        showTitle,
        setShowTitle
      }}
    >
      {children}
    </TopbarContext.Provider>
  )
}

export function useTopbar() {
  const context = useContext(TopbarContext)

  if (!context) {
    throw new Error('useTopbar must be used within a TopbarProvider')
  }

  return context
}
