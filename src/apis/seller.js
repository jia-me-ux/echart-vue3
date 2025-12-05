import http from '@/utils/http.js'

export const getSellerApi=()=>{
  return http.request({
    url:'/seller',
    method:'GET',
  })
}
