import http from '@/utils/http.js'

export const getHotApi = () => {
  return http.request({
    url: '/hotProduct',
    method: 'GET',
  })
}
