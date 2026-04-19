import request from '@/utils/request'

// 查询gl列表
export function listDeptSource(query) {
  return request({
    url: '/kb/dept/list',
    method: 'get',
    params: query
  })
}

// 查询gl详细
export function getDept(sourceId) {
  return request({
    url: '/kb/dept/' + sourceId,
    method: 'get'
  })
}

// 新增gl
export function addSourceDept(data) {
  return request({
    url: '/kb/dept',
    method: 'post',
    data: data
  })
}

// 修改gl
export function updateDept(data) {
  return request({
    url: '/kb/dept',
    method: 'put',
    data: data
  })
}

// 删除gl
export function delDept(sourceId) {
  return request({
    url: '/kb/dept/' + sourceId,
    method: 'delete'
  })
}
