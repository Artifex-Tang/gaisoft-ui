<script setup>
import { ref, onMounted, nextTick } from "vue";
import { getConfigKey } from '@/api/system/config'
import { Delete, Edit, Search, Share, Upload, Refresh } from '@element-plus/icons-vue'
import { ElNotification, ElMessageBox, ElMessage, ElLoading } from 'element-plus'
import { listMessage, addMessage, delMessage, getAssistant, requestStream } from "@/api/app/ops.js";
import tab from "@/plugins/tab.js";
import {getIcon} from "@/api/kb/icon.js";
import { useRouter, useRoute } from "vue-router"
import common from "@/utils/common.js";
import PdfViewer from '@/components/PdfViewer/PdfViewer.vue'
import useUserStore from "@/store/modules/user.js"
import chatView from "@/components/customApp/chatView.vue"
const router = useRouter();
const route = useRoute();


let assistantUrl=ref('')
let userUrl=ref('')
let loadRagFlowInfo = async () => {

    let tempAssistantUrl = await getIcon(1);
    if (tempAssistantUrl.code == 200) {
        assistantUrl.value=import.meta.env.VITE_APP_BASE_API+tempAssistantUrl.data.icon
    }
    else{
        assistantUrl.value="/public/imgs/defaultChatAssistant.png"
    }
    let urer=useUserStore().avatar||"/imgs/defaultUser.png"
    userUrl.value=urer
    //let userUrl=
}


//获取当前助理
let curentAssistant = ref(null)
let loadCurrentAssistant = async () => {
    let currentAssistant = JSON.parse(localStorage.getItem('currentAssistant') || "{}")
    let chatId = currentAssistant.id || "0"
    if (chatId == "0") {
        ElMessage({ message: '助理信息获取失败，请关闭本页重新选择助理', type: 'error', duration: 3 * 1000 });
        return false
    }
    curentAssistant.value = currentAssistant
}
let closeAssistant = () => {
    let chat_id = route.query.chat_id
    let obj = { path: "/assistant/assitantSession", query: { chatId: chat_id } };
    tab.closeOpenPage(obj)
}


//消息列表
let messageList = ref([])
let loadMessageList = async () => {
    let chat_id = route.query.chat_id
    let sessionId = route.query.sessionId
    let res = await listMessage({ chatId: chat_id, sessionId, pageNum: 1, pageSize: 999, order: 'asc' });
    if (res.code == 200) {
        for (let item of res.rows) {
            item['done']=true;
            if (item.packageContent && item.packageContent != 'null') {
                try {
                    item.packageContent = JSON.parse(item.packageContent)
                }
                catch (e) {

                }
            }
            if (item.reference && item.reference != 'null') {
                try {
                    item.reference = JSON.parse(item.reference)
                }
                catch (e) {

                }
            }
        }
        messageList.value = res.rows
        scrollToBottom();
    }

}

let init = async () => {
    await loadRagFlowInfo();
    loadCurrentAssistant();//加载助理
    await loadMessageList();//加载消息列表

    //加载当前问题
    let curentQuestionStr = localStorage.getItem('curentQuestionStr') || ""
    if (curentQuestionStr != '') {
        searchInput.value = curentQuestionStr
        localStorage.removeItem('curentQuestionStr');
        //执行询问
        converseWithChatAssistant()
    }
}


//提交问题
let searchRequestiing = ref(false);
let searchInput = ref('')
let submit = () => {
    if (searchInput.value == '') {
        ElMessage({ message: '请输入问题内容', type: 'error', duration: 3 * 1000 })
        return
    }
    converseWithChatAssistant()
}




let converseWithChatAssistant = async () => {
    let chat_id = route.query.chat_id
    let sessionId = route.query.sessionId

    //添加提问记录到消息列表
    messageList.value.push({
        chatId: chat_id,
        content: searchInput.value,
        role: "user",
        sessionId: sessionId,
    })

    //添加AI回复记录到消息列表
    let answer = {
        done:false,
        chatId: chat_id,
        content: "搜索中...",
        messageId: "",
        id: 0,
        role: "assistant",
        packageContent: "",
        reference: "",
        sessionId: sessionId,
    }
    messageList.value.push(answer)

    scrollToBottom()
    searchRequestiing.value = true

    // ragflow 0.18.0: POST /api/v1/chats/{chat_id}/completions
    common.streamModelResponse({
        "url": `/api/v1/chats/${chat_id}/completions`,
        "question": searchInput.value,
        "session_id": sessionId,
        "stream": true
    }, (msg) => {
        // msg=msg.replace('data:{"code": 0, "message": "", "data": true}', '').substring(5)
        if (msg != "") {
            answer = {
                content: msg.answer,
                messageId: msg.id,
                packageContent: common.packageAnswer(`${msg.answer}`),
                reference: msg.reference,
                sessionId: sessionId,
                chatId: chat_id,
                role: "assistant"
            }
            messageList.value[messageList.value.length - 1] = answer
            scrollToBottom()
        }
        else {
            console.log('空msg')
        }

    },
        async () => {
            console.log('完成')
            searchRequestiing.value = false
             messageList.value[messageList.value.length - 1]['done']=true
            //同步消息
            let res = await syncAddMessage(answer, searchInput.value)
            //console.log('同步数据库消息后返回', res)
            await loadMessageList();//重新加载消息列表
        },
        (err) => {
            console.log('错误', err)
        },
        ()=>{
            return !searchRequestiing.value
        }
    )
}






//同步message
let syncAddMessage = async (answerObj, inputSearch) => {

    let chat_id = route.query.chat_id
    let sessionId = route.query.sessionId
    let tempArr = [
        {
            messageId: "",
            chatId: chat_id,
            sessionId: sessionId,
            role: "user",
            content: inputSearch,
            packageContent: "",
            reference: "",
        },
        {
            messageId: "",
            chatId: chat_id,
            sessionId: sessionId,
            role: "assistant",
            content: answerObj.content,
            packageContent: JSON.stringify(answerObj.packageContent),
            reference: JSON.stringify(answerObj.reference),
        }
    ]
    let res = await addMessage(tempArr);
    searchInput.value = ""
}

//对话滑动到底部
let charMessageBoxRef = ref(null)
let scrollToBottom = () => {
    nextTick(() => {
        charMessageBoxRef.value.scrollTop = charMessageBoxRef.value.scrollHeight;
    })
}

//预览图片
let priveieImgDiaLogFlag = ref(false)
let priveieImgDiaLogImgUlr = ref('')
let previewImg = (url) => {
    priveieImgDiaLogFlag.value = true
    priveieImgDiaLogImgUlr.value = url
}
//预览文件Pdf
let priveieFileDiaLogFlag = ref(false)
let priveieFileDiaLogFileUlr = ref('')
let highlights = ref([])
let previewFile = async (obj) => {
    let ext=obj.document_name.split('.').pop().toLowerCase()
    if(ext!='pdf'){
        ElMessage.error('暂不支持预览该文件类型')
        return
    }
    priveieFileDiaLogFlag.value = true
    highlights.value = obj.positions
    console.log('预览pdf',obj.positions[0])
    // [
    //     [4, 50, 100, 200, 30],   // 第4页，位置(50,100)，宽200，高30
    //     [4, 300, 200, 150, 40],  // 第4页，位置(300,200)，宽150，高40
    //     [5, 100, 150, 250, 50],  // 第5页，位置(100,150)，宽250，高50
    //     [6, 200, 300, 100, 80],  // 第6页，位置(200,300)，宽100，高80
    // ]
// let baseUrl = import.meta.env.VITE_APP_BASE_API
// let ragFlowUrl = import.meta.env.VITE_APP_RagFlow_API
   let baseUrl = common.baseUrl //import.meta.env.VITE_APP_BASE_API
    let ragFlowUrl =common.ragFlowUrl// //import.meta.env.VITE_APP_RagFlow_API
    let pdfUrl = `${baseUrl}/file/view?pdfUrl=${ragFlowUrl}/v1/document/get/${obj.document_id}`;// "http://115.190.23.140/v1/document/get/ce84eddc58a611f080b00242ac120006" //url
    priveieFileDiaLogFileUlr.value = pdfUrl
}


//停止对话
let stopChat = async () => {
searchRequestiing.value=false
}
//复制聊天信息
let copyChatMsg = (obj) => {
    if (searchRequestiing.value) {
        ElMessage({ message: '问答中请稍后操作', type: 'error', duration: 3 * 1000 });
        return false;
    }
    let content = obj.content;
    //过滤
    content = content.replace(/\[ID:\d+\]/g, '');
    navigator.clipboard.writeText(content);
    ElMessage({ message: '复制成功', type: 'success', duration: 3 * 1000 });
}
//删除对话
let delChatMsg = async (index) => {
    if (searchRequestiing.value) {
        ElMessage({ message: '问答中请稍后操作', type: 'error', duration: 3 * 1000 });
        return false;
    }
    //删除提问及提问对应的回复
    let question = messageList.value.at(index)
    let answer = messageList.value.at(index + 1)
    let delIds = [];
    if (question) {
        delIds.push(question.id)
    }
    if (answer) {
        delIds.push(answer.id)
    }
    if(delIds[0]!=undefined){
        try {
            let delRes = await delMessage(delIds);
        }
        catch (e) {
            
        }
        
    }
   
    await loadMessageList();
}
//刷新对话
let refreshChat = async (index) => {
    if (searchRequestiing.value) {
        ElMessage({ message: '问答中请稍后操作', type: 'error', duration: 3 * 1000 });
        return false;
    }
    let question = messageList.value.at(index)
    await delChatMsg(index)//先删除
    searchInput.value = question.content;
    await converseWithChatAssistant();
}
//浏览器打开文档
let openDocumentFile = async (obj) => {

    // let baseUrl = import.meta.env.VITE_APP_BASE_API
    // window.open(`${baseUrl}/file/view?pdfUrl=http://115.190.23.140/v1/document/get/${obj.doc_id}`)
    let ext= obj.doc_name.split('.').pop().toLowerCase();
    common.commonPreviewFile(obj.doc_id,obj.doc_name,ext)
}




onMounted(async () => {

    init();

})

</script>

<template>
    <div class='root'>
        <p class="welcomeTxt">欢迎使用，智能问答</p>
        <div class="chatBox">
            <div class="assistantBox">
                <p class="assistantName">{{ curentAssistant?.name }}</p><el-icon size="18" @click="closeAssistant()">
                    <Close />
                </el-icon>
            </div>

            <div class="chatRecordBox" ref="charMessageBoxRef">
                <ul>
                    <li class="chatRecordItem " v-for="(item, index) in messageList">
                        <!--ai回复-->
                        <template v-if="item.role == 'assistant'">
                            <img class="logo" :src="assistantUrl">
                            <div class="infoBox">
                                <!--工具栏-->
                                <div class="infoTool">
                                    <template v-if="index != 0">
                                        <div class="toolBtnBox" @click="copyChatMsg(item)"><el-icon>
                                                <DocumentCopy />
                                            </el-icon></div>
                                        <!-- <div class="toolBtnBox"><el-icon>
                                                <VideoPlay />
                                            </el-icon></div>
                                        <div class="toolBtnBox"> <el-icon>
                                                <Upload />
                                            </el-icon></div>
                                        <div class="toolBtnBox"><el-icon>
                                                <Download />
                                            </el-icon></div> -->
                                    </template>
                                </div>
                                <div class="txtBox">
                                    <!--需要解析的情况-->
                                    <template v-if="item.packageContent">
                                        <!-- <p v-for="(item1, index1) in item.packageContent" :key="'1' + index1"
                                            style="overflow: hidden;">
                                            <template v-for="(item2, index2) in item1" :key="'2'+index2">
                                                <el-popover v-if="item2.type == 'btn'" class="btn" placement="bottom"
                                                    title="" :width="680" trigger="hover">
                                                    <template #default>
                                                        <div class="preveiwBox"
                                                            style=" display: flex; box-sizing: border-box; padding: 10px;">
                                                            <div class="leftBox" style=" width: 20%;cursor: pointer;"
                                                                @click="previewImg(RagFlowServerBaseUrl + '/v1/document/image/' + item.reference?.chunks[item2.value]?.image_id || '')">
                                                                <img :src="RagFlowServerBaseUrl + '/v1/document/image/' + item.reference?.chunks[item2.value]?.image_id || ''"
                                                                    style=" display: block;width: 40%;height: auto;margin:0 auto;">
                                                            </div>
                                                            <div class="rightBox" style=" width: 70%;">
                                                                <p class="previewTxt"
                                                                    style="font-size: 14px;line-height: 20px;">
                                                                    {{ item.reference?.chunks[item2.value]?.content ||
                                                                        ""
                                                                    }}
                                                                </p>
                                                                <div class="fileBox"
                                                                    @click="previewFile(item.reference?.chunks[item2.value])"
                                                                    style="cursor: pointer;;margin-top: 20px; display: flex;align-items: center;justify-content: flex-start;">
                                                                    <p class="fileName"
                                                                        style="font-size: 14px;color:#0f4faa;margin-left: 10px;width: 100%;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;">
                                                                        {{
                                                                            item.reference?.chunks[item2.value]?.document_name
                                                                        }}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </template>
                                                    <template #reference>
                                                        <p
                                                            style="cursor: pointer; width: 25px;display: inline-flex;justify-content: center;align-items: center;  box-sizing: border-box;box-sizing: border-box;">
                                                            <el-icon size="18" color="#3b3e41">
                                                                <Warning />
                                                            </el-icon>
                                                        </p>
                                                    </template>
                                                </el-popover>
                                                <p style="display: inline-block;" v-if="item2.type == 'txt'" class="txt"
                                                    v-html="item2.value"></p>
                                            </template>
                                        </p> -->
                                        <chatView style="padding:0 10px;" :htmlStr="item.packageContent" :reference="item.reference" :done="item.done" :clickImgFn="previewImg" :clickFileFn="previewFile"/>
                                    </template>
                                    <!--文本不需要解析-->
                                    <template v-else>
                                        <p class="txt">{{ item.content }}</p>
                                    </template>

                                </div>
                                <div class="fileBox">
                                    <ul>
                                        <li class="fileItem"
                                            v-for="(doc_aggsItem, doc_aggsIndex) in item.reference?.doc_aggs"
                                            @click="openDocumentFile(doc_aggsItem)">
                                            <!-- <img class="fileLog" :src="item.fileUrl"/> -->
                                            <p class="fileName">{{ doc_aggsItem.doc_name }}</p>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </template>
                        <!--用户提问-->
                        <template v-if="item.role == 'user'">
                            <p class="space"></p>
                            <div class="infoBox">
                                <div class="infoTool">
                                    <template v-if="index != 0">
                                        <div class="toolBtnBox" @click="copyChatMsg(item)"><el-icon>
                                                <DocumentCopy />
                                            </el-icon></div>
                                        <div class="toolBtnBox" @click="refreshChat(index)"><el-icon>
                                                <Refresh />
                                            </el-icon></div>
                                        <div class="toolBtnBox" @click="delChatMsg(index)"><el-icon>
                                                <Delete />
                                            </el-icon></div>
                                    </template>
                                </div>
                                <div class="txtBox">
                                    {{ item.content }}
                                </div>
                                <!-- <div class="fileBox">
                                    <ul>
                                        <li class="fileItem">
                                            <img class="fileLog" src=""/> <p class="fileName">分类细则.pdf</p>
                                        </li>
                                    </ul>
                                </div> -->
                            </div>
                            <img class="logo" :src="userUrl">
                        </template>


                    </li>
                </ul>
            </div>

            <div class="chatBoxFooter">
                <el-input class="inputDeep" v-model="searchInput" style="width: 960px" placeholder="请输入您要查询的内容"
                    @keyup.enter="submit" />
                <!-- <div class="footerBtn"><el-icon size="20">
                        <Paperclip />
                    </el-icon></div> -->
                <div class="footerBtn">
                    <!-- <el-button type="primary" :icon="Position" circle /> -->
                    <!-- <el-icon size="24" @click="submit" :disable="searchRequestiing">
                        <Position />
                    </el-icon> -->
                    <el-button type="primary" circle v-if="!searchRequestiing">
                        <el-icon size="20" @click.stop="submit">
                            <Position />
                        </el-icon>
                    </el-button>
                    <el-button type="primary" circle v-if="searchRequestiing">
                        <el-icon size="20" @click.stop="stopChat">
                            <SwitchButton />
                        </el-icon>
                    </el-button>
                </div>

            </div>
        </div>

        <!--图片预览层-->
        <el-dialog v-model="priveieImgDiaLogFlag" title="" width="40%">
            <img :src="priveieImgDiaLogImgUlr" style="width: 100%;height: auto;">
            <!-- <span>This is a message</span>
            <template #footer>
            <span class="dialog-footer">
                <el-button @click="dialogVisible = false">Cancel</el-button>
                <el-button type="primary" @click="dialogVisible = false">
                Confirm
                </el-button>
            </span>
            </template> -->
        </el-dialog>
        <!--pdf文件预览层-->
        <el-drawer v-model="priveieFileDiaLogFlag" direction="rtl" size="40%">
            <template #header>
                <h4>文件预览(pdf)</h4>
            </template>
            <template #default>
                <div>
                    <!-- <PDFView :pdfUrl="priveieFileDiaLogFileUlr"
                        v-if="priveieFileDiaLogFileUlr && priveieFileDiaLogFileUlr != ''" /> -->
                    <PdfViewer :url="priveieFileDiaLogFileUlr" :hilightArr="highlights"
                        v-if="priveieFileDiaLogFileUlr && priveieFileDiaLogFileUlr != ''" />
                    <div v-else>加载中...</div>

                </div>
            </template>
            <!-- <template #footer>
                <div style="flex: auto">
                    <el-button @click="cancelClick">cancel</el-button>
                    <el-button type="primary" @click="confirmClick">confirm</el-button>
                </div>
            </template> -->
        </el-drawer>

    </div>
</template>

<style lang="scss" scoped>
* {
    padding: 0;
    margin: 0;
}

.root {
    width: 100%;

    // height: calc(100vh - 84px);
    .welcomeTxt {
        color: #272727;
        font-size: 32px;
        text-align: center;
        margin-top: 50px;
    }

    .chatBox {
        width: 1000px;
        height: 654px;
        margin: 0 auto;
        margin-top: 30px;
        box-sizing: border-box;
        border: 1px solid #ccc;
        border-radius: 20px;
        position: relative;
        padding: 20px;
        padding-bottom: 54px;

        display: flex;
        flex-direction: column;

        .assistantBox {
            display: flex;
            align-items: center;

            .assistantName {
                font-weight: 600;
                margin-right: 8px;
                font-size: 16px;
                color: #0066ff;
            }

            .el-icon {
                cursor: pointer;
            }

            .el-icon:hover {
                color: rgb(9, 12, 189)
            }
        }


        .chatRecordBox {
            height: 0;
            width: 100%;
            flex: 1;
            box-sizing: border-box;
            margin-bottom: 20px;
            margin-top: 20px;
            overflow-y: scroll;
            background-color: white;

            ul {
                width: 100%;
                height: fit-content;

                .chatRecordItem {
                    margin-top: 30px;
                    width: 100%;
                    display: flex;

                    .logo {
                        display: block;
                        margin-left: 18px;
                        margin-right: 18px;
                        width: 38px;
                        height: 38px;
                        border-radius: 50%;
                        overflow: hidden;
                    }

                    .infoBox {
                        max-width: 860px;

                        .infoTool {
                            width: fit-content;
                            display: flex;
                            align-items: center;
                            box-sizing: border-box;
                            border: 1px solid #e5e5e5;
                            border-radius: 6px;

                            .toolBtnBox {
                                cursor: pointer;
                                height: 30px;
                                width: 30px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                box-sizing: border-box;
                                border-left: 1px solid #e5e5e5;
                            }

                            .toolBtnBox:first-child {
                                border-left: none;
                            }
                        }

                        .txtBox {
                            margin-top: 6px;
                            border-radius: 10px;
                            background-color: #E6F4FF;
                            font-size: 15px;
                            box-sizing: border-box;
                            padding: 10px;
                            // line-height: 28px;

                            // p {
                            //     line-height: initial;
                            // }
                        }

                        .fileBox {
                            margin-top: 10px;

                            ul {
                                li {
                                    margin-top: 6px;
                                    cursor: pointer;
                                    list-style: none;
                                    box-sizing: border-box;
                                    padding: 0 10px;
                                    width: 100%;
                                    height: 46px;
                                    border-radius: 10px;
                                    border: 1px solid #cccccc;
                                    display: flex;
                                    align-items: center;

                                    .fileLog {
                                        height: 25px;
                                        width: 25px;
                                        display: block;
                                        margin-left: 12px;
                                    }

                                    .fileName {
                                        margin-left: 15px;
                                        font-size: 15px;
                                        overflow: hidden;
                                    }
                                }
                            }
                        }
                    }

                    .space {
                        width: 0;
                        height: 100%;
                        flex: 1;
                    }
                }

                .right {
                    .infoBox {
                        .txtBox {
                            background-color: initial;
                        }
                    }
                }
            }
        }

        .chatRecordBox::-webkit-scrollbar {
            display: none;
        }

        .chatBoxFooter {
            width: 100%;
            height: 53px;
            border-top: 1px solid #e0dddd;
            position: absolute;
            bottom: 0;
            left: 0;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            box-sizing: border-box;
            padding: 0 10px;

            .inputDeep {
                :deep(.el-input__wrapper) {
                    box-shadow: 0 0 0 0px var(--el-input-border-color, var(--el-border-color)) inset;
                    cursor: default;

                    .el-input__inner {
                        cursor: default !important;
                    }
                }
            }

            .footerBtn {
                cursor: pointer;
                width: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
        }
    }
}
</style>