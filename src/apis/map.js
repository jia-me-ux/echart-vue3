import http from '@/utils/http.js'

export const getMapApi = () => {
  return http.request({
    url: '/map',
    method: 'GET',
  })
}
