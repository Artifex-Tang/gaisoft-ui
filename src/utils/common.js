import MarkdownIt from 'markdown-it'
import { ref, onMounted, nextTick, h, render, getCurrentInstance } from 'vue';
import { ElPopover, ElButton, ElMessage } from 'element-plus';
import { requestStream } from "@/api/app/ops.js";
import useSettingsStore from '@/store/modules/settings'


// let baseUrl = import.meta.env.VITE_APP_BASE_API
// let ragFlowUrl =useSettingsStore().ragFlow_API //import.meta.env.VITE_APP_RagFlow_API

async function int(){
    let store= useSettingsStore()
    let ragFlow_API= store.ragFlow_API
    //console.log('common.js',ragFlow_API)
    if(ragFlow_API==''){
        await store.setRagFlow_API()
        common.ragFlowUrl=store.ragFlow_API
    }
}
int()

let previewFileTypes = ['pdf', 'xls', 'xlsx', 'ppt', 'pptx', 'doc', 'docx', 'png', 'jpg']
let common = {
    baseUrl: import.meta.env.VITE_APP_BASE_API,
    ragFlowUrl: useSettingsStore().ragFlow_API,

    //公共预览文件(浏览器端打开)
    commonPreviewFile: (fileId, fileName, fileExt) => {
        if (!previewFileTypes.includes(fileExt)) {
            ElMessage.warning('该文件类型暂不支持预览')
            return;
        }

         //let pdfUrl = `${common.baseUrl}/file/proxyOther?fileUrl=${common.ragFlowUrl}/v1/document/get/${fileId}&suffix=${fileExt}`;// "http://115.190.23.140/v1/document/get/ce84eddc58a611f080b00242ac120006" //url
        
        // let fileUrl=`${common.ragFlowUrl}/document/${fileId}?ext=${fileExt}&prefix=file`
        // console.log('fileUrl',fileUrl)
        //  let pdfUrl = `${common.baseUrl}/file/proxyOther?suffix=${fileExt}&fileUrl=${encodeURIComponent(common.str2Base64(fileUrl))}`;
        //  console.log('pdfUrl', pdfUrl)
        // //window.open(pdfUrl, '_blank')
        // window.open(`${common.baseUrl}/filePage?url=${common.str2Base64(fileUrl)}`, '_blank');

        if(fileExt=='pdf'){
                let pdfUrl = `${common.baseUrl}/file/view?pdfUrl=${common.ragFlowUrl}/v1/document/get/${fileId}`;// "http://115.190.23.140/v1/document/get/ce84eddc58a611f080b00242ac120006" //url
                //console.log('pdfUrl', pdfUrl)
                window.open(pdfUrl, '_blank')
        }
        else{//执行下载
            ElMessage.warning('该文件类型暂不支持预览')
            // common.commonDownloadFile(fileId, fileName, fileExt);
            return; 
        }

        //let url = common.ragFlowUrl + `/document/${fileId}?ext=${fileExt}&prefix=file`
        //let url = `${common.ragFlowUrl}/v1/file/get/${fileId}&fileName=$(common.str2Base64(fileName))}`
        // let url= `${common.ragFlowUrl}/v1/document/get/${fileId}`
        // window.open(url)
        //window.open(`${common.baseUrl}/fliePage?url=${common.str2Base64(url)}`);
        
    },
    //公共下载文件
    commonDownloadFile: (fileId, fileName, fileExt) => {
        let url = `${common.baseUrl}/kb/download?url=${common.ragFlowUrl}/v1/file/get/${fileId}&fileName=${encodeURIComponent(common.str2Base64(fileName))}`
        console.log('下载文件url', url)
        let a = document.createElement('a')
        a.target = '_blank'
        a.href = url
        a.download = fileName
        a.click()
    },
    //将时间戳转换为日期
    timestampToTime: (timestamp) => {
        let date = new Date(timestamp);
        let Y = date.getFullYear() + '-';
        let M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
        let D = date.getDate() + ' ';
        let h = date.getHours() + ':';
        let m = date.getMinutes() + ':';
        let s = date.getSeconds();
        return Y + M + D + h + m + s;
    },
    file2Base64: async (file) => {
        return new Promise((resolve, reject) => {
            let reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = function (e) {
                resolve(e.target.result)
            }
            reader.onerror = function (e) {
                reject(e.target.error)
            }
        })
    },
    //字符串转base64
    str2Base64: (str) => {
        return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (match, p1) {
            return String.fromCharCode('0x' + p1);
        }));
    },
    debounce: (() => {
        let timer = null;
        return (callback, time = 800) => {
            timer && clearTimeout(timer);
            timer = setTimeout(callback, time);
        }
    })(),


    //解析Answer
    packageAnswer: (answerStr,) => {

answerStr=answerStr.replaceAll('begin_search_query|>','').replaceAll('<|end_search_query|>','').replaceAll('<|begin_search_result|>','')
.replaceAll('<|end_search_result|>','').replaceAll('END_SEARCH_QUERY >','')

        let thinkStr="";
        let thinkHtml="";
        if(answerStr.includes("<think>")){
            try {
                let match=answerStr.match(/<think>([\s\S]*?)<\/think>/g)
                console.log('match',match)
                thinkHtml=match[0]
                answerStr=answerStr.replace(/<think>([\s\S]*?)<\/think>/g,"")
            }
            catch(e){
                console.log('解析thinkStr出错',e)
                console.log('当前answerStr',answerStr)
                thinkStr=""
            }
           // answerStr=answerStr.replaceAll('<think>',"<div style='color: #8a8a8a'>").replaceAll('</think>',"</div>")
            
        }

        

        //将answerStr转换为markdown格式 
        let md = new MarkdownIt();
        let htmlStr = md.render(answerStr)
        if(thinkStr){
            thinkHtml=md.render(thinkStr)
        }


        const regex1 = /##(\d+)\$\$/g; // ##1$$
        //定义regex2匹配  [ID:2]
        const regex2= /\[ID:(\d+)\]/g;
        //return htmlStr

        let result = htmlStr.replace(regex1, (_, id) =>
            `<span class="popover-placeholder" data-id="${id}"></span>`
        );
        result = result.replace(regex2, (_, id) =>
            `<span class="popover-placeholder" data-id="${id}"></span>`
        );
        //result=result.replace('<think>',"<div style='color: #8a8a8a'>").replace('</think>',"</div>")
        //console.log('result',result)

        let res=`<div style="color:#818483;">${thinkHtml}</div>`+result
        //console.log('----',res)
       return res
    },

    //随机生成32为小写字母和数字的组合(生成时根据当前时间  尽量保证不重复)
    randomStr: () => {
        let str = '';
        for (let i = 0; i < 32; i++) {
            let num = Math.floor(Math.random() * 62);
            if (num < 10) {
                str += num;
            } else if (num < 36) {
                str += String.fromCharCode(num - 10 + 97);
            } else {
                str += String.fromCharCode(num - 36 + 65);
            }
        }
        return str.toLocaleLowerCase();
    },

    //流式数据处理
    streamModelResponse: async (requestData, onMessage, onComplete, onError, isStop) => {
        try {
            // 发送 POST 请求
            const response = await requestStream(requestData)

            if (!response.ok) {
                throw new Error(`请求失败: ${response.status} ${response.statusText}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();

                if (done) {
                    onComplete?.();
                    break;
                }

                buffer += decoder.decode(value, { stream: true });

                // 处理自定义流格式
                buffer = common.processCustomStream(buffer, onMessage);
                //onMessage?.(buffer);

                let stopFlag = isStop?.();
                if (stopFlag) {
                    done = true;
                    return;
                }
            }
        } catch (error) {
            ElMessage.error(`对话请求失败：${error.message}`)
            onError?.(error);
        }
    },

    // 处理 SSE 格式数据 — ragflow 0.18.0 compatible
    processCustomStream: (buffer, onMessage) => {
        const events = buffer.split('\n\n');

        // 保留未完成的事件（最后部分）
        let remaining = events.pop() || '';

        for (const event of events) {
            const trimmedEvent = event.trim();
            if (!trimmedEvent) continue;

            try {
                // 提取有效 JSON 部分（去除 "data:" 前缀）
                const jsonStart = trimmedEvent.indexOf('{');
                if (jsonStart === -1) continue;

                const jsonStr = trimmedEvent.slice(jsonStart);
                const data = JSON.parse(jsonStr);

                // ragflow 0.18.0 streaming format:
                // Content: {"code":0, "data":{"answer":"text","reference":{}}}
                // End: {"code":0, "data":true} or {"code":0, "data":{"answer":""}}
                if (data.code === 0) {
                    if (data.data === true) {
                        onMessage?.('', true);
                    } else if (data.data && typeof data.data === 'object' && data.data.answer !== undefined) {
                        if (data.data.answer !== '') {
                            onMessage?.(data.data);
                        }
                    }
                } else if (data.code && data.code !== 0) {
                    console.warn('ragflow error:', data.message);
                    ElMessage.error(`Ragflow返回错误(code ${data.code})：${data.message || '未知错误'}`)
                }
            } catch (e) {
                console.warn('解析JSON失败:', e, '数据:', trimmedEvent);
            }
        }

        return remaining;
    },



}
export default common;