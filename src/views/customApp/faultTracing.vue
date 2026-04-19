<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { ElNotification, ElMessageBox, ElMessage, ElLoading } from 'element-plus'
import { getConfigKey } from '@/api/system/config'
import { requestStream, commonReqRagFlowServer } from "@/api/app/ops.js";
import tab from "@/plugins/tab.js";
import common from "@/utils/common.js";
import { useRouter, useRoute } from "vue-router"
import PdfViewer from '@/components/PdfViewer/PdfViewer.vue'
import MarkedContent from "@/components/markdownRender/markdownRender.vue";
import { ElPopover, ElButton } from 'element-plus';
import 'element-plus/dist/index.css'
import faultTracingCom from "@/components/customApp/chatView.vue";
const router = useRouter();




//左侧知识库树
let treeRef = ref(null);
const defaultProps = {
    children: 'children',
    label: 'name',
}
let treeData = ref([
    {
        id: 1,
        label: 'Level one 1Level ',
        children: [
            {
                id: 4,
                label: 'Level two 1-1',
            },
        ],
    }
])
let loadTreeData = async () => {
    let res = await commonReqRagFlowServer("/api/v1/datasets", "get", null);
    console.log('加载树形结构', res);
    if (res.code == 0) {
        let tempData = res.data

        const grouped = tempData.reduce((acc, item) => {
            const key = item.embedding_model; // 分组的字段
            if (!acc[key]) {
                acc[key] = []; // 初始化分组数组
            }
            acc[key].push(item); // 将当前项添加到分组
            return acc;
        }, {});
        const result = Object.entries(grouped).map(([name, children]) => ({
            name,
            children
        }));
        treeData.value = result
        console.log('打包后的树形结构', result)
    }
}
let selectNode = ref([]);//选中的知识库节点id


//相关问题
// let related_questions = ref([])
// let list_related_questions = async (question) => {
//     related_questions.value = []
//     let res = await commonReqRagFlowServer("/v1/conversation/related_questions", "POST", JSON.stringify({ "question": question }));
//     console.log('相关问题', res);
//     if (res.code == 0) {
//         related_questions.value = res.data
//     }
// }
// let click_related_questions = (item) => {
//     console.log('点击问题', item)
//     question.value = item
//     search()
// }
//chunk
// let chunkList = ref([])
// let totalChunk = ref(0)
// let chunkTableLoading = ref(false)
// let listChunk = async (page = 1, size = 10, isLoadDoc = true) => {
//     //chunkList.value=[]
//     chunkTableLoading.value = true
//     let res = await commonReqRagFlowServer("/v1/chunk/retrieval_test", "POST", JSON.stringify({
//         "doc_ids": selectedDocIds.value,
//         "kb_id": selectNode.value,
//         "highlight": true,
//         "question": question.value,
//         "page": page,
//         "size": size
//     }));
//     chunkTableLoading.value = false
//     console.log('chunk', res);
//     if (res.code == 0) {
//         chunkList.value = res.data.chunks
//         totalChunk.value = res.data.total
//         if (isLoadDoc) {
//             doc_aggs.value = res.data.doc_aggs
//         }

//     }
//     else {
//         //totalChunk.value=0
//     }

// }
// let changChunkPage = (page) => {
//     listChunk(page, 10, false)
// }

//文档
let doc_aggs = ref([])
let selectedDocIds = ref([])
let handleDocTableChange = (e) => {
    console.log('选中', e)
    // selectedDocIds.value = e.map(item => item.doc_id)
    // common.debounce(() => {
    //     listChunk(1, 10, false);
    // }, 500)

}
let viewDocument = (item) => {
    console.log('查看文档', item)
    let ext = item.doc_name.split('.').pop()
    common.commonPreviewFile(item.doc_id, item.doc_name, ext)
}

let downDocument=(item)=>{
    console.log('下载文档', item)
    let ext = item.doc_name.split('.').pop()
    common.commonDownloadFile(item.doc_id, item.doc_name, ext)
}






let question = ref('')
let answer = ref(null)
let searchRequesting = ref(false)
let showResultBox = ref(false)
let resultContent = ref(null)//
let scrollToBottom = () => {
    nextTick(() => {
        resultContent.value.scrollTop = resultContent.value.scrollHeight;
    })
}
//执行搜索
let search = async () => {
    if(searchRequesting.value){
        return 
    }

    //获取选中的知识库
    selectNode.value = treeRef.value.getCheckedNodes().filter(item => item.id).map(item => item.id)
    console.log('选中的节点', selectNode.value)
    if (selectNode.value.length == 0) {
        ElMessage({ message: '请选中左侧知识库', type: 'error', duration: 3 * 1000 });
        return false;
    }

    if (question.value == '') {
        ElMessage({ message: '请输入要查询的关键字', type: 'error', duration: 3 * 1000 });
        return false;
    }

    answer.value = null
    showResultBox.value = true
    //清数据
    // related_questions.value = []
    // chunkList.value = []
    doc_aggs.value = []
    //totalChunk.value = 0

    // setTimeout(() => {
    //     //加载相关问题
    //     list_related_questions(question.value);
    //     //加载chunk
    //     listChunk();
    // }, 1000 * 3);



    searchRequesting.value = true
    //开始请求

    common.streamModelResponse({
        url: '/v1/conversation/ask',
        "kb_ids": selectNode.value,
        "question": question.value
    }, (msg) => {
        // msg=msg.replace('data:{"code": 0, "message": "", "data": true}', '').substring(5)
        if (msg != "") {
            console.log('msg', msg)
            answer.value = {
                done: false,
                content: msg.answer,
                packageContent: common.packageAnswer(`${msg.answer}`),
                reference: msg.reference,
            }
            doc_aggs.value=msg.reference?.doc_aggs||[]
            scrollToBottom()
        }
        else {
            //console.log('空msg')
        }

    },
        async () => {
            //console.log('完成')
            searchRequesting.value = false
            if (answer.value) answer.value.done = true
            console.log('answer', answer.value)

            //  nextTick(() => {
            //      common.handleDynamicComponents(resultBox,dynamicComponents,answer.value.reference,previewImg,previewFile)
            // })

        },
        (err) => {
            //console.log('错误', err)
        },
        () => {
            return !searchRequesting.value
        }
    )
}
let stopSearch = () => {
    searchRequesting.value = false
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
    console.log(obj,ext)
    if(ext!='pdf'){
        ElMessage.error('暂不支持预览该文件类型')
        return
    }
    priveieFileDiaLogFlag.value = true
    highlights.value = obj.positions
    // [
    //     [4, 50, 100, 200, 30],   // 第4页，位置(50,100)，宽200，高30
    //     [4, 300, 200, 150, 40],  // 第4页，位置(300,200)，宽150，高40
    //     [5, 100, 150, 250, 50],  // 第5页，位置(100,150)，宽250，高50
    //     [6, 200, 300, 100, 80],  // 第6页，位置(200,300)，宽100，高80
    // ]

    let docId = obj.document_id || obj.doc_id
    let baseUrl = common.baseUrl //import.meta.env.VITE_APP_BASE_API
    let ragFlowUrl = common.ragFlowUrl// //import.meta.env.VITE_APP_RagFlow_API
    let pdfUrl = `${baseUrl}/file/view?pdfUrl=${ragFlowUrl}/v1/document/get/${docId}`;// "http://115.190.23.140/v1/document/get/ce84eddc58a611f080b00242ac120006" //url
    console.log('pdfUrl', pdfUrl)
    priveieFileDiaLogFileUlr.value = pdfUrl
}






onMounted(async () => {
    console.log('onMounted')
    loadTreeData();


})




</script>

<template>
    <div class='root'>
        <div class="leftBox">
            <el-tree ref="treeRef" style="max-width: 600px" :data="treeData" show-checkbox node-key="id"
                :props="defaultProps" />
        </div>
        <div class="rightBox">
            <div class="rightContent" >
                <div class="topSpace" v-if="answer == null && question == ''">欢迎使用故障溯源</div>

                <div class="searchBox">
                    <el-input class="inputDeep" v-model="question" style="width: 520px" placeholder="请输入您要查询的内容"
                        @keyup.enter="search" />
                    <div class="searchBtnBox">
                        <el-button type="primary" circle v-if="!searchRequesting" @click="search">
                            <el-icon size="20">
                                <Position />
                            </el-icon>
                        </el-button>
                        <el-button type="primary" circle v-if="searchRequesting" @click="stopSearch">
                            <el-icon size="20">
                                <SwitchButton />
                            </el-icon>
                        </el-button>
                    </div>
                </div>

                <div class="fileList" v-if="doc_aggs.length != 0" >
                    <div class="fileHeader">
                        <el-icon size="18" color="#fff">
                            <Files />
                        </el-icon>
                        <p class=" txt">{{ selectedDocIds.length }}/{{ doc_aggs.length }}个</p>
                        <p class=" txt">相关文件</p>
                    </div>
                    <el-table :data="doc_aggs" style="width: 100%" ref="table" row-key="doc_id"
                        @selection-change="handleDocTableChange" max-height="200">
                        <el-table-column type="selection" width="55" />
                        <el-table-column prop="doc_name" label="文件名称" min-width="250" align="center" />


                        <el-table-column prop="count" label="相关指数" min-width="100" align="center" />
                        <el-table-column fixed="right" label="预览 " min-width="100 " align="center">
                            <template #default="scope">
                                <el-button link type="primary" size="small" @click="viewDocument(scope.row)"
                                    :icon="Bottom">
                                    <el-icon color="#000">
                                        <View />
                                    </el-icon>
                                </el-button>
                                 <!-- <el-button link type="primary" size="small" @click="downDocument(scope.row)"
                                    :icon="Bottom">
                                    <el-icon color="#000">
                                        <Bottom />
                                    </el-icon>
                                </el-button>  -->
                            </template>
                        </el-table-column>
                    </el-table>

                </div>
                <div style="width: 100%;height: 500px;margin: 0 auto;background-color: #F5F5F5;margin-top: 50px;" v-loading="searchRequesting && answer==null" v-if="answer==null"></div>
                <div class="resultBox" v-if="answer != null" >
                    <div class="resultHeader">
                        <img src="/public/imgs/defaultChatAssistant.png" class="img">
                        <p class="txt">智能问答</p>
                    </div>
                    <div class="resultContent" style="height: fit-content;max-height: 500px;overflow-y: scroll;"
                        ref="resultContent">
                        <faultTracingCom :htmlStr="answer.packageContent" :reference="answer.reference"
                            :done="answer.done" :clickImgFn="previewImg" :clickFileFn="previewFile" />
                    </div>



                    <div class="skeletonBox" v-if="answer == null" style="height: 200px;padding: 20px;">
                        <el-skeleton :rows="5" animated />
                    </div>
                </div>


                <!-- <div class="chunksBox" v-loading="chunkTableLoading">
                    <ul v-if="chunkList.length != 0">
                        <li v-for="(item, index) in chunkList" :key="index">
                            <el-popover placement="top" title="" :width="700" trigger="hover"
                                :content="item.content_ltks">
                                <template #reference>
                                    <p class="txt">{{ item.content_ltks }}</p>
                                </template>
                            </el-popover>

                            <div class="fileBox" @click="previewFile(item)">
                                <img class="fileImg" src="/public/imgs/pdf.svg">
                                <p class="fileName">{{ item.docnm_kwd }}</p>
                            </div>
                        </li>
                    </ul>
                </div> -->
                <!-- <div class="pageBarBox" v-if="chunkList.length != 0">
                    <el-pagination size="small" background layout="prev, pager, next" :total="totalChunk" class="mt-4"
                        @change="changChunkPage" />
                </div> -->
                <!--相关问题-->
                <!-- <div class="related_questionsBox" v-if="related_questions.length != 0">
                    <h3 class="title">相关问题</h3>
                    <div class="related_questionsContent">
                        <p class="related_questionsItem" v-for="(item, index) in related_questions" :key="index"
                            @click="click_related_questions(item)">{{ item }}</p>
                    </div>
                </div> -->

                <div style="width: 100%;height: 50px;"></div>
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

.el-popover {
    z-index: 9999 !important;
}

.root {
    width: 100%;
    display: flex;
    align-items: center;
    height: calc(100vh - 84px);

    .leftBox {
        width: 20%;
        height: 100%;
        background-color: white;
        box-sizing: border-box;
        padding: 10px 10px;
        overflow: hidden;
        overflow-y: scroll;
    }

    .leftBox::-webkit-scrollbar {
        display: none;
    }

    .rightBox {
        width: 100%;
        height: 100%;
        background-color: #F5F5F5;
        overflow-y: scroll;

        .rightContent {
            width: 60vw;
            height: 100%;
            margin: 0 auto;

            .topSpace {
                width: 100%;
                height: 35vh;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.2vw;
                font-size: 1.6vw;
                color: #6d6c6c;
            }

            .searchBox {
                cursor: pointer;
                width: fit-content;
                height: 50px;
                display: flex;
                align-items: center;
                margin: 0 auto;
                margin-top: 30px;
                border-radius: 30px;
                border: 1px solid #cccccc;
                background-color: #FFFFFF;
                box-sizing: border-box;
                padding-left: 40px;
                overflow: hidden;

                .inputDeep {
                    background-color: #F5F5F5;

                    :deep(.el-input__wrapper) {
                        box-shadow: 0 0 0 0px var(--el-input-border-color, var(--el-border-color)) inset;
                        cursor: default;

                        .el-input__inner {
                            cursor: default !important;
                        }
                    }
                }

                .searchBtnBox {
                    margin-left: 30px;
                    width: 76px;
                    height: 100%;
                    box-sizing: border-box;
                    border-left: 1px solid #ccc;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
            }

            .searchBox:hover {
                border: 1px solid #409EFF
            }

            .resultBox {
                background-color: white;
                border-radius: 10px;
                overflow: hidden;
                width: 100%;
                margin: 0 auto;
                margin-top: 30px;
                box-shadow: 0 0 10px #ddd;

                .resultHeader {
                    width: 100%;
                    height: 60px;
                    box-sizing: border-box;

                    display: flex;
                    align-items: center;
                    padding: 0 30px;

                    .img {
                        display: block;
                        height: 30px;
                        width: 30px;
                    }

                    .txt {
                        margin-left: 20px;
                        font-size: 16px;
                        font-weight: 600;
                    }
                }

                .resultContent {
                    font-size: 15px;
                    box-sizing: border-box;
                    padding: 20px;
                    line-height: 26px;
                    border-top: 1px solid #ccc;
                    max-height: 500px;
                    overflow-y: scroll;

                    p {
                        padding: 0;
                        margin: 0;

                        .txt {
                            line-height: initial;
                            height: fit-content !important;
                            padding: 0;
                            margin: 0;

                            p {
                                padding: 0;
                                margin: 0;
                                line-height: initial;
                                height: fit-content !important;
                            }

                            pre {
                                background-color: rgba($color: #000000, $alpha: .8);
                            }
                        }
                    }



                }
            }

            .fileList {
                width: 100%;
                margin: 0 auto;
                margin-top: 30px;

                .fileHeader {
                    border-top-left-radius: 14px;
                    border-top-right-radius: 14px;
                    width: 100%;
                    height: 50px;
                    box-sizing: border-box;
                    border: 1px solid #ccc;
                    display: flex;
                    align-items: center;
                    padding: 0 10px;
                    background-color: #4f98e0;
                    color: white;

                    .img {
                        display: block;
                        width: 20px;
                        height: 20px;
                    }

                    .txt {
                        margin-left: 20px;
                        font-size: 16px;
                        font-weight: 600;
                    }
                }
            }

            .chunksBox {
                width: 100%;
                margin: 0 auto;
                color: rgba($color: #000000, $alpha: .88);

                ul {
                    box-sizing: border-box;
                    border-top: 2px solid #E7E7E7;
                    margin-top: 30px;
                    padding-top: 10px;

                    li {
                        cursor: pointer;
                        margin-top: 10px;
                        list-style: none;
                        width: 100%;
                        // height:110px;
                        background-color: white;
                        border-radius: 10px;
                        padding: 10px 20px;

                        .txt {
                            width: 100%;
                            line-height: 28px;
                            font-size: 14px;
                            display: -webkit-box;
                            display: -webkit-box;
                            -webkit-line-clamp: 2;
                            /* 显示的行数 */
                            -webkit-box-orient: vertical;
                            overflow: hidden;
                            /* 超出部分隐藏 */
                        }

                        .fileBox {
                            margin-top: 8px;
                            display: flex;
                            align-items: center;

                            .fileImg {
                                width: 25px;
                                height: 25px;
                            }

                            .fileName {
                                font-size: 14px;
                                margin-left: 20px;
                                width: 860px;
                                overflow: hidden;
                                text-overflow: ellipsis;
                                white-space: nowrap;
                            }
                        }
                    }

                    li:hover .txt {
                        color: #1083f7;
                    }
                }
            }

            .pageBarBox {
                width: 100%;
                margin: 0 auto;
                margin-top: 20px;
                box-sizing: border-box;
                padding-right: 20px;
                display: flex;
                align-items: center;
                justify-content: flex-end;
            }

            .related_questionsBox {
                width: 100%;
                margin: 0 auto;
                margin-top: 20px;
                background-color: white;
                padding: 20px;

                .title {
                    font-weight: 600;
                }

                .related_questionsContent {
                    width: 100%;
                    display: flex;
                    flex-wrap: wrap;
                    align-items: center;
                    margin-top: 10px;

                    .related_questionsItem {
                        margin-top: 8px;
                        cursor: pointer;
                        padding: 5px;
                        border-radius: 4px;
                        box-sizing: border-box;
                        border: 1px solid #ccc;
                        font-size: 14px;
                        margin-left: 8px;
                    }

                    .related_questionsItem:hover {
                        color: #1083f7;
                    }
                }
            }
        }


    }

    .rightBox::-webkit-scrollbar {
        display: none;
    }
}
</style>