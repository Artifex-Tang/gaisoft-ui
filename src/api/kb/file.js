import request from '@/utils/request'

// 查询文件配置列表
export function listFile(query) {
  return request({
    url: '/kb/file/list',
    method: 'get',
    params: query
  })
}

// 查询文件配置详细
export function getFile(id) {
  return request({
    url: '/kb/file/' + id,
    method: 'get'
  })
}

// 新增文件配置
export function addFile(data) {
  return request({
    url: '/kb/file',
    method: 'post',
    data: data
  })
}

// 修改文件配置
export function updateFile(data) {
  return request({
    url: '/kb/file',
    method: 'put',
    data: data
  })
}

// 删除文件配置
export function delFile(id) {
  return request({
    url: '/kb/file/' + id,
    method: 'delete'
  })
}
