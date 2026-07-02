import { createContext, useContext, useState } from "react";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

interface TopbarContextType {
  breadcrumbs: BreadcrumbItem[];
  setBreadcrumbs: (items: BreadcrumbItem[]) => void;
}

const TopbarContext = createContext<TopbarContextType | null>(null);

export function TopbarProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);

  return (
    <TopbarContext.Provider value={{ breadcrumbs, setBreadcrumbs }}>
      {children}
    </TopbarContext.Provider>
  );
}

export function useTopbar() {
  const context = useContext(TopbarContext);

  if (!context) {
    throw new Error("useTopbar must be used within a TopbarProvider");
  }

  return context;
}