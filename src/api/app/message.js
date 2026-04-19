import request from '@/utils/request'

// 查询聊天记录同步列表
export function listMessage(query) {
  return request({
    url: '/aftersales/chat/list',
    method: 'get',
    params: query
  })
}

// 查询聊天记录同步详细
export function getMessage(id) {
  return request({
    url: '/aftersales/chat/' + id,
    method: 'get'
  })
}

// 新增聊天记录同步
export function addMessage(data) {
  return request({
    url: '/aftersales/chat',
    method: 'post',
    data: data
  })
}

// 修改聊天记录同步
export function updateMessage(data) {
  return request({
    url: '/aftersales/chat',
    method: 'put',
    data: data
  })
}

// 删除聊天记录同步
export function delMessage(id) {
  return request({
    url: '/aftersales/chat/' + id,
    method: 'delete'
  })
}
