import request from '@/utils/request'

// 查询维修服务商管理列表
export function listSpareparts(query) {
  return request({
    url: '/repair/spareparts/list',
    method: 'get',
    params: query
  })
}

// 查询维修服务商管理详细
export function getSpareparts(providerId) {
  return request({
    url: '/repair/spareparts/' + providerId,
    method: 'get'
  })
}

// 新增维修服务商管理
export function addSpareparts(data) {
  return request({
    url: '/repair/spareparts',
    method: 'post',
    data: data
  })
}

// 修改维修服务商管理
export function updateSpareparts(data) {
  return request({
    url: '/repair/spareparts',
    method: 'put',
    data: data
  })
}

// 删除维修服务商管理
export function delSpareparts(providerId) {
  return request({
    url: '/repair/spareparts/' + providerId,
    method: 'delete'
  })
}
