import request from '@/utils/request'

// 查询文件分类列表
export function listType(query) {
  return request({
    url: '/kb/type/list',
    method: 'get',
    params: query
  })
}

export function listTypeAndDept(query) {
  return request({
    url: '/kb/type/listAndDept',
    method: 'get',
    params: query
  })
}

// 查询文件分类详细
export function getType(id) {
  return request({
    url: '/kb/type/' + id,
    method: 'get'
  })
}

// 新增文件分类
export function addType(data) {
  return request({
    url: '/kb/type',
    method: 'post',
    data: data
  })
}

// 修改文件分类
export function updateType(data) {
  return request({
    url: '/kb/type',
    method: 'put',
    data: data
  })
}

// 删除文件分类
export function delType(id) {
  return request({
    url: '/kb/type/' + id,
    method: 'delete'
  })
}
