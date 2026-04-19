<script setup>
import { ref, onMounted, nextTick } from "vue";
import { getConfigKey } from '@/api/system/config'
import { Delete, Edit, Search, Share, Upload, Refresh, UploadFilled } from '@element-plus/icons-vue'
import { ElNotification, ElMessageBox, ElMessage, ElLoading } from 'element-plus'
import { commonReqRagFlowServer, submitFileClassify, loadTypesByFileIds } from "@/api/app/ops.js";
import tab from "@/plugins/tab.js";
import { getIcon } from "@/api/kb/icon.js";
import { useRouter, useRoute } from "vue-router"
import common from "@/utils/common.js";
import PdfViewer from '@/components/PdfViewer/PdfViewer.vue'
import useUserStore from "@/store/modules/user.js"
import loadFileIcon from "@/utils/fileIcon.js";
import { getToken } from "@/utils/auth";
import { listType } from "@/api/kb/type.js"
const { proxy } = getCurrentInstance();
// import FileUpload from '@/components/FileUpload/index.vue'
const router = useRouter();
const route = useRoute();




let baseUrl = common.baseUrl //import.meta.env.VITE_APP_BASE_API
let ragFlowUrl =common.ragFlowUrl// //import.meta.env.VITE_APP_RagFlow_API
let queryParams = ref({
    keywords: '',
    parent_id: '',
    page_size: 10,
    page: 1,
    total: 0
})
let files = ref([])
let parent_folder = ref([])
let loadTableData = async (page = 1) => {
    queryParams.value.page = page
    let res = await commonReqRagFlowServer(`/v1/file/list?parent_id=${queryParams.value.parent_id}&keywords=${queryParams.value.keywords}&page_size=${queryParams.value.page_size}&page=${queryParams.value.page}`, 'get', null)
    console.log('加载列表数据', res)
    if (res.code == 0) {
        queryParams.value.total = res.data.total
        let tempFiles = res.data.files
        let docuemntIds = tempFiles.filter(item => item.type != 'folder').map(item => item.id)
        console.log('获取文件id', docuemntIds)
        let resTypes = await loadTypesByFileIds(docuemntIds)
        let types = []
        if (resTypes.code == 200) {
            let typeData = resTypes.rows
            for (let item of typeData) {
                if (item) {
                    types.push({ id: item.id, sourceType: item.sourceType, typeId: item.typeId })
                }

            }
        }
        console.log('获取对应文件的类别', types)
        for (let item of tempFiles) {
            item.create_date = common.timestampToTime(item.create_time)


            if (item.type == 'folder') {
                item['FileIcon'] = '/imgs/fileIcon/folder.png'
            }
            else {
                let tempFileType = types.find(o => o.id == item.id)
                if (tempFileType) {
                    item['fileType'] = tempFileType.sourceType
                }
                else {
                    item['fileType'] = "暂无分类"
                }


                let ext = item.name.split('.').pop()
                item['FileIcon'] = loadFileIcon(ext)
            }


        }


        files.value = tempFiles
        //parent_folder.value=res.data.parent_folder
    }
    else {
        ElMessage.error(res.message)
    }
}

let handleCurrentChange = async (val) => {
    console.log('当前页', val)
    await loadTableData(val);
}
let loadAll_parent_folder = async () => {
    let parent_id = queryParams.value.parent_id || ""
    if (parent_id != '') {
        let res = await commonReqRagFlowServer(`/v1/file/all_parent_folder?file_id=${queryParams.value.parent_id}`, 'get', null)
        console.log('加载所有父级文件夹', res)
        if (res.code == 0) {
            parent_folder.value = res.data.parent_folders
            if (parent_folder.value.length > 1) {
                //数组反转
                parent_folder.value = parent_folder.value.reverse()
            }
        }

    }

}
let openFilder = async (obj) => {
    console.log('打开文件夹', obj)
    if (obj.type == 'folder') {
        tab.refreshPage({ path: "/assistant/fileConfig", query: { folderId: obj.id } })
        // //强制刷新
        // setTimeout(() => {
        //     router.go(0)
        // }, 500);
    }
}

//编辑的目标文件
let editTargetFile = ref({})

//知识库
let kbs = ref([])
let selectedKbs = ref([])
let loadKbd = async () => {
    let res = await commonReqRagFlowServer(`/v1/kb/list`, 'post', JSON.stringify({}))
    console.log('知识库列表', res)
    if (res.code == 0) {
        kbs.value = res.data.kbs
    }
}
let linkKbDialogVisible = ref(false)
let openLinkKbDialog = (obj) => {
    console.log('打开关联知识库', obj)
    linkKbDialogVisible.value = true
    editTargetFile.value = obj
    selectedKbs.value = obj.kbs_info.map(item=>item.kb_id)
}
let confirmLinkKb = async () => {
    console.log('关联知识库', editTargetFile.value, selectedKbs.value)
    let res = await commonReqRagFlowServer(`/v1/file2document/convert`, 'post', JSON.stringify({ "file_ids": [editTargetFile.value.id], "kb_ids": selectedKbs.value }))
    console.log('关联知识库结果', res)
    if (res.code == 0) {
        linkKbDialogVisible.value = false
        editTargetFile.value = null
        selectedKbs.value = []
        loadTableData();
    }
    else {
        ElMessage.error(res.message)
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

    let res = await commonReqRagFlowServer('/v1/file/create', 'post', JSON.stringify({ "parent_id": queryParams.value.parent_id, "name": newFolderName.value, "type": "folder" }))
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

//修改文件名称
let renameFileDialogVisible = ref(false)
let newFileName = ref('')

let openRemaneFileDialog = (obj) => {
    renameFileDialogVisible.value = true
    newFileName.value = obj.name
    editTargetFile.value = obj
    console.log('修改文件名称', obj)
}
let editFileNameProcess = async () => {
    console.log('修改文件名称', newFileName.value, editTargetFile.value)
    let res = await commonReqRagFlowServer('/v1/file/rename', 'post', JSON.stringify({ "file_id": editTargetFile.value.id, "name": newFileName.value }))
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
    .then(async ()=>{
        let res = await commonReqRagFlowServer('/v1/file/rm', 'post', JSON.stringify({ "file_ids": [obj.id], "parent_id": obj.parent_id }))
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
    console.log('下载文件', obj)
    let ext=obj.name.split('.').at(-1)
    common.commonDownloadFile(obj.id,obj.name,ext)
    
}
//预览文件
let previewFile = (obj) => {
    console.log('预览文件', obj)
    let ext=obj.name.split('.').at(-1)
    common.commonPreviewFile(obj.id,obj.name,ext)
}
//移动文件
let moveFileDialogVisible = ref(false)
let moveTargetFoldername = ref('')
let moveTargetFolder = ref(null)
let openMoveFileDialog = async (obj) => {
    moveFileDialogVisible.value = true
    editTargetFile.value = obj
}
let confirmMoveFile = async () => {
    if (!moveTargetFolder.value) {
        ElMessage.error('请选择目标文件夹')
        return
    }
    let res = await commonReqRagFlowServer(`/v1/file/mv`, 'post', JSON.stringify({ "src_file_ids": [editTargetFile.value.id], "dest_file_id": moveTargetFolder.value.id }))
    if (res.code == 0) {
        ElMessage.success('移动成功')
        moveFileDialogVisible.value = false
        editTargetFile.value = null
        moveTargetFoldername.value = ''
        moveTargetFolder.value = null
        loadTableData(1)
    } else {
        ElMessage.error(res.message)
    }
}
let selectedMoveFolder = (obj) => {
    console.log('选择移动文件夹', obj)
    moveTargetFoldername.value = obj.name
    moveTargetFolder.value = obj
}
//懒加载文件夹
let folidTreeLoad = async (node, resolve) => {
    console.log('node', node)
    if (node.isLeaf) return resolve([]);
    let parent_id = "";
    let level = node.level
    if (level == 0) {
        parent_id = ""
    }
    else {
        parent_id = node.data.id
    }

    commonReqRagFlowServer('/v1/file/list?parent_id=' + parent_id, "get", null)
        .then((res) => {
            console.log('获取移动文件目录', res)
            if (res.code == 0) {
                let files = res.data.files
                let folders = res.data.files.filter(item => item.type == 'folder')
                for (let item of folders) {
                    item['isLeaf'] = !item.has_child_folder
                }
                resolve(folders)
            }
        })
        .catch((err) => {

        })

    // console.log('获取移动文件目录',res)
}
let folidTreeProps = {
    label: 'name',
    children: 'children',
    isLeaf: 'isLeaf',
}

//####################################################设置文件分类
let fileClassifyDialogVisible = ref(false)
let selectedClass = ref(null)
let fileClassTree = ref([])
let openSetFileClassifyDialog = async (obj) => {
    console.log('设置文件分类', obj)
    fileClassifyDialogVisible.value = true
    editTargetFile.value = obj

    let res = await listType();
    console.log('获取文件分类', res)
    if (res.code == 200) {
        let data = res.data;
        data = data.map((item) => {
            item['label'] = item.sourceType
            item['value'] = item.id
            item['children'] = item.children.map((item) => {
                item['label'] = item.name
                return item
            })
            return item
        })
        let tree = proxy.handleTree(data, "id", "parentId")
        fileClassTree.value = tree
        console.log('文件分类树', tree)
    }
}
let confirmSetFileClassify = async () => {
    console.log('提交文件分类', selectedClass.value, editTargetFile.value)
    if (selectedClass.value == null || selectedClass.value.length == 0) {
        ElMessage.error('请选择文件分类')
        return
    }

    let res = await submitFileClassify({
        id: editTargetFile.value.id,
        name: editTargetFile.value.name,
        typeId: selectedClass.value.at(-1),
        tenantId: editTargetFile.value.tenant_id,
        parentId: editTargetFile.value.parent_id,
        //sourceType:editTargetFile.value.sourceType,
        type: editTargetFile.value.type,
        size: editTargetFile.value.size,
    })
    console.log('提交文件分类', res)
    if (res.code == 200) {
        selectedClass.value = null
        editTargetFile.value = null
        fileClassifyDialogVisible.value = false
        loadTableData(1)
    }
    else {
        ElMessage.error(res.msg)
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



onMounted(async () => {
    console.log('onMounted')
    queryParams.value.parent_id = route.query.folderId || ""
    loadAll_parent_folder();
    loadTableData();
    loadKbd();

})
</script>

<template>
    <div class='fileConfigRoot'>
        <header>
            <div class="headerLine">
                <el-input v-model="queryParams.keyWords" placeholder="请输入" clearable style="width: 200px;" />
                <el-button style="margin-left: 20px;" type="primary" icon="Search"
                    @click="loadTableData(1)">搜索</el-button>
                <!-- <el-button style="" type="danger" :icon="Delete">删除</el-button> -->
                <el-button type="primary" @click="createFolder" icon="DocumentAdd">新建文件夹</el-button>
                <el-button type="primary" @click="openUploadDialog" icon="FolderAdd">新建文件</el-button>
                <p class="space"></p>
                <!--<p class="notice">最近操作:2025-12-06 12:35:54 已同步</p>
                <el-button style="margin-left: 10px;" type="" :icon="Refresh">同步</el-button>-->
            </div>
            <div class="headerLine">

            </div>
            <div class="headerLine">

                <el-breadcrumb separator="/" style="margin-left: 20px;" v-if="parent_folder.length > 1">
                    
                    <!-- <el-breadcrumb-item v-for="item in parent_folder" :key="item.id" :to="{ path: '/assistant/fileConfig', query: { folderId: item.id } }">
                        {{item.name == '/' ? 'root' : item.name }}
                    </el-breadcrumb-item> -->
                     <el-breadcrumb-item v-for="item in parent_folder" :key="item.id">
                        <a href="javascript:void(0)" style="cursor: pointer;" @click="openFilder(item)">{{item.name == '/' ? 'root' : item.name }}</a>
                     </el-breadcrumb-item>
                </el-breadcrumb>
                <p class="space"></p>

            </div>
        </header>

        <el-table :data="files" max-height="600" height="600" style="width: 100%;margin-top: 30px;">
            <el-table-column prop="name" label="名称" width="320">
                <template #default="scope">
                    <div style="display: flex;align-items: center;">
                        <el-image v-if="scope.row.type == 'folder'" style="width: 20px; height: 20px"
                            :src="scope.row.FileIcon" />
                        <el-image v-else style="width: 20px; height: 20px" :src="scope.row.FileIcon" />
                        <span style="cursor: pointer;padding-left: 5px;" @click="openFilder(scope.row)"> {{
                            scope.row.name }}</span>
                    </div>
                </template>
            </el-table-column>
            <!-- <el-table-column prop="id" label="id" width="180" /> -->
            <el-table-column prop="create_date" label="创建时间" width="180" />
            <el-table-column prop="size" label="大小" width="200">
                <template #default="scope">
                    {{ scope.row.size }}(KB)
                </template>
            </el-table-column>
            <el-table-column prop="size" label="知识库">
                <template #default="scope">
                    <div style="width: 100%;display: flex;flex-wrap: wrap;flex-direction: row;">
                        <p style="margin-left: 5px;; border: 1px solid #409EFF;padding:1px 4px;border-radius: 4px;background-color: #E6F4FF;color:#409EFF ;"
                            v-for="(kbItem, kbIndex) in scope.row.kbs_info" :key="kbIndex">{{ kbItem.kb_name }}</p>
                    </div>
                </template>

            </el-table-column>
            <el-table-column prop="fileType" label="文件分类" width="200">
                <template #default="scope">
                    <span v-if="scope.row.fileType == '暂无分类'" >{{ scope.row.fileType }}</span>
                     <span v-else style="color: #409EFF;"> {{ scope.row.fileType }}</span>
                </template>
            </el-table-column>
            <!-- <el-table-column prop="kbs_info" label="知识库"  width="300"/> -->
            <el-table-column fixed="right" label="操作" width="400">
                <template #default="scope">

                    <el-tooltip class="box-item" effect="dark" content="重命名" placement="top-start"
                        v-if="scope.row.type != 'folder'">
                        <el-button color="#409EFF" size="small" @click="openRemaneFileDialog(scope.row)"><el-icon
                                color="white">
                                <EditPen />
                            </el-icon></el-button>
                    </el-tooltip>
                    <el-tooltip class="box-item" effect="dark" content="删除" placement="top-start">
                        <el-button color="#409EFF" size="small" @click="deleteFileOrFilder(scope.row)"><el-icon el-icon
                                color="white">
                                <Delete />
                            </el-icon></el-button>
                    </el-tooltip>
                    <el-tooltip class="box-item" effect="dark" content="下载" placement="top-start"
                        v-if="scope.row.type != 'folder'">
                        <el-button color="#409EFF" size="small" @click="downloadFile(scope.row)"><el-icon color="white">
                                <Bottom />
                            </el-icon></el-button>
                    </el-tooltip>
                    <el-tooltip class="box-item" effect="dark" content="预览" placement="top-start"
                        v-if="scope.row.type != 'folder'">
                        <el-button color="#409EFF" size="small" @click="previewFile(scope.row)"><el-icon color="white">
                                <View />
                            </el-icon></el-button>
                    </el-tooltip>
                    <el-tooltip class="box-item" effect="dark" content="关联知识库" placement="top-start"
                        v-if="scope.row.type != 'folder'">
                        <el-button color="#409EFF" size="small" @click="openLinkKbDialog(scope.row)"><el-icon
                                color="white">
                                <Share />
                            </el-icon></el-button>
                    </el-tooltip>
                    <el-tooltip class="box-item" effect="dark" content="设置分类" placement="top-start"
                        v-if="scope.row.type != 'folder'">
                        <el-button color="#409EFF" size="small" @click="openSetFileClassifyDialog(scope.row)"><el-icon
                                color="white">
                                <Menu />
                            </el-icon></el-button>
                    </el-tooltip>
                    <el-tooltip class="box-item" effect="dark" content="移动文件" placement="top-start"
                        v-if="scope.row.type != 'folder'">
                        <el-button color="#409EFF" size="small" @click="openMoveFileDialog(scope.row)"><el-icon
                                color="white">
                                <Rank />
                            </el-icon></el-button>
                    </el-tooltip>
                </template>
            </el-table-column>
        </el-table>

        <div class="pageBarBox">
            <el-pagination background layout="prev, pager, next" :current-page="queryParams.page"
                :page-size="queryParams.page_size" :total="queryParams.total" @current-change="handleCurrentChange" />
        </div>
        <!--移动文件弹窗-->
        <el-dialog v-model="moveFileDialogVisible" title="移动文件" width="400px" style="border-radius: 20px;"
            :destroy-on-close="true">
            <el-tree-select v-model="moveTargetFoldername" :check-strictly="true" :render-after-expand="false" lazy
                :check-on-click-node="true" @check-change="selectedMoveFolder" :load="folidTreeLoad"
                :props="folidTreeProps" :node-key="id" />
            <el-divider />
            <el-form-item>
                <el-button type="primary" @click="confirmMoveFile">确定</el-button>
            </el-form-item>
        </el-dialog>
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
            <el-upload class="upload-demo" drag :multiple="true" :auto-upload="false" :headers="uploadFileheaders"
                :action="baseUrl + '/kb/upload'" ref="uploadRef" :on-success="uploadFileSuccess"
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
        <!--关联知识库弹框-->
        <el-dialog v-model="linkKbDialogVisible" title="关联知识库" width="400px" style="border-radius: 20px;"
            :destroy-on-close="true">

            <el-form-item>
                <el-select v-model="selectedKbs" multiple placeholder="请选择知识库">
                    <el-option v-for="item in kbs" :key="item.id" :label="item.name" :value="item.id" />
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="confirmLinkKb">确定</el-button>
            </el-form-item>
        </el-dialog>
        <!--文件分类库弹框-->
        <el-dialog v-model="fileClassifyDialogVisible" title="设置文件分类" width="400px" style="border-radius: 20px;"
            :destroy-on-close="true">

            <el-cascader :options="fileClassTree" clearable v-model="selectedClass" :props="{ checkStrictly: true, }" />
            <p style="width: 100%;height: 30px;"></p>
            <el-form-item>
                <el-button type="primary" @click="confirmSetFileClassify">确定</el-button>
            </el-form-item>
        </el-dialog>
    </div>
</template>

<style lang="scss" scoped>
.fileConfigRoot {
    padding: 0;
    margin: 0;
    width: 100%;
    height: calc(100vh - 84px);
    box-sizing: border-box;
    padding: 20px 10px;
    padding-left: 50px;
    min-width: 1000px;

    header {
        margin: 0;
        width: 100%;

        .headerLine {
            padding: 0;
            display: flex;
            align-items: center;

            .space {
                width: 0;
                flex: 1;
                height: 100%;
            }

            .notice {
                font-size: 14px;
                background-color: #FFEEEF;
                color: #F07271;
                padding: 4px 6px;
                border-radius: 4px;
            }
        }
    }

    .pageBarBox {
        width: 100%;
        height: 80px;
        display: flex;
        align-items: center;
        justify-content: flex-end;
    }
}
</style>