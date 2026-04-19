<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="问题编码" prop="issueCode">
        <el-input
          v-model="queryParams.issueCode"
          placeholder="请输入问题编码"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="问题名称" prop="issueName">
        <el-input
          v-model="queryParams.issueName"
          placeholder="请输入问题名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="问题接收时间" prop="receiveTime">
        <el-date-picker clearable
          v-model="queryParams.receiveTime"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="请选择问题接收时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="接收人ID" prop="receiveId">
        <el-input
          v-model="queryParams.receiveId"
          placeholder="请输入接收人ID"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="接收人" prop="receiveBy">
        <el-input
          v-model="queryParams.receiveBy"
          placeholder="请输入接收人"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="接收人所属部门或公司" prop="deptName">
        <el-input
          v-model="queryParams.deptName"
          placeholder="请输入接收人所属部门或公司"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="问题反馈客户名称" prop="customerName">
        <el-input
          v-model="queryParams.customerName"
          placeholder="请输入问题反馈客户名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="问题反馈人" prop="contactPerson">
        <el-input
          v-model="queryParams.contactPerson"
          placeholder="请输入问题反馈人"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="反馈人联系方式" prop="contactPhone">
        <el-input
          v-model="queryParams.contactPhone"
          placeholder="请输入反馈人联系方式"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="关联产品ID" prop="productId">
        <el-input
          v-model="queryParams.productId"
          placeholder="请输入关联产品ID"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="产品SN" prop="productSn">
        <el-input
          v-model="queryParams.productSn"
          placeholder="请输入产品SN"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="产品名称" prop="productName">
        <el-input
          v-model="queryParams.productName"
          placeholder="请输入产品名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="产品型号" prop="productSpec">
        <el-input
          v-model="queryParams.productSpec"
          placeholder="请输入产品型号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="问题等级" prop="issueLevel">
        <el-input
          v-model="queryParams.issueLevel"
          placeholder="请输入问题等级"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="负责工程师" prop="serviceEngineer">
        <el-input
          v-model="queryParams.serviceEngineer"
          placeholder="请输入负责工程师"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="问题设备SN码" prop="deviceSn">
        <el-input
          v-model="queryParams.deviceSn"
          placeholder="请输入问题设备SN码"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="问题设备名称" prop="deviceName">
        <el-input
          v-model="queryParams.deviceName"
          placeholder="请输入问题设备名称"
          clearable
          @keyup.enter="handleQuery"
        />
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
          v-hasPermi="['repair:recode:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['repair:recode:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['repair:recode:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['repair:recode:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="recodeList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="主键" align="center" prop="issueId" />
      <el-table-column label="问题编码" align="center" prop="issueCode" />
      <el-table-column label="问题名称" align="center" prop="issueName" />
      <el-table-column label="问题接收时间" align="center" prop="receiveTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.receiveTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="接收人ID" align="center" prop="receiveId" />
      <el-table-column label="接收人" align="center" prop="receiveBy" />
      <el-table-column label="接收人所属部门或公司" align="center" prop="deptName" />
      <el-table-column label="问题反馈客户名称" align="center" prop="customerName" />
      <el-table-column label="问题反馈人" align="center" prop="contactPerson" />
      <el-table-column label="反馈人联系方式" align="center" prop="contactPhone" />
      <el-table-column label="关联产品ID" align="center" prop="productId" />
      <el-table-column label="产品SN" align="center" prop="productSn" />
      <el-table-column label="产品名称" align="center" prop="productName" />
      <el-table-column label="产品型号" align="center" prop="productSpec" />
      <el-table-column label="问题类别" align="center" prop="issueType" />
      <el-table-column label="问题等级" align="center" prop="issueLevel" />
      <el-table-column label="负责工程师" align="center" prop="serviceEngineer" />
      <el-table-column label="问题设备SN码" align="center" prop="deviceSn" />
      <el-table-column label="问题设备名称" align="center" prop="deviceName" />
      <el-table-column label="问题状态(0:待处理,1:处理中,2:已解决,3:已关闭)" align="center" prop="status" />
      <el-table-column label="说明" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['repair:recode:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['repair:recode:remove']">删除</el-button>
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

    <!-- 添加或修改售后问题登记对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="recodeRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="问题编码" prop="issueCode">
          <el-input v-model="form.issueCode" placeholder="请输入问题编码" />
        </el-form-item>
        <el-form-item label="问题名称" prop="issueName">
          <el-input v-model="form.issueName" placeholder="请输入问题名称" />
        </el-form-item>
        <el-form-item label="问题接收时间" prop="receiveTime">
          <el-date-picker clearable
            v-model="form.receiveTime"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择问题接收时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="接收人ID" prop="receiveId">
          <el-input v-model="form.receiveId" placeholder="请输入接收人ID" />
        </el-form-item>
        <el-form-item label="接收人" prop="receiveBy">
          <el-input v-model="form.receiveBy" placeholder="请输入接收人" />
        </el-form-item>
        <el-form-item label="接收人所属部门或公司" prop="deptName">
          <el-input v-model="form.deptName" placeholder="请输入接收人所属部门或公司" />
        </el-form-item>
        <el-form-item label="问题反馈客户名称" prop="customerName">
          <el-input v-model="form.customerName" placeholder="请输入问题反馈客户名称" />
        </el-form-item>
        <el-form-item label="问题反馈人" prop="contactPerson">
          <el-input v-model="form.contactPerson" placeholder="请输入问题反馈人" />
        </el-form-item>
        <el-form-item label="反馈人联系方式" prop="contactPhone">
          <el-input v-model="form.contactPhone" placeholder="请输入反馈人联系方式" />
        </el-form-item>
        <el-form-item label="关联产品ID" prop="productId">
          <el-input v-model="form.productId" placeholder="请输入关联产品ID" />
        </el-form-item>
        <el-form-item label="产品SN" prop="productSn">
          <el-input v-model="form.productSn" placeholder="请输入产品SN" />
        </el-form-item>
        <el-form-item label="产品名称" prop="productName">
          <el-input v-model="form.productName" placeholder="请输入产品名称" />
        </el-form-item>
        <el-form-item label="产品型号" prop="productSpec">
          <el-input v-model="form.productSpec" placeholder="请输入产品型号" />
        </el-form-item>
        <el-form-item label="问题等级" prop="issueLevel">
          <el-input v-model="form.issueLevel" placeholder="请输入问题等级" />
        </el-form-item>
        <el-form-item label="负责工程师" prop="serviceEngineer">
          <el-input v-model="form.serviceEngineer" placeholder="请输入负责工程师" />
        </el-form-item>
        <el-form-item label="问题设备SN码" prop="deviceSn">
          <el-input v-model="form.deviceSn" placeholder="请输入问题设备SN码" />
        </el-form-item>
        <el-form-item label="问题设备名称" prop="deviceName">
          <el-input v-model="form.deviceName" placeholder="请输入问题设备名称" />
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

<script setup name="Recode">
import { listRecode, getRecode, delRecode, addRecode, updateRecode } from "@/api/repair/recode";

const { proxy } = getCurrentInstance();

const recodeList = ref([]);
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
    issueCode: null,
    issueName: null,
    receiveTime: null,
    receiveId: null,
    receiveBy: null,
    deptName: null,
    customerName: null,
    contactPerson: null,
    contactPhone: null,
    productId: null,
    productSn: null,
    productName: null,
    productSpec: null,
    issueType: null,
    issueLevel: null,
    serviceEngineer: null,
    deviceSn: null,
    deviceName: null,
    status: null,
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

/** 查询售后问题登记列表 */
function getList() {
  loading.value = true;
  listRecode(queryParams.value).then(response => {
    recodeList.value = response.rows;
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
    issueId: null,
    issueCode: null,
    issueName: null,
    receiveTime: null,
    receiveId: null,
    receiveBy: null,
    deptName: null,
    customerName: null,
    contactPerson: null,
    contactPhone: null,
    productId: null,
    productSn: null,
    productName: null,
    productSpec: null,
    issueType: null,
    issueLevel: null,
    serviceEngineer: null,
    deviceSn: null,
    deviceName: null,
    status: null,
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
  proxy.resetForm("recodeRef");
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
  ids.value = selection.map(item => item.issueId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加售后问题登记";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _issueId = row.issueId || ids.value
  getRecode(_issueId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改售后问题登记";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["recodeRef"].validate(valid => {
    if (valid) {
      if (form.value.issueId != null) {
        updateRecode(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addRecode(form.value).then(response => {
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
  const _issueIds = row.issueId || ids.value;
  proxy.$modal.confirm('是否确认删除售后问题登记编号为"' + _issueIds + '"的数据项？').then(function() {
    return delRecode(_issueIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('repair/recode/export', {
    ...queryParams.value
  }, `recode_${new Date().getTime()}.xlsx`)
}

getList();
</script>
