import ListPage from "@/components/list/ListPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Shared Lists',
  description: 'View and manage your shared lists.'
}

export default function Page() {
  return (
    <ListPage />
  )
}