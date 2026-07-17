import { ListRepository } from '../list/list.repository.js'
import { SectionRepository } from '../section/section.repository.js'
import { TaskRepository } from '../task/task.repository.js'

export class BaseService {
  private readonly listRepository: ListRepository = new ListRepository()
  private readonly sectionRepository: SectionRepository = new SectionRepository()
  private readonly taskRepository: TaskRepository = new TaskRepository()
  constructor() {}

  async search(userId: string, query: string) {
    const lists = await this.listRepository.search(userId, query)
    const sections = await this.sectionRepository.search(userId, query)
    // const tasks = await this.taskRepository.search(userId, query)

    return {
      lists,
      sections,
      tasks: []
    }
  }
}
