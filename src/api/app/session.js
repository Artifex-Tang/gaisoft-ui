import request from '@/utils/request'

// 查询session列表
export function listSession(query) {
  return request({
    url: '/aftersales/session/list',
    method: 'get',
    params: query
  })
}

// 查询session详细
export function getSession(id) {
  return request({
    url: '/aftersales/session/' + id,
    method: 'get'
  })
}

// 新增session
export function addSession(data) {
  return request({
    url: '/aftersales/session',
    method: 'post',
    data: data
  })
}

// 修改session
export function updateSession(data) {
  return request({
    url: '/aftersales/session',
    method: 'put',
    data: data
  })
}

// 删除session
export function delSession(id) {
  return request({
    url: '/aftersales/session/' + id,
    method: 'delete'
  })
}
