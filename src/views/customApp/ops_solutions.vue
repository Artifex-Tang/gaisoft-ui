<script setup>
import { ref, onMounted } from "vue";
import tab from '@/plugins/tab'
import { Delete, Edit, Search, Share, Upload, Refresh,Plus } from '@element-plus/icons-vue'
import { ElNotification, ElMessageBox, ElMessage, ElLoading } from 'element-plus'
import { listMessage, addMessage, delMessage, getAssistants, listSession, commonReqRagFlowServer, addSession, delSession } from "@/api/app/ops.js";
import { getIcon } from "@/api/kb/icon.js";
import { useRouter, useRoute } from "vue-router"
import common from "@/utils/common.js";
import PdfViewer from '@/components/PdfViewer/PdfViewer.vue'
import useUserStore from "@/store/modules/user.js"
import chatView from "@/components/customApp/chatView.vue"
const router = useRouter();

let showBlock = ref('block1')
let curentAssistant = ref(null);
let curentRecord = ref(null)
let userUrl = useUserStore().avatar || "/imgs/defaultUser.png"
let assistantUrl="/imgs/defaultChatAssistant.png"

//*****************************************************************************************助理
//助理列表
let assistantList = ref([]);
let showAssistantList = ref([]);
let listAssustants = async () => {
    let res = await commonReqRagFlowServer('/v1/dialog/list', 'get', null)
    let defaultAssistantImg = (await getIcon(1)).data.icon || ''///imgs/defaultChatAssistant.png
    if (defaultAssistantImg == '') {
        defaultAssistantImg = require('/imgs/defaultChatAssistant.png')
    }
    else {
        defaultAssistantImg = import.meta.env.VITE_APP_BASE_API + defaultAssistantImg
    }
    console.log('defaultAssistantImg', defaultAssistantImg)
    console.log('获取助理返回', res)
    if (res.code == 0) {
        assistantList.value = [...res.data];
        for (let item of assistantList.value) {
            if (item.icon == "") {
                item.icon = defaultAssistantImg
            }
        }
        showAssistantList.value = assistantList.value.slice(0, 6)
    }
    else {
        ElNotification({
            title: '提示',
            message: res.message,
            type: 'error',
        })
    }
}
//展示更多助理
let showMoreAssistantFlag = ref(false)
let showMoreAssistant = () => {
    showMoreAssistantFlag.value = true
    showAssistantList.value = assistantList.value
}
//选择助理
let selectAssistant = async (item) => {
    console.log('选择助理', item)
    // localStorage.setItem('currentAssistant', JSON.stringify(item))
    // let urlObj = { path: "/assistant/assitantSession", query: { chatId: item.id } };
    // tab.openPage(urlObj)
    curentAssistant.value = item
    curentAssistant.value.icon= item.icon||assistantUrl
    curentRecord.value = null
    showBlock.value = 'block2'

    await loadRecord();//加载当前助理的历史记录
}
//关闭助理
let closeAssistant = () => {
    curentAssistant.value = null
    curentRecord.value = null
    showBlock.value = 'block1'
    historyRecord.value = []
    messageList.value = []
}

//*****************************************************************************************记录
//历史记录
let historyRecord = ref([])
let loadRecord = async () => {
    let recordsRes = await listSession({ chatId: curentAssistant.value.id, pageNum: 1, pageSize: 999 })
    if (recordsRes.code == 200) {
        historyRecord.value = recordsRes.rows
    }
    console.log('获取问答记录', recordsRes)
}

let delRecord = async (obj) => {
    console.log('删除记录', obj)

    //let delRes = await delChatSession(obj.chat_id, [obj.id])
    let delRes = await delSession(obj.id)
    console.log('删除session后返回', delRes)
    if (delRes.code == 200) {
       //loadRecord();
       historyRecord.value = historyRecord.value.filter(item => item.id != obj.id)
       if( curentRecord.value!=null&& obj.id==curentRecord.value.id){
        addRecord(false);
       }
    }
    else {
        ElMessage({ message: '删除失败', type: 'error', duration: 3 * 1000 })
    }
}
let addRecord=async(iscreateTopMsg=true)=>{
    if(iscreateTopMsg){
messageList.value=[{'chatId':'','content':'你好！ 我是你的助理，有什么可以帮到你的吗？',done:true,id:0,messageId:null,role:'assistant'}]
    }
    else{
        messageList.value=[]
    }
    
    searchInput.value=[];
    curentRecord.value = null
}
let enterRecord = async (obj) => {
    console.log('跳转到对话详情', obj)
    curentRecord.value = obj
    await loadMessageList();//加载消息列表
}

//*****************************************************************************************消息

//消息列表
let messageList = ref([])
let loadMessageList = async () => {
     messageList.value=[];
    let chat_id = curentRecord.value.chatId
    let sessionId = curentRecord.value.sessionId
    let res = await listMessage({ chatId: chat_id, sessionId, pageNum: 1, pageSize: 999, order: 'asc' });
    if (res.code == 200) {
        for (let item of res.rows) {
            item['done'] = true;
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
        console.log('消息列表数据',messageList.value)
        scrollToBottom();
    }

}
let searchInput = ref('')
//提交问题
let searchRequestiing = ref(false);
let submit = async () => {
    if(searchRequestiing.value){
        return 
    }
    if (searchInput.value == '') {
        ElMessage({ message: '请输入问题内容', type: 'error', duration: 3 * 1000 })
        return
    }
    if (curentRecord.value == null) {//新问题
        messageList.value=[{'chatId':'','content':'你好！ 我是你的助理，有什么可以帮到你的吗？',done:true,id:0,messageId:null,role:'assistant'}]
        let res = await addSession({
            //sessionid:"",
            sessionName: searchInput.value,
            chatId: curentAssistant.value.id,
            sessionId: common.randomStr()
            // create_date:"",
            // create_time:"",
            // update_date:"",
            // update_tiem:"",
            //user_id:"",
        })
        console.log('提交问题后返回', res);
        if (res.code == 200) {
            curentRecord.value = { chatId: res.data.chatId, id: res.data.id, sessionId: res.data.sessionId, sessionName: searchInput.value }
            historyRecord.value.unshift(curentRecord.value)
            converseWithChatAssistant()
        }
        else {
            ElMessage({ message: '提交失败', type: 'error', duration: 3 * 1000 })
        }
    }
    else {//继续对话
        converseWithChatAssistant()
    }

}

let converseWithChatAssistant = async () => {

    let chat_id = curentRecord.value.chatId
    let sessionId = curentRecord.value.sessionId

    //添加提问记录到消息列表
    messageList.value.push({
        chatId: "",
        content: searchInput.value,
        role: "user",
        sessionId: sessionId,
        chatId: chat_id
    })

    //添加AI回复记录到消息列表
    let answer = {
        done: false,
        chatId: "",
        content: "搜索中...",
        messageId: "",
        id: 0,
        role: "assistant",
        packageContent: "",
        reference: "",
        sessionId: sessionId,
        chatId: chat_id
    }
    messageList.value.push(answer)

    scrollToBottom()
    searchRequestiing.value = true

    //开始请求数据
    // ragflow 0.18.0: POST /api/v1/chats/{chat_id}/completions (legacy /v1/conversation/completion rejects API key with code:401)
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
            messageList.value[messageList.value.length - 1]['done'] = true
            //同步消息
            let res = await syncAddMessage(answer, searchInput.value)
            //console.log('同步数据库消息后返回', res)
            await loadMessageList();//重新加载消息列表
        },
        (err) => {
            console.log('错误', err)
        },
        () => {
            return !searchRequestiing.value
        }
    )
}

//同步message
let syncAddMessage = async (answerObj, inputSearch) => {

    
      let chat_id = curentRecord.value.chatId
    let sessionId = curentRecord.value.sessionId
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
    let ext = obj.document_name.split('.').pop().toLowerCase()
    if (ext != 'pdf') {
        ElMessage.error('暂不支持预览该文件类型')
        return
    }
    priveieFileDiaLogFlag.value = true
    highlights.value = obj.positions
    console.log('预览pdf', obj.positions[0])
    // [
    //     [4, 50, 100, 200, 30],   // 第4页，位置(50,100)，宽200，高30
    //     [4, 300, 200, 150, 40],  // 第4页，位置(300,200)，宽150，高40
    //     [5, 100, 150, 250, 50],  // 第5页，位置(100,150)，宽250，高50
    //     [6, 200, 300, 100, 80],  // 第6页，位置(200,300)，宽100，高80
    // ]
    // let baseUrl = import.meta.env.VITE_APP_BASE_API
    // let ragFlowUrl = import.meta.env.VITE_APP_RagFlow_API
    let baseUrl = common.baseUrl //import.meta.env.VITE_APP_BASE_API
    let ragFlowUrl = common.ragFlowUrl// //import.meta.env.VITE_APP_RagFlow_API
    let pdfUrl = `${baseUrl}/file/view?pdfUrl=${ragFlowUrl}/v1/document/get/${obj.document_id}`;// "http://115.190.23.140/v1/document/get/ce84eddc58a611f080b00242ac120006" //url
    priveieFileDiaLogFileUlr.value = pdfUrl
}

//停止对话
let stopChat = async () => {
    searchRequestiing.value = false
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
    if (delIds[0] != undefined) {
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
    let ext = obj.doc_name.split('.').pop().toLowerCase();
    common.commonPreviewFile(obj.doc_id, obj.doc_name, ext)
}




onMounted(async () => {
    listAssustants()//加载助手列表

})

</script>

<template>
    <div class='root'>
        <div class="block1" v-if="showBlock == 'block1'">
            <p class="welcomeTxt">欢迎使用，智能问答</p>
            <div class="chatBox">
                <p class="noticeTxt">您好，请先在下方选择助理为您答疑解惑。</p>
                <!-- <div class="chatBoxFooter"></div> -->
            </div>
            <div class="assistantList">
                <ul>
                    <li class="assistantItem" :title="item.name" v-for="(item, index) in showAssistantList"
                        :key="item.id" @click="selectAssistant(item)">
                        <p class="spaceW"></p>
                        <img class="assistantImg" :src="item.icon" alt="">
                        <p class="spaceW"></p>
                        <!-- <div class="assistantInfo">
                    <p class="assistantName">{{ item.name }}</p>
                    <p class="assistantDesc">{{ item.description }}</p>
                </div> -->
                        <div class="assistantStr">{{ item.name }}</div>
                        <p class="spaceW"></p>
                    </li>

                </ul>
                <div class="more" v-if="assistantList.length > 4 && !showMoreAssistantFlag"
                    @click="showMoreAssistant()">
                    <span class="addLogo">+</span>
                    <p style="width: 20px;height: 100%;"></p>
                    <span class="addTxt">查看更多</span>
                </div>
                <div v-show="showAssistantList.length == 0">
                    <el-empty description="暂无助理请联系管理员添加助理" />
                </div>
            </div>
        </div>

        <div class="block2" v-if="showBlock == 'block2'">

            <div class="historyRecordBox" v-if="historyRecord.length > 0">
                <p class="historyRecordBoxTitle">
                    <span>历史对话</span>
                     <el-button type="primary" :icon="Plus" style="padding: 10px;" @click="addRecord"/>
                </p>
                <ul>
                    <li :class="{'active':curentRecord?.id==item.id}" :title="item.sessionName" v-for="(item, index) in historyRecord" :key="item.id" @click="enterRecord(item)">
                        <p class="point"></p>
                        <p class="txt">{{ item.sessionName }}</p>
                        <div style="height: 100%;width: 80px;display: flex;align-items: center;justify-content: center;"
                            @click.stop="delRecord(item)">
                            <el-icon>
                                <Delete />
                            </el-icon>
                        </div>

                    </li>

                </ul>
            </div>
            <div class="chatBox">
                <p class="welcomeTxt">欢迎使用，智能问答</p>

                <div class="chatRecordBox" ref="charMessageBoxRef" v-if="messageList.length>0">
                    <ul>
                        <li class="chatRecordItem " v-for="(item, index) in messageList">
                            <!--ai回复-->
                            <template v-if="item.role == 'assistant'">
                                <img class="logo" :src="curentAssistant.icon">
                                <div class="infoBox">
                                    <!--工具栏-->
                                    <div class="infoTool">
                                        <template v-if="index != 0">
                                            <div class="toolBtnBox" @click="copyChatMsg(item)"><el-icon>
                                                    <DocumentCopy />
                                                </el-icon></div>

                                        </template>
                                    </div>
                                    <div class="txtBox">
                                        <!--需要解析的情况-->
                                        <template v-if="item.packageContent">

                                            <chatView style="padding:0 10px;" :htmlStr="item.packageContent"
                                                :reference="item.reference" :done="item.done" :clickImgFn="previewImg"
                                                :clickFileFn="previewFile" />
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
                    <div class="assistantBox">
                        <p class="assistantName">{{ curentAssistant?.name }}</p><el-icon size="18"
                            @click="closeAssistant()">
                            <Close />
                        </el-icon>
                    </div>
                    <el-input class="inputDeep" @keyup.enter="submit" v-model="searchInput" style="width: 80%" placeholder="请输入您要查询的内容" />
                    <div class="sbumitBtn">

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
        </div>


        <!--图片预览层-->
        <el-dialog v-model="priveieImgDiaLogFlag" title="" width="40%">
            <img :src="priveieImgDiaLogImgUlr" style="width: 100%;height: auto;">
        </el-dialog>
        <!--pdf文件预览层-->
        <el-drawer v-model="priveieFileDiaLogFlag" direction="rtl" size="40%">
            <template #header>
                <h4>文件预览(pdf)</h4>
            </template>
            <template #default>
                <div>
                    <PdfViewer :url="priveieFileDiaLogFileUlr" :hilightArr="highlights"
                        v-if="priveieFileDiaLogFileUlr && priveieFileDiaLogFileUlr != ''" />
                    <div v-else>加载中...</div>

                </div>
            </template>
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
    height: calc(100vh - 84px);

    .block1 {
        width: 100%;

        // height: calc(100vh - 84px);
        .welcomeTxt {
            color: #272727;
            font-size: 32px;
            text-align: center;
            margin-top: 14vh;
        }

        .chatBox {
            margin: 0 auto;
            margin-top: 30px;
            width: 1000px;
            height: 110px;
            box-sizing: border-box;
            border: 1px solid #D9D9D9;

            border-radius: 14px;
            position: relative;

            .noticeTxt {
                margin-top: 20px;
                margin-left: 20px;
                font-size: 18px;
                color: #5a595a;
            }

            .chatBoxFooter {
                width: 100%;
                height: 53px;
                border-top: 1px solid #F0F0F0;
                position: absolute;
                bottom: 0;
                left: 0;
                display: flex;

            }
        }

        .assistantList {

            width: 1000px;
            margin: 0 auto;
            margin-top: 20px;

            ul {
                max-height: 300px;
                overflow-y: scroll;
                flex-wrap: wrap;
                width: fit-content;
                height: fit-content;
                margin: 0 auto;
                display: flex;
                align-items: center;
                box-sizing: border-box;
                padding: 0 30px;

                li {
                    margin-top: 10px;
                    list-style: none;
                    margin-left: 15px;
                }

                .assistantItem {
                    cursor: pointer;
                    width: fit-content; //235px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    box-sizing: border-box;
                    border: 1px solid #CCCCCC;
                    border-radius: 20px;
                    padding: 13px 0;

                    .assistantImg {
                        height: 26px;
                        width: 26px;
                        border-radius: 50%;
                        display: block;
                    }

                    .spaceW {
                        height: 100%;
                        width: 10px;
                    }

                    .assistantStr {
                        font-size: 14px;
                        color: #262626;
                        max-width: 100px;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        //强制文本不换行
                        white-space: nowrap;
                    }
                }

                .assistantItem:hover {
                    box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.5);
                }
            }

            .more {
                border-radius: 6px;
                cursor: pointer;
                width: 100%;
                height: 34px;
                background-color: #f3f0f0;
                margin: 0 auto;
                margin-top: 10px;
                display: flex;
                align-items: center;
                justify-content: center;

                .addLogo {
                    font-size: 26px;
                    color: #70727A;
                }

                .addTxt {
                    font-size: 14px;
                }
            }

            ul::-webkit-scrollbar {
                display: none;
            }
        }
    }

    .block2 {
        display: flex;
        flex-direction: row;
        width: 100%;
        height: 100%;

        .historyRecordBox {
            width: fit-content;
            height: 100%;
            background-color: #F5F5F5;
            display: flex;
            flex-direction: column;
            box-sizing: border-box;
            padding: 0 10px;

            .historyRecordBoxTitle {
                display: flex;
                align-items: center;
                justify-content: space-around;
                height: 60px;
                span{
                     color: #AEAEAE;
                text-indent: 30px;
                }
               
            }

            ul {
                flex: 1;
                width: 300px;
                height: 0;
                overflow-y: scroll;

                li {
                    width: 300px;
                    cursor: pointer;
                    height: 56px;
                    display: flex;
                    align-items: center;
                    box-sizing: border-box;
                    padding: 0 10px;

                    .point {
                        height: 6px;
                        width: 6px;
                        background-color: #999999;
                        border-radius: 50%;
                    }

                    .txt {
                        font-size: 15px;
                        margin-left: 15px;
                        width: 0;
                        width: 260px;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    }
                }
                .active{
                    background-color: #ebebeb;
                }
                li:hover {
                    background-color: #ebebeb;
                }

                .noRecord {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #6e6d6d;
                }
            }

            ul::-webkit-scrollbar {
                display: none;
            }
        }

        .chatBox {
            width: 0%;
            flex: 1;
            min-width: 750px;
            height: 100%;
            box-sizing: border-box;
            border-radius: 14px;
            position: relative;
            padding: 20px;
            display: flex;
            flex-direction: column;

            .welcomeTxt {
                color: #272727;
                font-size: 32px;
                text-align: center;
                margin-top: 10px;
                line-height: 80px;
            }


            .chatRecordBox {
                width: 700px;
                margin: 0 auto;
                flex: 1;
                min-height: 0;
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
                            margin-right: 6px;
                            margin-left: 6px;
                            width: 38px;
                            height: 38px;
                            border-radius: 50%;
                            overflow: hidden;
                        }

                        .infoBox {
                            max-width: 650px;

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
                width: 700px;
                margin: 0 auto;
                margin-top: 30px;
                height: fit-content;
                min-height: 100px;
                max-height: 200px;
                border: 1px solid #dad6d6;
                border-radius: 20px;
                box-sizing: border-box;
                padding: 10px 20px;
                position: relative;

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

                .sbumitBtn {
                    position: absolute;
                    bottom: 10px;
                    right: 10px;
                }
            }

            .inputDeep {
                margin-top: 10px;

                :deep(.el-input__wrapper) {
                    box-shadow: 0 0 0 0px var(--el-input-border-color, var(--el-border-color)) inset;
                    cursor: default;

                    .el-input__inner {
                        cursor: default !important;
                    }
                }
            }

        }
    }



}
</style>