import { Resp } from "@/models/base";
import { CreateSectionInput, Section } from "@/models/section";
import api from "@/utils/ky";

async function createSection(
  input: CreateSectionInput
): Promise<Resp<Section>> {
  return await api.post<Resp<Section>>('sections', {
    json: {
      listId: input.listId,
      title: input.title,
      order: input.order
    }
  }).json();
}

export const sectionService = {
  createSection
};