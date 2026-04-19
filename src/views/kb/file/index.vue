<template>
  <div class="app-container">
    <el-row :gutter="20">
      <splitpanes :horizontal="appStore.device === 'mobile'" class="default-theme">
        <pane size="16">
          <el-col>
            <div class="head-container">
              <el-input v-model="sourceType" placeholder="请输入类别" clearable prefix-icon="Search"
                        style="margin-bottom: 20px"/>
            </div>
            <div class="head-container">
              <el-tree :data="sourceTypeList" :props="{ label: 'sourceType', children: 'children' }"
                       :expand-on-click-node="false" :filter-node-method="filterNode" ref="typeTreeRef" node-key="id"
                       highlight-current default-expand-all @node-click="handleNodeClick"/>
            </div>
          </el-col>
        </pane>
        <pane size="84">

          <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
            <el-form-item label="文件名称" prop="name">
              <el-input
                  v-model="queryParams.name"
                  placeholder="请输入文件名称"
                  clearable
                  @keyup.enter="handleQuery"
              />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
              <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
          </el-form>


          <el-table v-loading="loading" :data="fileList" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" align="center"/>
            <el-table-column label="文件名称" align="center" prop="name"/>
            <el-table-column label="文件类别" align="center" prop="sourceType"/>
            <el-table-column label="文件类型" align="center" prop="type"/>
            <el-table-column label="文件大小" align="center" prop="size"/>
            <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
              <template #default="scope">
                <el-button link type="primary" icon="View" @click="handleViewFile(scope.row)"
                           v-hasPermi="['kb:file:edit']">预览
                </el-button>
                <el-button link type="primary" icon="Download" @click="handleDownFile(scope.row)"
                           v-hasPermi="['kb:file:remove']">下载
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <pagination
              v-show="total>0"
              :total="total"
              v-model:page="queryParams.pageNum"
              v-model:limit="queryParams.pageSize"
              @pagination="getList"
          />

        </pane>
      </splitpanes>
    </el-row>

  </div>
</template>

<script setup name="File">
import {listFile, getFile, delFile, addFile, updateFile} from "@/api/kb/file";
import {listTypeAndDept} from "@/api/kb/type";
import {Pane, Splitpanes} from "splitpanes";
import useAppStore from "@/store/modules/app";
import "splitpanes/dist/splitpanes.css"
import common from "@/utils/common.js";


const router = useRouter();
const appStore = useAppStore();
const {proxy} = getCurrentInstance();

const fileList = ref([]);
const kbSourceTypeList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const checkedKbSourceType = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const sourceType = ref("");
const sourceTypeList = ref(undefined);


let handleViewFile=(obj)=>{
  console.log('预览文件',obj)
  common.commonPreviewFile(obj.id,obj.name,obj.type)
}
let handleDownFile=(obj)=>{
  console.log('下载文件',obj)
common.commonDownloadFile(obj.id,obj.name,obj.type)
}

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    name: null,
    typeId: null,
    size: null
  },
  rules: {}
});

const {queryParams, form, rules} = toRefs(data);

/** 通过条件过滤节点  */
const filterNode = (value, data) => {
  if (!value) return true;
  return data.label.indexOf(value) !== -1;
};

/** 根据名称筛选部门树 */
watch(sourceType, val => {
  proxy.$refs["typeTreeRef"].filter(val);
});


/** 查询文件配置列表 */
function getList() {
  loading.value = false;
  listTypeAndDept(queryParams.value).then(response => {
    sourceTypeList.value = proxy.handleTree(response.data, "id", "parentId");
  });

}

function getFileList()
{
  loading.value = true;
  listFile(queryParams.value).then(response => {
    fileList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}


// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    id: null,
    name: null,
    typeId: null,
    tenantId: null,
    parentId: null,
    size: null,
    createTime: null,
    createBy: null
  };
  kbSourceTypeList.value = [];
  proxy.resetForm("fileRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getFileList();
}

/** 节点单击事件 */
function handleNodeClick(data) {
  queryParams.value.typeId = data.id;
  handleQuery();
};

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  proxy.$refs.typeTreeRef.setCurrentKey(null);
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加文件配置";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getFile(_id).then(response => {
    form.value = response.data;
    kbSourceTypeList.value = response.data.kbSourceTypeList;
    open.value = true;
    title.value = "修改文件配置";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["fileRef"].validate(valid => {
    if (valid) {
      form.value.kbSourceTypeList = kbSourceTypeList.value;
      if (form.value.id != null) {
        updateFile(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addFile(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _ids = row.id || ids.value;
  proxy.$modal.confirm('是否确认删除文件配置编号为"' + _ids + '"的数据项？').then(function () {
    return delFile(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {
  });
}

/** 文件分类序号 */
function rowKbSourceTypeIndex({row, rowIndex}) {
  row.index = rowIndex + 1;
}

/** 文件分类添加按钮操作 */
function handleAddKbSourceType() {
  let obj = {};
  obj.parentId = "";
  obj.sourceType = "";
  kbSourceTypeList.value.push(obj);
}

/** 文件分类删除按钮操作 */
function handleDeleteKbSourceType() {
  if (checkedKbSourceType.value.length == 0) {
    proxy.$modal.msgError("请先选择要删除的文件分类数据");
  } else {
    const kbSourceTypes = kbSourceTypeList.value;
    const checkedKbSourceTypes = checkedKbSourceType.value;
    kbSourceTypeList.value = kbSourceTypes.filter(function (item) {
      return checkedKbSourceTypes.indexOf(item.index) == -1
    });
  }
}

/** 复选框选中数据 */
function handleKbSourceTypeSelectionChange(selection) {
  checkedKbSourceType.value = selection.map(item => item.index)
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('kb/file/export', {
    ...queryParams.value
  }, `file_${new Date().getTime()}.xlsx`)
}

getList();
</script>
