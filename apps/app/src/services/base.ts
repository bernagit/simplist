import { Resp, SearchData } from "@/models/base";
import api from "@/utils/ky";

async function globalSearch(query: string): Promise<Resp<SearchData>> {
  return await api.get("base/search", { searchParams: { q: query } }).json();
}

export const baseService = {
  globalSearch
}