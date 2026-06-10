//智能问答API
import request from "@/utils/request";
import { getToken } from '@/utils/auth'

//通用请求ragFlow方法（经 gaisoft-server 代理，统一 API Key 认证）
export function commonReqRagFlowServer(url,method,params){
   return request({
      url: '/ragflow/common',
      method: 'post',
      data:{
        url:url,
        params:params,
        method:method
      }
    })
}
//
export function requestStream(params){

  let serverUrl=import.meta.env.VITE_APP_BASE_API
  const headers={
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
    }

    return fetch(serverUrl+'/proxy/stream',{
      method:'POST',
      headers:headers,
      body:JSON.stringify(params)
    })

   
}

//提交文件分类
export function submitFileClassify(data) {
   return request({
    url: '/kb/file',
    method: 'post',
    data: data
  })
}
//根据文件ids获取文件类别
export function loadTypesByFileIds(ids) {
   return request({
    url: '/kb/file/listByIds',
    method: 'post',
    data: ids
  })
}

//session(智能问答聊天记录）)
export function listSession(query) {
  return request({
    url: '/aftersales/session/list',
    method: 'get',
    params: query
  })
}
export function addSession(data) {
  return request({
    url: '/aftersales/session',
    method: 'post',
    data: data
  })
}
export function delSession(id) {
  return request({
    url: '/aftersales/session/' + id,
    method: 'delete'
  })
}

//消息
export function listMessage(query) {
  return request({
    url: '/aftersales/chat/list',
    method: 'get',
    params: query
  })
}

export function addMessage(data) {
  return request({
    url: '/aftersales/chat',
    method: 'post',
    data: data
  })
}
export function delMessage(id) {
  return request({
    url: '/aftersales/chat/' + id,
    method: 'delete'
  })
}

//获取图标
export function getIcon(id) {
  return request({
    url: '/kb/icon/' + id,
    method: 'get'
  })
}








//获取助理列表
export function getAssistants(
  page = 1,
  page_size = 10,
  name="",
  orderby = "create_time",
  desc = true
) {
  return commonReqRagFlowServer(`/api/v1/chats?page=${page}&page_size=${page_size}&orderby=${orderby}&desc=${desc}&name=${name}`, "get", null);
}
export function getAssistant(id) {
  return commonReqRagFlowServer(`/api/v1/chats?id=${id}`, "get", null);
}


//获取session（智能问答聊天记录）
export function loadChatSession(
  chat_id,
  page = 1,
  page_size = 10,
  orderby = "create_time",
  desc = true,
  session_name = "",
  session_id = ""
) {
  return commonReqRagFlowServer(`/api/v1/chats/${chat_id}/sessions?page=${page}&page_size=${page_size}&orderby=${orderby}&desc=${desc}&name=${session_name}&id=${session_id}`, "get", null);
}
//删除session(智能问答聊天记录）
export function delChatSession(chat_id, ids) {
  return commonReqRagFlowServer(`/api/v1/chats/${chat_id}/sessions`, "delete", JSON.stringify({ids: ids}));
}

//添加session(智能问答聊天记录）
export function addChatSession(chat_id, sessionName) {
  return commonReqRagFlowServer(`/api/v1/chats/${chat_id}/sessions`, "post", JSON.stringify({name: sessionName}));
}

//与assistant 发起对话
export function chat(chat_id, question, session_id, stream = true) {
  return commonReqRagFlowServer(`/api/v1/chats/${chat_id}/completions`, "post", JSON.stringify({
    question: question,
    session_id: session_id,
    stream: stream,
  }));
}

//获取知识库
export async function loadDataset(page=1,page_size=999,orderby="create_time ",desc=true){
  return commonReqRagFlowServer(`/api/v1/datasets?page=${page}&page_size=${page_size}&orderby=${orderby}&desc=${desc}`, "get", null);
}

