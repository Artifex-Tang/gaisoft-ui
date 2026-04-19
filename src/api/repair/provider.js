import request from '@/utils/request'

// 查询维修服务商备件管理列表
export function listProvider(query) {
  return request({
    url: '/repair/provider/list',
    method: 'get',
    params: query
  })
}

// 查询维修服务商备件管理详细
export function getProvider(sparePartId) {
  return request({
    url: '/repair/provider/' + sparePartId,
    method: 'get'
  })
}

// 新增维修服务商备件管理
export function addProvider(data) {
  return request({
    url: '/repair/provider',
    method: 'post',
    data: data
  })
}

// 修改维修服务商备件管理
export function updateProvider(data) {
  return request({
    url: '/repair/provider',
    method: 'put',
    data: data
  })
}

// 删除维修服务商备件管理
export function delProvider(sparePartId) {
  return request({
    url: '/repair/provider/' + sparePartId,
    method: 'delete'
  })
}
