import { Resp } from "@/models/base";
import { AllList } from "@/models/lists";
import api from "@/utils/ky";


async function getLists(): Promise<Resp<AllList>> {
    return await api.get("lists").json();
}

export const listsService = {
    getLists
};