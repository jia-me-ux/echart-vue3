import http from '@/utils/http.js'

export const getStockApi = () => {
  return http.request({
    url: '/stock',
    method: 'GET',
  })
}
