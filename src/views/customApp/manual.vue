<script setup>
import { ref, onMounted, reactive } from "vue";
import { useRouter, useRoute } from "vue-router"
import { ElNotification, ElMessageBox, ElMessage, ElLoading } from 'element-plus'
import { Delete, Edit, Search, Share, Upload, Refresh } from '@element-plus/icons-vue'
import common from '@/utils/common.js'
import { commonReqRagFlowServer } from "@/api/app/ops.js";
import { getIcon } from '@/api/kb/icon.js'
import tab from '@/plugins/tab'
import dataSet from './kbManager/dataSet.vue'
import kbConfig from './kbManager/kbConfig.vue'
import ragTest from './kbManager/ragTest.vue'
const router = useRouter();

let targetKb = ref(null);
let defaultAssistantIcon = "";
let loadDefaultAssistantIcon = async () => {
    let iconRes = await getIcon(1)
    console.log("加载助理默认图标", iconRes)
    if (iconRes.code == 0) {
        defaultAssistantIcon = iconRes.data.icon
    }
}
//##########################################列表
let searchObj = reactive({
    page: 1,
    page_size: 12,
    keywords: '',
    total: 0,
})
let kbList = ref([])
let loadKBList = async (page = 1) => {
    searchObj.page = page;
    let res = await commonReqRagFlowServer(`/v1/kb/list?page=${page}&page_size=${searchObj.page_size}&keywords=${searchObj.keywords}`, "post", JSON.stringify({}))
    console.log("加载知识库列表", res)
    if (res.code == 0) {
        for (let item of res.data.kbs) {
            item['update_date'] = common.timestampToTime(item.update_time)
        }
        searchObj.total = res.data.total
        kbList.value = res.data.kbs
    }
}
//删除知识库
let deleteKB = async (kb_id) => {
    ElMessageBox.confirm(
        '确认要删除?',
        '',
        {
            confirmButtonText: '是的',
            cancelButtonText: '取消',
            type: 'warning',
        }
    )
        .then(async () => {
            let res = await commonReqRagFlowServer(`/v1/kb/rm`, "post", JSON.stringify({ "kb_id": kb_id }))
            console.log("删除知识库", res)
            if (res.code == 0) {
                loadKBList()
            }
            else {
                ElMessage.error(res.message)
            }
        })
        .catch(() => {

        })

}
//知识库分页跳转
let handleCurrentChange = (pageno) => {
    console.log("要跳转的页码", pageno)
    loadKBList(pageno)
}
//########################################添加或者编辑知识库
let configKbBoxFlag = ref(false)
let newKbName = ref('')
let addKb = () => {
    configKbBoxFlag.value = true;
    newKbName.value = ""
    dialogTableTitle.value = "添加知识库";
}
let  addKbProcess= async()=>{
    if(newKbName.value==""){
        ElMessage.error("请输入知识库名称")
        return
    }
    configKbBoxFlag.value = false;
    let res =await  commonReqRagFlowServer(`/v1/kb/create`, "post", JSON.stringify({ "name": newKbName.value }))
    console.log("添加知识库", res)
    if (res.code == 0) {
        loadKBList()
    }
    else {
        ElMessage.error(res.message)
    }
}



let init = async () => {
    await loadDefaultAssistantIcon();
    loadKBList();
}


//弹窗
let dialogTableTitle = ref("")
//知识库配置
let kbConfigBoxShow = ref(false)
let openKbConfigBox = (obj) => {
    console.log("打开知识库配置", obj)
    targetKb.value = obj
    dialogTableTitle.value = `${obj.name}知识库(配置)`
    kbConfigBoxShow.value = true

}
//检索测试
let searchTestBoxShow = ref(false)
let openSearchTestBox = (obj) => {
    console.log("打开检索测试", obj)
    targetKb.value = obj
    dialogTableTitle.value = `${obj.name}知识库(检索测试)`
    searchTestBoxShow.value = true

}
//数据集
let datasetBoxShow = ref(false)
let openDatasetBox = (obj) => {
    console.log("数据集", obj)
    targetKb.value = obj
    dialogTableTitle.value = `${obj.name}知识库(数据集)`
    datasetBoxShow.value = true

}





onMounted(async () => {
    await init()
})

</script>



<template>
    <div class='root'>
        <header>
            <el-input v-model="searchObj.keywords" style="width:200px" placeholder="请输入名称关键字" />
            <div style="width: 20px;height: 100%;"></div>
            <el-button type="primary" :icon="Search" @click="loadKBList(1)">搜索</el-button>
            <el-button type="primary" :icon="Add" @click="addKb"><el-icon>
                    <Plus />
                </el-icon>新增</el-button>
        </header>
        <div class="listBox">
            <ul>
                <li v-for="(item, index) in kbList" :key="item.id">
                    <div class="topBox">
                        <img src="/imgs/kb_icon.png" class="logo">
                        <p class="title">{{ item.name }}</p>
                        <el-button type="small" :icon="Delete" @click="deleteKB(item.id)"></el-button>
                    </div>
                    <div class="lineBox">
                        <el-icon color="#4073BE">
                            <Document />
                        </el-icon>
                        <p class="txt">{{ item.doc_num }}篇文档</p>
                    </div>
                    <div class="lineBox">
                        <el-icon color="#4073BE">
                            <Clock />
                        </el-icon>
                        <p class="txt">{{ item.update_date }}</p>
                    </div>
                    <div class="btoomBox">
                        <el-button type="small" @click="openKbConfigBox(item)">配置</el-button>
                        <el-button type="small" @click="openDatasetBox(item)">数据集</el-button>
                        <!-- <el-button type="small" @click="openSearchTestBox(item)">检索测试</el-button> -->
                    </div>
                </li>
            </ul>
        </div>
        <div class="pageBar">
            <el-pagination small background layout="prev, pager, next" :page-size="searchObj.page_size"
                :current-page="searchObj.page" :total="searchObj.total" class="mt-4"
                @current-change="handleCurrentChange" />
        </div>

        <!--知识库配置框-->
        <el-dialog v-model="kbConfigBoxShow" align-center destroy-on-close
            style="border-radius: 10px;width: 95%;height: 90%;">
            <template #header="{ close, titleId, titleClass }">
                <div class="my-header">
                    <p style="color: #0078FF;font-weight: 600;font-size: 20px">{{ dialogTableTitle }}</p>
                </div>
            </template>
            <kbConfig :kb_id="targetKb.id"></kbConfig>
        </el-dialog>
        <!--数据集配置框-->
        <el-dialog v-model="datasetBoxShow" align-center destroy-on-close
            style="border-radius: 10px;width: 95%;height: 90%;min-width:1400px">
            <template #header="{ close, titleId, titleClass }">
                <div class="my-header">
                    <p style="color: #0078FF;font-weight: 600;font-size: 20px">{{ dialogTableTitle }}</p>
                </div>
            </template>
            <dataSet :kb_id="targetKb.id"></dataSet>
        </el-dialog>
        <!--检索测试框-->
        <el-dialog v-model="searchTestBoxShow" align-center destroy-on-close
            style="border-radius: 10px;width: 95%;height: 90%;">
            <template #header="{ close, titleId, titleClass }">
                <div class="my-header">
                    <p style="color: #0078FF;font-weight: 600;font-size: 20px">{{ dialogTableTitle }}</p>
                </div>
            </template>
            <ragTest></ragTest>
        </el-dialog>
        <!---创建知识库-->
        <el-dialog v-model="configKbBoxFlag" align-center destroy-on-close
            style="border-radius: 10px;width:500px;height: 200px;">
            <template #header="{ close, titleId, titleClass }">
                <div class="my-header">
                    <p style="color: #0078FF;font-weight: 600;font-size: 20px">{{ dialogTableTitle }}</p>
                </div>
            </template>
            <el-form label-width="120px">
                <el-form-item label="知识库名称">
                    <el-input v-model="newKbName" />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="addKbProcess">创建</el-button>
                </el-form-item>
            </el-form>
            
        </el-dialog>
    </div>
</template>

<style lang="scss" scoped>
.root {
    padding: 0;
    margin: 0;
    width: 100%;
    height: calc(100vh - 84px);
    overflow-y: auto;
    box-sizing: border-box;
    padding: 20px 10px;
    padding-left: 50px;

    header {
        display: flex;
        align-items: center;
    }

    .listBox {
        width: 100%;
        max-width: 1500px;
        margin-top: 10px;
        max-height: calc(100vh - 180px);
        overflow-y: auto;

        ul {
            width: 100%;
            display: grid;
            grid-template-columns: repeat(auto-fill, 350px);
            justify-content: center;
            gap: 20px;
            margin: 0;
            padding: 0;

            li {
                list-style: none;
                width: 350px;
                height: 192px;
                box-sizing: border-box;
                border: 1px solid #ccc;
                border-radius: 10px;
                box-sizing: border-box;
                padding: 20px;

                .topBox {
                    display: flex;
                    align-items: center;

                    .logo {
                        height: 24px;
                        width: 24px;
                    }

                    .title {
                        font-size: 18px;
                        color: #1890FF;
                        font-weight: 600;
                        margin-left: 20px;
                        width: 280px;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    }
                }

                .lineBox {
                    display: flex;
                    align-items: center;

                    .txt {
                        margin-left: 20px;
                        color: #666666;
                        font-size: 12px;
                    }
                }

                .btoomBox {
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                }
            }

        }
    }

    .pageBar {
        width: 1500px;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        margin-top: 20px;
    }



}
</style>