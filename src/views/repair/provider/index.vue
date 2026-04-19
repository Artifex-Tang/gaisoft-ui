<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="维修服务商ID" prop="providerId">
        <el-input
          v-model="queryParams.providerId"
          placeholder="请输入维修服务商ID"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="维修服务商编码" prop="providerCode">
        <el-input
          v-model="queryParams.providerCode"
          placeholder="请输入维修服务商编码"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="维修服务商名称" prop="providerName">
        <el-input
          v-model="queryParams.providerName"
          placeholder="请输入维修服务商名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="维修服务商仓库编码" prop="warehouseCode">
        <el-input
          v-model="queryParams.warehouseCode"
          placeholder="请输入维修服务商仓库编码"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="维修服务商仓库名称" prop="warehouseName">
        <el-input
          v-model="queryParams.warehouseName"
          placeholder="请输入维修服务商仓库名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="备件名称" prop="sparePartName">
        <el-input
          v-model="queryParams.sparePartName"
          placeholder="请输入备件名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="备件单位" prop="sparePartUnit">
        <el-input
          v-model="queryParams.sparePartUnit"
          placeholder="请输入备件单位"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="备件型号" prop="sparePartSpec">
        <el-input
          v-model="queryParams.sparePartSpec"
          placeholder="请输入备件型号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="备件编码" prop="sparePartCode">
        <el-input
          v-model="queryParams.sparePartCode"
          placeholder="请输入备件编码"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="调拨人" prop="transferBy">
        <el-input
          v-model="queryParams.transferBy"
          placeholder="请输入调拨人"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="调拨人联系方式" prop="transferPhone">
        <el-input
          v-model="queryParams.transferPhone"
          placeholder="请输入调拨人联系方式"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="调拨时间" prop="transferTime">
        <el-date-picker clearable
          v-model="queryParams.transferTime"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="请选择调拨时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="接收人" prop="receiveBy">
        <el-input
          v-model="queryParams.receiveBy"
          placeholder="请输入接收人"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="接收人联系方式" prop="receivePhone">
        <el-input
          v-model="queryParams.receivePhone"
          placeholder="请输入接收人联系方式"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="接收时间" prop="receiveTime">
        <el-date-picker clearable
          v-model="queryParams.receiveTime"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="请选择接收时间">
        </el-date-picker>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['repair:provider:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['repair:provider:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['repair:provider:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['repair:provider:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="providerList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="主键" align="center" prop="sparePartId" />
      <el-table-column label="维修服务商ID" align="center" prop="providerId" />
      <el-table-column label="维修服务商编码" align="center" prop="providerCode" />
      <el-table-column label="维修服务商名称" align="center" prop="providerName" />
      <el-table-column label="维修服务商仓库编码" align="center" prop="warehouseCode" />
      <el-table-column label="维修服务商仓库名称" align="center" prop="warehouseName" />
      <el-table-column label="备件名称" align="center" prop="sparePartName" />
      <el-table-column label="备件单位" align="center" prop="sparePartUnit" />
      <el-table-column label="备件型号" align="center" prop="sparePartSpec" />
      <el-table-column label="备件编码" align="center" prop="sparePartCode" />
      <el-table-column label="调拨人" align="center" prop="transferBy" />
      <el-table-column label="调拨人联系方式" align="center" prop="transferPhone" />
      <el-table-column label="调拨时间" align="center" prop="transferTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.transferTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="接收人" align="center" prop="receiveBy" />
      <el-table-column label="接收人联系方式" align="center" prop="receivePhone" />
      <el-table-column label="接收时间" align="center" prop="receiveTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.receiveTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="说明" align="center" prop="remark" />

      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['repair:provider:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['repair:provider:remove']">删除</el-button>
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

    <!-- 添加或修改维修服务商备件管理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="providerRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="维修服务商ID" prop="providerId">
          <el-input v-model="form.providerId" placeholder="请输入维修服务商ID" />
        </el-form-item>
        <el-form-item label="维修服务商编码" prop="providerCode">
          <el-input v-model="form.providerCode" placeholder="请输入维修服务商编码" />
        </el-form-item>
        <el-form-item label="维修服务商名称" prop="providerName">
          <el-input v-model="form.providerName" placeholder="请输入维修服务商名称" />
        </el-form-item>
        <el-form-item label="维修服务商仓库编码" prop="warehouseCode">
          <el-input v-model="form.warehouseCode" placeholder="请输入维修服务商仓库编码" />
        </el-form-item>
        <el-form-item label="维修服务商仓库名称" prop="warehouseName">
          <el-input v-model="form.warehouseName" placeholder="请输入维修服务商仓库名称" />
        </el-form-item>
        <el-form-item label="备件名称" prop="sparePartName">
          <el-input v-model="form.sparePartName" placeholder="请输入备件名称" />
        </el-form-item>
        <el-form-item label="备件单位" prop="sparePartUnit">
          <el-input v-model="form.sparePartUnit" placeholder="请输入备件单位" />
        </el-form-item>
        <el-form-item label="备件型号" prop="sparePartSpec">
          <el-input v-model="form.sparePartSpec" placeholder="请输入备件型号" />
        </el-form-item>
        <el-form-item label="备件编码" prop="sparePartCode">
          <el-input v-model="form.sparePartCode" placeholder="请输入备件编码" />
        </el-form-item>
        <el-form-item label="调拨人" prop="transferBy">
          <el-input v-model="form.transferBy" placeholder="请输入调拨人" />
        </el-form-item>
        <el-form-item label="调拨人联系方式" prop="transferPhone">
          <el-input v-model="form.transferPhone" placeholder="请输入调拨人联系方式" />
        </el-form-item>
        <el-form-item label="调拨时间" prop="transferTime">
          <el-date-picker clearable
            v-model="form.transferTime"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择调拨时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="接收人" prop="receiveBy">
          <el-input v-model="form.receiveBy" placeholder="请输入接收人" />
        </el-form-item>
        <el-form-item label="接收人联系方式" prop="receivePhone">
          <el-input v-model="form.receivePhone" placeholder="请输入接收人联系方式" />
        </el-form-item>
        <el-form-item label="接收时间" prop="receiveTime">
          <el-date-picker clearable
            v-model="form.receiveTime"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择接收时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="说明" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="备用字段1" prop="attr1">
          <el-input v-model="form.attr1" placeholder="请输入备用字段1" />
        </el-form-item>
        <el-form-item label="备用字段2" prop="attr2">
          <el-input v-model="form.attr2" placeholder="请输入备用字段2" />
        </el-form-item>
        <el-form-item label="备用字段3" prop="attr3">
          <el-input v-model="form.attr3" placeholder="请输入备用字段3" />
        </el-form-item>
        <el-form-item label="备用字段4" prop="attr4">
          <el-input v-model="form.attr4" placeholder="请输入备用字段4" />
        </el-form-item>
        <el-form-item label="创建人id" prop="createId">
          <el-input v-model="form.createId" placeholder="请输入创建人id" />
        </el-form-item>
        <el-form-item label="修改人id" prop="updateId">
          <el-input v-model="form.updateId" placeholder="请输入修改人id" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Provider">
import { listProvider, getProvider, delProvider, addProvider, updateProvider } from "@/api/repair/provider";

const { proxy } = getCurrentInstance();

const providerList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    providerId: null,
    providerCode: null,
    providerName: null,
    warehouseCode: null,
    warehouseName: null,
    sparePartName: null,
    sparePartUnit: null,
    sparePartSpec: null,
    sparePartCode: null,
    transferBy: null,
    transferPhone: null,
    transferTime: null,
    receiveBy: null,
    receivePhone: null,
    receiveTime: null,
    attr1: null,
    attr2: null,
    attr3: null,
    attr4: null,
    createId: null,
    updateId: null,
  },
  rules: {
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询维修服务商备件管理列表 */
function getList() {
  loading.value = true;
  listProvider(queryParams.value).then(response => {
    providerList.value = response.rows;
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
    sparePartId: null,
    providerId: null,
    providerCode: null,
    providerName: null,
    warehouseCode: null,
    warehouseName: null,
    sparePartName: null,
    sparePartUnit: null,
    sparePartSpec: null,
    sparePartCode: null,
    transferBy: null,
    transferPhone: null,
    transferTime: null,
    receiveBy: null,
    receivePhone: null,
    receiveTime: null,
    remark: null,
    attr1: null,
    attr2: null,
    attr3: null,
    attr4: null,
    createId: null,
    createBy: null,
    createTime: null,
    updateId: null,
    updateBy: null,
    updateTime: null
  };
  proxy.resetForm("providerRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.sparePartId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加维修服务商备件管理";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _sparePartId = row.sparePartId || ids.value
  getProvider(_sparePartId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改维修服务商备件管理";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["providerRef"].validate(valid => {
    if (valid) {
      if (form.value.sparePartId != null) {
        updateProvider(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addProvider(form.value).then(response => {
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
  const _sparePartIds = row.sparePartId || ids.value;
  proxy.$modal.confirm('是否确认删除维修服务商备件管理编号为"' + _sparePartIds + '"的数据项？').then(function() {
    return delProvider(_sparePartIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('repair/provider/export', {
    ...queryParams.value
  }, `provider_${new Date().getTime()}.xlsx`)
}

getList();
</script>
