<script setup>
import { ref, onMounted } from "vue";
import { ElNotification, ElMessageBox, ElMessage, ElLoading } from 'element-plus'
import tab from '@/plugins/tab'
import { getAssistant, listSession, commonReqRagFlowServer, addSession, delSession } from "@/api/app/ops.js";
import { useRouter, useRoute } from "vue-router"
import common from "../../utils/common";
const router = useRouter();
const route = useRoute();

//助理信息
let chatId = ref('')
let curentAssistant = ref(null)
let loadCurrentAssistant = async () => {
    let currentAssistant = JSON.parse(localStorage.getItem('currentAssistant') || "{}")
    console.log("当前选择助理", currentAssistant)
    chatId.value = currentAssistant.id || "0"
    if (chatId.value == "0") {
        ElMessage({ message: '助理信息获取失败，请关闭本页重新选择助理', type: 'error', duration: 3 * 1000 });
        return false
    }
    curentAssistant.value = currentAssistant
}
let closeAssistant = () => {
    //router.replace('/assistant/ops_solutions')
    let obj = { path: "/assistant/ops_solutions" };
    tab.closeOpenPage(obj)
}


//历史记录
let historyRecord = ref([])
let loadRecord = async () => {

    let recordsRes = await listSession({ chatId: chatId.value, pageNum: 1, pageSize: 999 })
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
        loadRecord();
    }
    else {
        ElMessage({ message: '删除失败', type: 'error', duration: 3 * 1000 })
    }
}
let enterRecord = async (obj) => {
    console.log('跳转到对话详情', obj)
    // localStorage.setItem('curentSession', JSON.stringify(obj));

    let urlObj = { path: "/assistant/ops_solutions_chat", query: { chat_id: obj.chatId, sessionId: obj.sessionId } };
    tab.closeOpenPage(urlObj)
}

let searchInput = ref('')
let searchHandler = async () => {
    if (searchInput.value == '') {
        ElMessage({ message: '请输入问题内容', type: 'error', duration: 3 * 1000 })
        return false
    }

    // 先在ragflow创建session
    let ragflowSessionId = ""
    try {
        let ragflowSession = await commonReqRagFlowServer(`/api/v1/chats/${curentAssistant.value.id}/sessions`, 'post', JSON.stringify({}))
        if (ragflowSession.code == 0 && ragflowSession.data) {
            ragflowSessionId = ragflowSession.data.id
        }
    } catch (e) {
        console.warn('创建ragflow session失败', e)
    }

    let sessionId = ragflowSessionId || common.randomStr()
    let res = await addSession({
        sessionName: searchInput.value,
        chatId: curentAssistant.value.id,
        sessionId: sessionId
    })
    console.log('提交问题后返回', res);
    if (res.code == 200) {
        localStorage.setItem('curentQuestionStr', searchInput.value);
        searchInput.value = ""
        let urlObj = { path: "/assistant/ops_solutions_chat", query: { chat_id: res.data.chatId, sessionId: sessionId } };
        tab.closeOpenPage(urlObj)
    }
    else {
        ElMessage({ message: '提交失败', type: 'error', duration: 3 * 1000 })
    }
}


onMounted(async () => {
    await loadCurrentAssistant();
    loadRecord();
})

</script>

<template>
    <div class='root'>
        <p class="welcomeTxt">欢迎使用，智能问答</p>
        <div class="content">
            <div class="historyRecordBox" v-if="historyRecord.length>0">
                <ul >
                    <li v-for="(item, index) in historyRecord" :key="item.id" @click="enterRecord(item)">
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
                <div class="assistantBox">
                    <p class="assistantName">{{ curentAssistant?.name }}</p><el-icon size="18"
                        @click="closeAssistant()">
                        <Close />
                    </el-icon>
                </div>
                <el-input class="inputDeep" v-model="searchInput" style="width: 960px" placeholder="请输入您要询问的内容,回车键搜索"
                    @keyup.enter="searchHandler" />
                <div class="chatBoxFooter">
                    <!-- <div class="footerBtn"><el-icon size="24">
                        <Paperclip />
                    </el-icon></div> -->
                    <div class="footerBtn">
                        <el-icon size="24" @click.stop="searchHandler" color="#0066FF">
                            <Position />
                        </el-icon>
                    </div>

                </div>
            </div>
        </div>





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
    display: flex;
    flex-direction: column;

    .welcomeTxt {
        color: #272727;
        font-size: 32px;
        text-align: center;
        margin-top: 10px;
        line-height: 80px;
    }

    .content {
        display: flex;
        width: 100%;
        height: 0;
        float: 1;

        .historyRecordBox {
            width: fit-content;
            margin: 0 auto;

            margin-left: 20px;

            ul {
                border: 1px solid #ccc;
                border-radius: 20px;
                width: 300px;
                height: 700px;
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

                li:hover {
                    background-color: #ebebeb;
                }
                .noRecord{
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
            margin-left: 20px;
            margin-right: 20px;
            min-width: 500px;
            height: 700px;
            box-sizing: border-box;
            border: 1px solid #D9D9D9;

            border-radius: 14px;
            position: relative;
            padding: 20px;

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



            .chatBoxFooter {
                width: 100%;
                height: 53px;
                border-top: 1px solid #e2dede;
                position: absolute;
                bottom: 0;
                left: 0;
                display: flex;
                align-items: center;
                justify-content: flex-end;
                box-sizing: border-box;
                padding: 0 10px;

                .footerBtn {
                    height: 100%;
                    cursor: pointer;
                    width: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
            }
        }
    }




}
</style>