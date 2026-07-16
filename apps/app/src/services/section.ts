import { Resp } from '@/models/base'
import { CreateSectionInput, Section } from '@/models/section'
import api from '@/utils/ky'

async function createSection(input: CreateSectionInput): Promise<Resp<Section>> {
  return await api
    .post<Resp<Section>>('sections', {
      json: {
        listId: input.listId,
        title: input.title,
        order: input.order
      }
    })
    .json()
}

async function updateSection(
  sectionId: string,
  input: Partial<CreateSectionInput>
): Promise<Resp<Section>> {
  return await api
    .put<Resp<Section>>(`sections/${sectionId}`, {
      json: {
        title: input.title,
        order: input.order
      }
    })
    .json()
}

async function deleteSection(sectionId: string): Promise<Resp<null>> {
  return await api.delete<Resp<null>>(`sections/${sectionId}`).json()
}

export const sectionService = {
  createSection,
  updateSection,
  deleteSection
}
