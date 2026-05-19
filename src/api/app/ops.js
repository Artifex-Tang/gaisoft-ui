//智能问答API
import request from "@/utils/request";
import ragflowReq from "@/utils/ragflowReq";
import { getToken } from '@/utils/auth'

//通用请求ragFlow方法
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
  let url = `/api/v1/chats?page=${page}&page_size=${page_size}&orderby=${orderby}&desc=${desc}&name=${name}`;
  return ragflowReq({
    url: url,
    method: "get",
  });
}
export function getAssistant(id) {
   let url = `/api/v1/chats?id=${id}`;
  return ragflowReq({
    url: url,
    method: "get",
  });
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
  let url = `/api/v1/chats/${chat_id}/sessions?page=${page}&page_size=${page_size}&orderby=${orderby}&desc=${desc}&name=${session_name}&id=${session_id}`;
  return ragflowReq({
    url: url,
    method: "get",
  });
}
//删除session(智能问答聊天记录）
export function delChatSession(chat_id, ids) {
  let url = `/api/v1/chats/${chat_id}/sessions`;
  return ragflowReq({
    url: url,
    method: "delete",
    data: {
      ids: ids,
    },
  });
}

//添加session(智能问答聊天记录）
export function addChatSession(chat_id, sessionName) {
  let url = `/api/v1/chats/${chat_id}/sessions`;
  return ragflowReq({
    url: url,
    method: "post",
    data: {
      name: sessionName,
    },
  });
}

//与assistant 发起对话
export function chat(chat_id, question, session_id, stream = true) {
  let url = `/api/v1/chats/${chat_id}/completions`;
  return ragflowReq({
    url: url,
    method: "post",
    data: {
      question: question,
      session_id: session_id,
      stream: stream,
    },
  });
}

export async function chat2(chat_id, question, session_id, stream = true) {
  let endpoint = `http://115.190.23.140/api/v1/chats/${chat_id}/completions`;
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer IyZDQ4ZmFhNTMxNjExZjBiZDM0MDI0Mm`,
  };
  const response = await fetch(endpoint, {
    method: "POST",
    headers: headers,
    body: JSON.stringify({
      question: question,
      session_id: session_id,
      stream: stream,
    }),
  });

  let resContent="";

 
}

//获取知识库
export async function loadDataset(page=1,page_size=999,orderby="create_time ",desc=true){
  let url = `/api/v1/datasets?page=${page}&page_size=${page_size}&orderby=${orderby}&desc=${desc}`;
  return ragflowReq({
    url: url,
    method: "get",
  });
}

