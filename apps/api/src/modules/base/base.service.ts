import { ListRepository } from '../list/list.repository.js'
import { SectionRepository } from '../section/section.repository.js'
import { TaskRepository } from '../task/task.repository.js'

const TASK_SEARCH_LIMIT = 20

export class BaseService {
  private readonly listRepository: ListRepository = new ListRepository()
  private readonly sectionRepository: SectionRepository = new SectionRepository()
  private readonly taskRepository: TaskRepository = new TaskRepository()
  constructor() {}

  async search(userId: string, query: string) {
    const [lists, sections, tasks] = await Promise.all([
      this.listRepository.search(userId, query),
      this.sectionRepository.search(userId, query),
      this.taskRepository.search(userId, query, TASK_SEARCH_LIMIT)
    ])

    return { lists, sections, tasks }
  }
}
