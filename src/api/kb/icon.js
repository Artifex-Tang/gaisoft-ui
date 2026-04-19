import request from '@/utils/request'

// 查询图标管理列表
export function listIcon(query) {
  return request({
    url: '/kb/icon/list',
    method: 'get',
    params: query
  })
}

// 查询图标管理详细
export function getIcon(id) {
  return request({
    url: '/kb/icon/' + id,
    method: 'get'
  })
}

// 新增图标管理
export function addIcon(data) {
  return request({
    url: '/kb/icon',
    method: 'post',
    data: data
  })
}

// 修改图标管理
export function updateIcon(data) {
  return request({
    url: '/kb/icon',
    method: 'put',
    data: data
  })
}

// 删除图标管理
export function delIcon(id) {
  return request({
    url: '/kb/icon/' + id,
    method: 'delete'
  })
}
