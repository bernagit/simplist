export interface Resp<T> {
  data: T
  message: string
}

export type ErrorResponse = {
  message: string
  statusCode: number
}
