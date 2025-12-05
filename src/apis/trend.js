import http from '@/utils/http'

export const getTrendApi = () => {
  return http.request({
    url: '/trend',
    method: 'GET',
  })
}
