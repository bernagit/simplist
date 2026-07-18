import ky from 'ky'

const api = ky.extend({
  prefix: 'api/',
  cache: 'no-store'
  // credentials: 'include'
})

export default api
