<script setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router"
import { Delete, Edit, Search, Share, Upload, Refresh } from '@element-plus/icons-vue'
import { requestStream, commonReqRagFlowServer } from "@/api/app/ops.js";
import common from "@/utils/common.js";
import loadFileIcon from "@/utils/fileIcon.js";
import { ElNotification, ElMessageBox, ElMessage, ElLoading } from 'element-plus'
import { getToken } from "@/utils/auth";

const props = defineProps({
    kb_id: {
        type: String,
        default: "",
        required: true
    }
})

let baseUrl = common.baseUrl //import.meta.env.VITE_APP_BASE_API
let ragFlowUrl =common.ragFlowUrl// //import.meta.env.VITE_APP_RagFlow_API
const router = useRouter();

let tableRef=ref(null)
const tableData = ref()
let editTargetFile = ref(null)
let loadingTable = ref(true)
let searchBoj = ref({
    kb_id: '',
    keywords: "",
    page_size: 10,
    page: 1,
    total: 0
})
let loadTableData = async (page = 1) => {
    //loadingTable.value=true
    searchBoj.value.page = page
    let res = await commonReqRagFlowServer(`/api/v1/datasets/${searchBoj.value.kb_id}/documents?keywords=${searchBoj.value.keywords}&page_size=${searchBoj.value.page_size}&page=${searchBoj.value.page}`, 'get', null)
    console.log('获取表格数据', res)
    if (res.code == 0) {
        for (let item of res.data.docs) {
            if (item.type == 'virtual') {//文件夹
                item['FileIcon'] = '/imgs/fileIcon/folder.png'
            }
            else {
                let ext = item.name.split('.').pop()
                item['FileIcon'] = loadFileIcon(ext)
            }
            if (item.status == '0') {
                item.status = false
            }
            else {
                item.status = true
            }
        }
        tableData.value = res.data.docs
        searchBoj.value.total = res.data.total
    }
    else {
        ElMessage.error(res.msg)
    }
    setTimeout(() => {
        loadingTable.value = false
    }, 500);

}
let handleCurrentChange = async (page) => {
    console.log('当前页', page)
    await loadTableData(page);
}

//监听选择table多选
let handleSelectionChange = (e) => {
    console.log('选中的表格数据', e)
}

//改变状态(已用)
let changeStatus = async (row) => {
    if (loadingTable.value == false) {
        console.log('改变状态', row)
        let res = await commonReqRagFlowServer(`/api/v1/datasets/${searchBoj.value.kb_id}/documents/${row.id}`, 'put', JSON.stringify({ "status": row.status ? "1" : "0" }))
        if (res.code == 0) {
            ElMessage.success('操作成功')
            loadTableData();
        }
        else {
            ElMessage.error(res.message)
        }
    }

}

//修改文件名称
let renameFileDialogVisible = ref(false)
let newFileName = ref('')
let openRemaneFileDialog = (obj) => {
    if (obj.run == "1") {
        ElMessage.error('当前文件正在解析中,不可执行其他操作'); return
    }
    renameFileDialogVisible.value = true
    newFileName.value = obj.name
    editTargetFile.value = obj
    console.log('修改文件名称', obj)
}
let editFileNameProcess = async () => {
    console.log('修改文件名称', newFileName.value, editTargetFile.value)
    let res = await commonReqRagFlowServer(`/api/v1/datasets/${searchBoj.value.kb_id}/documents/${editTargetFile.value.id}`, 'put', JSON.stringify({ "name": newFileName.value }))
    console.log('修改文件名称后返回', res)
    if (res.code == 0) {
        newFileName.value = ''
        renameFileDialogVisible.value = false
        editTargetFile.value = {}
        loadTableData(1);
    }
    else {
        ElMessage.error(res.message)
    }
}

//删除文件或文件夹
let deleteFileOrFilder = async (obj) => {
    if (obj.run == "1") {
        ElMessage.error('当前文件正在解析中,不可执行其他操作'); return
    }
    console.log('删除文件或文件夹', obj)

    ElMessageBox.confirm(
        '确认要删除么',
        'Warning',
        {
            confirmButtonText: '是的',
            cancelButtonText: '取消',
            type: 'warning',
        }
    )
        .then(async () => {
            let res = await commonReqRagFlowServer(`/api/v1/datasets/${searchBoj.value.kb_id}/documents`, 'delete', JSON.stringify({ "ids": [obj.id] }))
            console.log('删除文件或文件夹后返回', res)
            if (res.code == 0) {
                loadTableData(1);
            }
            else {
                ElMessage.error(res.message)
            }
        })


}

//下载文件
let downloadFile = async (obj) => {
    if (obj.run == "1") {
        ElMessage.error('当前文件正在解析中,不可执行其他操作'); return
    }
    console.log('下载文件', obj)
    let ext = obj.name.split('.').at(-1)
    common.commonDownloadFile(obj.id, obj.name, ext)

}

//设置元数据
let setMetaDataDialogVisible = ref(false)
let metaDataStr = ref('')
let openSetMetaDataDialog = async (obj) => {
    if (obj.run == "1") {
        ElMessage.error('当前文件正在解析中,不可执行其他操作'); return
    }
    metaDataStr.value = JSON.stringify(obj.meta_fields)
    setMetaDataDialogVisible.value = true
    editTargetFile.value = obj
    console.log('设置元数据', obj)
}
let setMetaDataProcess = async () => {
    let res = await commonReqRagFlowServer(`/api/v1/datasets/${searchBoj.value.kb_id}/documents/${editTargetFile.value.id}`, 'put', JSON.stringify({ "meta_fields": JSON.parse(metaDataStr.value || '{}') }))
    console.log('设置元数据后返回', res)
    if (res.code == 0) {
        metaDataStr.value = ''
        setMetaDataDialogVisible.value = false
        editTargetFile.value = null
        loadTableData(1);
    }
    else {
        ElMessage.error(res.message)
    }
}

//解析
let parseData = async (obj) => {
    if (obj.run == "1") {
        ElMessage.error('当前文件已解析'); return
    }
    let res = await commonReqRagFlowServer(`/api/v1/datasets/${searchBoj.value.kb_id}/documents/run?document_ids=${obj.id}&run=1`, 'get', null)
    console.log('解析后返回', res)
    if (res.code == 0) {
        loadTableData(1);
    }
    else {
        ElMessage.error(res.message)
    }
}
//取消解析
let cancelParseData = async (obj) => {
    if (obj.run == "1") {

        let res = await commonReqRagFlowServer('/v1/document/run', 'post', JSON.stringify({ "doc_ids": [obj.id], "run": 2, "delete": false }))
        console.log('解析后返回', res)
        if (res.code == 0) {
            loadTableData(1);
        }
        else {
            ElMessage.error(res.message)
        }
    }
    else {
        ElMessage.error('当前文件不可取消解析')
    }
}

//新建文件夹
let createFolderDialogVisible = ref(false)
let newFolderName = ref('')
let createFolder = () => {
    createFolderDialogVisible.value = true
}
let createFolderProcess = async () => {
    console.log('创建文件夹', newFolderName.value)
    if (newFolderName.value == '') {
        ElMessage.error('文件夹名称不能为空')
        return
    }

    let res = await commonReqRagFlowServer('/v1/document/create', 'post', JSON.stringify({ "kb_id": props.kb_id, "name": newFolderName.value }))
    console.log('创建文件夹后返回', res)
    if (res.code == 0) {

        newFolderName.value = ''
        createFolderDialogVisible.value = false
        loadTableData(1);
    }
    else {
        ElMessage.error(res.message)
    }
}

//上传文件
let uploadFileheaders = ref({ Authorization: "Bearer " + getToken() });
const uploadRef = ref(null)
let uploadFileDialogVisible = ref(false)
let openUploadDialog = () => {
    uploadFileDialogVisible.value = true
}
let uploadFileSuccess = (res, file, fileList) => {
    console.log('文件上传成功', res, file, fileList)
    if (res.code == 200) {
        uploadFileDialogVisible.value = false
        loadTableData(1)
    }
    else {
        ElMessage.success('文件上传成功')
    }


    //fileList.value.push(file)
}
let uploadFileError = (res, file, fileList) => {
    console.log('文件上传失败', res, file, fileList)
    ElMessage.success(res.msg)
}
let uploadFileProcess = async () => {
    //console.log('uploadFileProcess', fileList.value)
    uploadRef.value.submit()
}


//设置切片方法
let openSetSliceDialog = async (obj) => {
    ElMessage.success('设置切片')
    // if (obj.run == "1") {
    //     ElMessage.error('当前文件正在解析中,不可执行其他操作'); return
    // }
}

//*****************************************批量
//批量启用
let batchEnable =async () => {
     console.log('批量启用',datas)
    let datas=tableRef.value.getSelectionRows()
    if(datas.length==0){
        ElMessage.error('请选择要启用的数据')
        return 
    }
    if(datas.some(o=>o.run=='1')){
        ElMessage.error('存在解析中的数据，请先取消解析')
        return 
    }

   
}
//批量禁用
let batchDisable =async () => {
    
}
//批量删除
let batchDelete =async () => {
    
}
//批量解析
let batchParse =async () => {
    
}
//批量取消
let batchCancel =async () => {
    
}

onMounted(() => {
    searchBoj.value.kb_id = props.kb_id
    loadTableData();

    // setInterval(() => {
    //     loadTableData(searchBoj.page)
    // }, 60 * 1000*1);
})



</script>

<template>
    <div class='dataSetRoot'>
        <p class="datasetTilte"><span class="title">数据集</span><span class="desTitle">😉 解析成功后才能问答哦。</span></p>

        <p class="line"></p>
        <div class="header">

            <!-- <el-dropdown>
                <el-button type="primary">
                    批量<el-icon class="el-icon--right"><arrow-down /></el-icon>
                </el-button>
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item icon="Select" @click="batchEnable">
                            <span>启用</span>
                        </el-dropdown-item>
                        <el-dropdown-item icon="RemoveFilled" @click="batchDisable">
                            <span>禁用</span>
                        </el-dropdown-item>
                        <el-dropdown-item icon="VideoPlay" @click="batchParse">
                            <span>解析</span>
                        </el-dropdown-item>
                        <el-dropdown-item icon="CloseBold" @click="batchCancel">
                            <span>取消</span>
                        </el-dropdown-item>
                        <el-dropdown-item icon="DeleteFilled" @click="batchDelete">
                            <span>删除</span>
                        </el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown> -->
            <p style="height:100%;flex:1;width:0;"></p>
            <el-input v-model="input" placeholder="请输入关键字" style="width: 200px;" />
            <el-button type="primary" :icon="Add" style="margin-left: 10px;" @click="openUploadDialog">新增文件</el-button>
            <el-button type="primary" :icon="Add" style="margin-left: 10px;" @click="createFolder">新增文件夹</el-button>

        </div>

        <el-table ref="tableRef" :data="tableData" v-loading="loadingTable" stripe style="width: 100%;height: 550px;"
            @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" />
            <el-table-column prop="name" label="名称">
                <template #default="scope">
                    <div style="display: flex;align-items: center;">
                        <el-image v-if="scope.row.type == 'virtual'" style="width: 20px; height: 20px"
                            :src="scope.row.FileIcon" />
                        <el-image v-else style="width: 20px; height: 20px" :src="scope.row.FileIcon" />
                        <span style="cursor: pointer;padding-left: 5px;" @click="openFilder(scope.row)"> {{
                            scope.row.name }}</span>
                    </div>
                </template>
            </el-table-column>
            <el-table-column prop="chunk_num" label="分块数" width="80" />
            <el-table-column prop="create_date" label="上传日期" width="180" />
            <el-table-column prop="parser_id" label="切片方法" width="120" />
            <el-table-column prop="status" label="启用" width="100">
                <template #default="scope">
                    <el-switch v-model="scope.row.status" @change="changeStatus(scope.row)" />
                </template>
            </el-table-column>
            <el-table-column prop="progress" label="解析状态" width="100">
                <template #default="scope">
                    <p v-if="scope.row.run == '0'" style="color: #08A0BB;">未解析</p>
                    <p v-else-if="scope.row.run == '1'" style="color: #3151C6;">解析中({{(scope.row.progress*100).toFixed(2) }}%)</p>
                     <p v-else style="color: #3151C6;">取消</p>
                </template>
            </el-table-column>
            <el-table-column fixed="right" label="操作" width="300">
                <template #default="scope">
                    <el-tooltip v-if="scope.row.type!='virtual'" class="box-item" effect="dark" content="解析/取消解析" placement="top-start">
                        <el-button v-if="scope.row.run == '0'" size="small" @click="parseData(scope.row)"><el-icon
                                color="#32BC7B">
                                <VideoPlay />
                            </el-icon></el-button>
                        <el-button v-else-if="scope.row.run == '1'" size="small" @click="cancelParseData(scope.row)"><el-icon color="#F04438">
                                <CircleClose />
                            </el-icon></el-button>
                              <el-button v-else size="small" @click="parseData(scope.row)"><el-icon color="#17B26A">
                                <Refresh />
                            </el-icon></el-button>
                    </el-tooltip>
                    <el-tooltip v-if="scope.row.type!='virtual'" class="box-item" effect="dark" content="设置切片" placement="top-start">
                        <el-button size="small" @click="openSetSliceDialog(scope.row)"><el-icon>
                                <Connection />
                            </el-icon></el-button>
                    </el-tooltip>
                    <el-tooltip v-if="scope.row.type!='virtual'" class="box-item" effect="dark" content="设置元数据" placement="top-start">
                        <el-button size="small" @click="openSetMetaDataDialog(scope.row)"><el-icon>
                                <HelpFilled />
                            </el-icon></el-button>
                    </el-tooltip>
                    <el-tooltip class="box-item" effect="dark" content="重命名" placement="top-start">
                        <el-button size="small" @click="openRemaneFileDialog(scope.row)"><el-icon>
                                <EditPen />
                            </el-icon></el-button>
                    </el-tooltip>
                    <el-tooltip class="box-item" effect="dark" content="删除" placement="top-start">
                        <el-button size="small" @click="deleteFileOrFilder(scope.row)"><el-icon>
                                <Delete />
                            </el-icon></el-button>
                    </el-tooltip>
                    <el-tooltip v-if="scope.row.type!='virtual'" class="box-item" effect="dark" content="下载" placement="top-start">
                        <el-button size="small" @click="downloadFile(scope.row)"><el-icon>
                                <Bottom />
                            </el-icon></el-button>
                    </el-tooltip>
                </template>
            </el-table-column>
        </el-table>
        <div class="pageBarBox">
            <el-pagination background layout="prev, pager, next" :current-page="searchBoj.page"
                :page-size="searchBoj.page_size" :total="searchBoj.total" @current-change="handleCurrentChange" />
        </div>

        <!--修改文件名框弹框-->
        <el-dialog v-model="renameFileDialogVisible" title="修改文件名称" width="400px" style="border-radius: 20px;"
            :destroy-on-close="true">
            <el-form>
                <el-form-item label="名称">
                    <el-input v-model="newFileName" placeholder="新文件名称" clearable />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="editFileNameProcess">确定</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>

        <!--设置元数据-->
        <el-dialog v-model="setMetaDataDialogVisible" title="设置元数据(json格式)" width="400px" style="border-radius: 20px;"
            :destroy-on-close="true">
            <el-form label-position="top">
                <el-form-item label="元数据">
                    <el-input v-model="metaDataStr" :rows="8" type="textarea" placeholder="Please input" />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="setMetaDataProcess">确定</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>

         <!--新建文件夹弹框-->
        <el-dialog v-model="createFolderDialogVisible" title="新建文件夹" width="400px" style="border-radius: 20px;"
            :destroy-on-close="true">
            <el-form>
                <el-form-item label="名称">
                    <el-input v-model="newFolderName" placeholder="新文件夹名称" clearable />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="createFolderProcess">确定</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>
        <!--上传文件弹框-->
        <el-dialog v-model="uploadFileDialogVisible" title="新建文件" width="400px" style="border-radius: 20px;"
            :destroy-on-close="true">
            <el-upload class="upload-demo" drag :data="{kb_id:props.kb_id}" :multiple="true" :auto-upload="false" :headers="uploadFileheaders"
                :action="baseUrl + '/kb/uploadforkb'" ref="uploadRef" :on-success="uploadFileSuccess"
                :on-error="uploadFileError" multiple>
                <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                <div class="el-upload__text">
                    将文件拖拽到此或<em>点击上传</em>
                </div>
                <template #tip>
                    <div class="el-upload__tip">
                        支持单次或批量上传。 本地部署的单次上传文件总大小上限为 1GB，单次批量上传文件数不超过 32，单个账户不限文件数量。对于 demo.ragflow.io：每次上传的总文件大小限制为 10MB，每个文件不得超过 10MB，每个账户最多可上传 128 个文件。严禁上传违禁文件。
                    </div>
                </template>
            </el-upload>
            <!-- <FileUpload :url='uploadUrl'></FileUpload> -->
            <el-form-item>
                <el-button type="primary" @click="uploadFileProcess">确定</el-button>
            </el-form-item>
        </el-dialog>
    </div>
</template>

<style lang="scss" scoped>
.dataSetRoot {
    color: #000;
    width: 100%;
    height: calc(90vh - 100px);
    overflow: hidden;
    box-sizing: border-box;
    padding: 20px 50px;

    .datasetTilte {

        .title {
            font-size: 18px;
            font-weight: 600;
            color: #1890FF;

            .desTitle {
                font-size: 14px;
            }
        }
    }

    .line {
        height: 1px;
        width: 100%;
        background-color: #ccc;
    }

    .header {
        width: 100%;
        height: 50px;
        display: flex;
        align-items: center;
    }

    .pageBarBox {
        width: 100%;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
}
</style>