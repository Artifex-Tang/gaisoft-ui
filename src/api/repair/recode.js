import request from '@/utils/request'

// 查询售后问题登记列表
export function listRecode(query) {
  return request({
    url: '/repair/recode/list',
    method: 'get',
    params: query
  })
}

// 查询售后问题登记详细
export function getRecode(issueId) {
  return request({
    url: '/repair/recode/' + issueId,
    method: 'get'
  })
}

// 新增售后问题登记
export function addRecode(data) {
  return request({
    url: '/repair/recode',
    method: 'post',
    data: data
  })
}

// 修改售后问题登记
export function updateRecode(data) {
  return request({
    url: '/repair/recode',
    method: 'put',
    data: data
  })
}

// 删除售后问题登记
export function delRecode(issueId) {
  return request({
    url: '/repair/recode/' + issueId,
    method: 'delete'
  })
}
