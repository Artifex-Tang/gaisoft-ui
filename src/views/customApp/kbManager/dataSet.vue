<script setup>
import { ref, onMounted, onUnmounted } from "vue";
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

let baseUrl = common.baseUrl
let ragFlowUrl = common.ragFlowUrl

// chunk method label map
const chunkMethodLabels = {
    naive: '通用', manual: '手动', qa: 'Q&A', table: '表格',
    paper: '论文', book: '书籍', laws: '法律', presentation: '演示文稿',
    picture: '图片', one: '整篇', email: '邮件', tag: '标签',
}
const chunkMethodOptions = Object.entries(chunkMethodLabels).map(([value, label]) => ({ value, label }))

let tableRef = ref(null)
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
let refreshTimer = null

let loadTableData = async (page = 1) => {
    searchBoj.value.page = page
    let res = await commonReqRagFlowServer(`/api/v1/datasets/${searchBoj.value.kb_id}/documents?keywords=${searchBoj.value.keywords}&page_size=${searchBoj.value.page_size}&page=${searchBoj.value.page}`, 'get', null)
    console.log('获取表格数据', res)
    if (res.code == 0) {
        for (let item of res.data.docs) {
            if (item.type == 'virtual') {
                item['FileIcon'] = '/imgs/fileIcon/folder.png'
            } else {
                let ext = item.name.split('.').pop()
                item['FileIcon'] = loadFileIcon(ext)
            }
            item.status = item.status == '1'
            // map chunk_method label
            item['chunk_method_label'] = chunkMethodLabels[item.chunk_method] || item.chunk_method
        }
        tableData.value = res.data.docs
        searchBoj.value.total = res.data.total
    }
    else {
        ElMessage.error(res.message || '加载数据失败')
    }
    setTimeout(() => {
        loadingTable.value = false
    }, 300);
}

let handleCurrentChange = async (page) => {
    await loadTableData(page);
}

let handleSelectionChange = (e) => {
    console.log('选中的表格数据', e)
}

// change enabled status
let changeStatus = async (row) => {
    if (loadingTable.value) return
    let res = await commonReqRagFlowServer(`/api/v1/datasets/${searchBoj.value.kb_id}/documents/${row.id}`, 'put', JSON.stringify({ "status": row.status ? "1" : "0" }))
    if (res.code == 0) {
        ElMessage.success('操作成功')
    } else {
        row.status = !row.status
        ElMessage.error(res.message)
    }
}

// rename
let renameFileDialogVisible = ref(false)
let newFileName = ref('')
let openRemaneFileDialog = (obj) => {
    if (obj.run == "RUNNING") {
        ElMessage.error('当前文件正在解析中,不可执行其他操作'); return
    }
    renameFileDialogVisible.value = true
    newFileName.value = obj.name
    editTargetFile.value = obj
}
let editFileNameProcess = async () => {
    if (!newFileName.value) {
        ElMessage.error('名称不能为空'); return
    }
    let res = await commonReqRagFlowServer(`/api/v1/datasets/${searchBoj.value.kb_id}/documents/${editTargetFile.value.id}`, 'put', JSON.stringify({ "name": newFileName.value }))
    if (res.code == 0) {
        renameFileDialogVisible.value = false
        loadTableData(1);
    } else {
        ElMessage.error(res.message)
    }
}

// delete
let deleteFileOrFilder = async (obj) => {
    if (obj.run == "RUNNING") {
        ElMessage.error('当前文件正在解析中,不可执行其他操作'); return
    }
    ElMessageBox.confirm('确认要删除么', '', {
        confirmButtonText: '是的',
        cancelButtonText: '取消',
        type: 'warning',
    }).then(async () => {
        let res = await commonReqRagFlowServer(`/api/v1/datasets/${searchBoj.value.kb_id}/documents`, 'delete', JSON.stringify({ "ids": [obj.id] }))
        if (res.code == 0) {
            loadTableData(1);
        } else {
            ElMessage.error(res.message)
        }
    })
}

// download
let downloadFile = async (obj) => {
    if (obj.run == "RUNNING") {
        ElMessage.error('当前文件正在解析中,不可执行其他操作'); return
    }
    let ext = obj.name.split('.').at(-1)
    common.commonDownloadFile(obj.id, obj.name, ext)
}

// set metadata
let setMetaDataDialogVisible = ref(false)
let metaDataStr = ref('')
let openSetMetaDataDialog = async (obj) => {
    if (obj.run == "RUNNING") {
        ElMessage.error('当前文件正在解析中,不可执行其他操作'); return
    }
    metaDataStr.value = JSON.stringify(obj.meta_fields || {}, null, 2)
    setMetaDataDialogVisible.value = true
    editTargetFile.value = obj
}
let setMetaDataProcess = async () => {
    try {
        let parsed = JSON.parse(metaDataStr.value || '{}')
        let res = await commonReqRagFlowServer(`/api/v1/datasets/${searchBoj.value.kb_id}/documents/${editTargetFile.value.id}`, 'put', JSON.stringify({ "meta_fields": parsed }))
        if (res.code == 0) {
            setMetaDataDialogVisible.value = false
            loadTableData(1);
        } else {
            ElMessage.error(res.message)
        }
    } catch (e) {
        ElMessage.error('JSON 格式错误，请检查')
    }
}

// parse document
let parseData = async (obj) => {
    if (obj.run == "RUNNING") {
        ElMessage.error('当前文件正在解析中'); return
    }
    let res = await commonReqRagFlowServer(`/api/v1/datasets/${searchBoj.value.kb_id}/documents/${obj.id}`, 'put', JSON.stringify({ "run": 1 }))
    if (res.code == 0) {
        ElMessage.success('开始解析')
        loadTableData(1);
    } else {
        ElMessage.error(res.message)
    }
}

// cancel parse
let cancelParseData = async (obj) => {
    if (obj.run != "RUNNING") {
        ElMessage.error('当前文件未在解析中'); return
    }
    let res = await commonReqRagFlowServer(`/api/v1/datasets/${searchBoj.value.kb_id}/documents/${obj.id}`, 'put', JSON.stringify({ "run": 2 }))
    if (res.code == 0) {
        ElMessage.success('已取消解析')
        loadTableData(1);
    } else {
        ElMessage.error(res.message)
    }
}

// set chunk method (real dialog)
let setChunkDialogVisible = ref(false)
let selectedChunkMethod = ref('naive')
let openSetSliceDialog = (obj) => {
    if (obj.run == "RUNNING") {
        ElMessage.error('当前文件正在解析中,不可执行其他操作'); return
    }
    editTargetFile.value = obj
    selectedChunkMethod.value = obj.chunk_method || 'naive'
    setChunkDialogVisible.value = true
}
let setChunkMethodProcess = async () => {
    let res = await commonReqRagFlowServer(`/api/v1/datasets/${searchBoj.value.kb_id}/documents/${editTargetFile.value.id}`, 'put', JSON.stringify({ "chunk_method": selectedChunkMethod.value }))
    if (res.code == 0) {
        ElMessage.success('切片方法已更新')
        setChunkDialogVisible.value = false
        loadTableData(1);
    } else {
        ElMessage.error(res.message)
    }
}

// create folder
let createFolderDialogVisible = ref(false)
let newFolderName = ref('')
let createFolder = () => {
    createFolderDialogVisible.value = true
}
let createFolderProcess = async () => {
    if (!newFolderName.value) {
        ElMessage.error('文件夹名称不能为空'); return
    }
    let res = await commonReqRagFlowServer('/v1/document/create', 'post', JSON.stringify({ "kb_id": props.kb_id, "name": newFolderName.value }))
    if (res.code == 0) {
        newFolderName.value = ''
        createFolderDialogVisible.value = false
        loadTableData(1);
    } else {
        ElMessage.error(res.message)
    }
}

// upload
let uploadFileheaders = ref({ Authorization: "Bearer " + getToken() });
const uploadRef = ref(null)
let uploadFileDialogVisible = ref(false)
let openUploadDialog = () => {
    uploadFileDialogVisible.value = true
}
let uploadFileSuccess = (res, file, fileList) => {
    if (res.code == 200) {
        uploadFileDialogVisible.value = false
        loadTableData(1)
    } else {
        ElMessage.success('文件上传成功')
        loadTableData(1)
    }
}
let uploadFileError = (res, file, fileList) => {
    ElMessage.error('文件上传失败')
}
let uploadFileProcess = async () => {
    uploadRef.value.submit()
}

// progress helper
let getProgressPercent = (row) => {
    if (row.progress < 0) return 0
    return (row.progress * 100).toFixed(1)
}
let getStatusColor = (run) => {
    const map = { UNSTART: '#08A0BB', RUNNING: '#3151C6', CANCEL: '#E6A23C', DONE: '#67C23A', FAIL: '#F56C6C' }
    return map[run] || '#999'
}
let getStatusLabel = (row) => {
    const map = { UNSTART: '未解析', RUNNING: `解析中 (${getProgressPercent(row)}%)`, CANCEL: '已取消', DONE: '完成', FAIL: '失败' }
    return map[row.run] || row.run
}

// auto refresh when parsing
let hasRunningDocs = () => {
    return tableData.value && tableData.value.some(d => d.run == 'RUNNING')
}

onMounted(() => {
    searchBoj.value.kb_id = props.kb_id
    loadTableData();
    // auto refresh every 5s when docs are parsing
    refreshTimer = setInterval(() => {
        if (hasRunningDocs()) {
            loadTableData(searchBoj.value.page)
        }
    }, 5000)
})

onUnmounted(() => {
    if (refreshTimer) clearInterval(refreshTimer)
})
</script>

<template>
    <div class='dataSetRoot'>
        <p class="datasetTilte"><span class="title">数据集</span><span class="desTitle" style="font-size:14px;margin-left:10px;">😉 解析成功后才能问答哦</span></p>
        <p class="line"></p>
        <div class="header">
            <p style="height:100%;flex:1;width:0;"></p>
            <el-input v-model="searchBoj.keywords" placeholder="请输入关键字" style="width: 200px;" @keyup.enter="loadTableData(1)" />
            <el-button type="primary" style="margin-left: 10px;" @click="loadTableData(1)">搜索</el-button>
            <el-button type="primary" :icon="Upload" style="margin-left: 10px;" @click="openUploadDialog">上传文件</el-button>
            <el-button type="primary" :icon="Add" style="margin-left: 10px;" @click="createFolder">新建文件夹</el-button>
        </div>

        <el-table ref="tableRef" :data="tableData" v-loading="loadingTable" stripe style="width: 100%;height: 550px;"
            @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="45" />
            <el-table-column prop="name" label="名称" min-width="200">
                <template #default="scope">
                    <div style="display: flex;align-items: center;">
                        <el-image style="width: 20px; height: 20px" :src="scope.row.FileIcon" />
                        <span style="cursor: pointer;padding-left: 5px;">{{ scope.row.name }}</span>
                    </div>
                </template>
            </el-table-column>
            <el-table-column prop="chunk_count" label="分块数" width="80" />
            <el-table-column label="切片方法" width="90">
                <template #default="scope">
                    {{ scope.row.chunk_method_label }}
                </template>
            </el-table-column>
            <el-table-column prop="status" label="启用" width="70">
                <template #default="scope">
                    <el-switch v-model="scope.row.status" @change="changeStatus(scope.row)" />
                </template>
            </el-table-column>
            <el-table-column label="解析状态" width="160">
                <template #default="scope">
                    <div>
                        <span :style="{ color: getStatusColor(scope.row.run) }">
                            {{ getStatusLabel(scope.row) }}
                        </span>
                        <el-tooltip v-if="scope.row.run == 'FAIL' && scope.row.progress_msg" effect="dark" placement="top">
                            <template #content>
                                <div style="max-width:400px;white-space:pre-wrap;max-height:300px;overflow:auto;">{{ scope.row.progress_msg }}</div>
                            </template>
                            <el-icon style="margin-left:4px;cursor:pointer;color:#F56C6C;"><WarningFilled /></el-icon>
                        </el-tooltip>
                    </div>
                </template>
            </el-table-column>
            <el-table-column fixed="right" label="操作" width="180">
                <template #default="scope">
                    <el-button-group>
                        <el-tooltip v-if="scope.row.type!='virtual'" content="解析" placement="top">
                            <el-button v-if="scope.row.run == 'UNSTART' || scope.row.run == 'FAIL' || scope.row.run == 'CANCEL'" size="small" @click="parseData(scope.row)">
                                <el-icon color="#32BC7B"><VideoPlay /></el-icon>
                            </el-button>
                            <el-button v-else-if="scope.row.run == 'RUNNING'" size="small" @click="cancelParseData(scope.row)">
                                <el-icon color="#F04438"><CircleClose /></el-icon>
                            </el-button>
                            <el-button v-else size="small" @click="parseData(scope.row)">
                                <el-icon color="#17B26A"><Refresh /></el-icon>
                            </el-button>
                        </el-tooltip>
                        <el-tooltip content="重命名" placement="top">
                            <el-button size="small" @click="openRemaneFileDialog(scope.row)"><el-icon><EditPen /></el-icon></el-button>
                        </el-tooltip>
                        <el-tooltip content="删除" placement="top">
                            <el-button size="small" @click="deleteFileOrFilder(scope.row)"><el-icon><Delete /></el-icon></el-button>
                        </el-tooltip>
                        <el-dropdown v-if="scope.row.type!='virtual'" trigger="click">
                            <el-button size="small"><el-icon><More /></el-icon></el-button>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item @click="openSetSliceDialog(scope.row)">设置切片方法</el-dropdown-item>
                                    <el-dropdown-item @click="openSetMetaDataDialog(scope.row)">设置元数据</el-dropdown-item>
                                    <el-dropdown-item @click="downloadFile(scope.row)">下载</el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </el-button-group>
                </template>
            </el-table-column>
        </el-table>
        <div class="pageBarBox">
            <el-pagination background layout="prev, pager, next" :current-page="searchBoj.page"
                :page-size="searchBoj.page_size" :total="searchBoj.total" @current-change="handleCurrentChange" />
        </div>

        <!--修改文件名弹框-->
        <el-dialog v-model="renameFileDialogVisible" title="修改文件名称" width="400px" style="border-radius: 20px;" :destroy-on-close="true">
            <el-form>
                <el-form-item label="名称">
                    <el-input v-model="newFileName" placeholder="新文件名称" clearable />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="editFileNameProcess">确定</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>

        <!--设置切片方法弹框-->
        <el-dialog v-model="setChunkDialogVisible" title="设置切片方法" width="400px" style="border-radius: 20px;" :destroy-on-close="true">
            <el-form label-width="100px">
                <el-form-item label="当前文件">
                    <span>{{ editTargetFile?.name }}</span>
                </el-form-item>
                <el-form-item label="切片方法">
                    <el-select v-model="selectedChunkMethod" placeholder="选择切片方法" style="width: 240px">
                        <el-option v-for="item in chunkMethodOptions" :key="item.value" :label="item.label" :value="item.value" />
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="setChunkMethodProcess">保存</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>

        <!--设置元数据弹框-->
        <el-dialog v-model="setMetaDataDialogVisible" title="设置元数据" width="500px" style="border-radius: 20px;" :destroy-on-close="true">
            <el-form label-position="top">
                <el-form-item>
                    <template #label>
                        元数据 <span style="color:#999;font-weight:normal;">(JSON 格式，如 {"key": "value"})</span>
                    </template>
                    <el-input v-model="metaDataStr" :rows="8" type="textarea" placeholder='{"key": "value"}' />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="setMetaDataProcess">保存</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>

        <!--新建文件夹弹框-->
        <el-dialog v-model="createFolderDialogVisible" title="新建文件夹" width="400px" style="border-radius: 20px;" :destroy-on-close="true">
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
        <el-dialog v-model="uploadFileDialogVisible" title="上传文件" width="400px" style="border-radius: 20px;" :destroy-on-close="true">
            <el-upload class="upload-demo" drag :data="{kb_id:props.kb_id}" :multiple="true" :auto-upload="false" :headers="uploadFileheaders"
                :action="baseUrl + '/kb/uploadforkb'" ref="uploadRef" :on-success="uploadFileSuccess"
                :on-error="uploadFileError" multiple>
                <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                <div class="el-upload__text">
                    将文件拖拽到此或<em>点击上传</em>
                </div>
                <template #tip>
                    <div class="el-upload__tip">
                        单次上传文件总大小上限 1GB，批量上传不超过 32 个文件
                    </div>
                </template>
            </el-upload>
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
    padding: 20px 30px;

    .datasetTilte {
        display: flex;
        align-items: baseline;

        .title {
            font-size: 18px;
            font-weight: 600;
            color: #1890FF;
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
