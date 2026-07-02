import { Resp } from "@/models/base";
import { AllList, CompleteList, List, UpdateListInput } from "@/models/lists";
import api from "@/utils/ky";


async function getLists(): Promise<Resp<AllList>> {
    return await api.get("lists").json();
}

async function getListById(listId: string): Promise<Resp<CompleteList>> {
    return await api.get(`lists/${listId}`).json();
}

async function updateList(data: UpdateListInput): Promise<Resp<List>> {
    return await api.put(`lists/${data.id}`, { json: data }).json();
}

export const listsService = {
    getLists,
    getListById,
    updateList
};