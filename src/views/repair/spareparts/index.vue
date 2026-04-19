<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
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
      <el-form-item label="维修服务商负责人" prop="providerCharge">
        <el-input
          v-model="queryParams.providerCharge"
          placeholder="请输入维修服务商负责人"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="维修服务商联系人" prop="providerContactPerson">
        <el-input
          v-model="queryParams.providerContactPerson"
          placeholder="请输入维修服务商联系人"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="维修服务商联系方式" prop="providerContactPhone">
        <el-input
          v-model="queryParams.providerContactPhone"
          placeholder="请输入维修服务商联系方式"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="省ID" prop="provinceId">
        <el-input
          v-model="queryParams.provinceId"
          placeholder="请输入省ID"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="省" prop="province">
        <el-input
          v-model="queryParams.province"
          placeholder="请输入省"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="市ID" prop="cityId">
        <el-input
          v-model="queryParams.cityId"
          placeholder="请输入市ID"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="市" prop="city">
        <el-input
          v-model="queryParams.city"
          placeholder="请输入市"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="区(县)ID" prop="districtId">
        <el-input
          v-model="queryParams.districtId"
          placeholder="请输入区(县)ID"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="区(县)" prop="district">
        <el-input
          v-model="queryParams.district"
          placeholder="请输入区(县)"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="维修服务商归属区域" prop="serviceRegion">
        <el-input
          v-model="queryParams.serviceRegion"
          placeholder="请输入维修服务商归属区域"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="是否删除(0:正常,1:删除)" prop="isDel">
        <el-input
          v-model="queryParams.isDel"
          placeholder="请输入是否删除(0:正常,1:删除)"
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
          v-hasPermi="['repair:spareparts:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['repair:spareparts:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['repair:spareparts:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['repair:spareparts:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="sparepartsList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="主键" align="center" prop="providerId" />
      <el-table-column label="维修服务商编码" align="center" prop="providerCode" />
      <el-table-column label="维修服务商名称" align="center" prop="providerName" />
      <el-table-column label="维修服务商负责人" align="center" prop="providerCharge" />
      <el-table-column label="维修服务商联系人" align="center" prop="providerContactPerson" />
      <el-table-column label="维修服务商联系方式" align="center" prop="providerContactPhone" />
      <el-table-column label="省ID" align="center" prop="provinceId" />
      <el-table-column label="省" align="center" prop="province" />
      <el-table-column label="市ID" align="center" prop="cityId" />
      <el-table-column label="市" align="center" prop="city" />
      <el-table-column label="区(县)ID" align="center" prop="districtId" />
      <el-table-column label="区(县)" align="center" prop="district" />
      <el-table-column label="维修服务商归属区域" align="center" prop="serviceRegion" />
      <el-table-column label="是否删除(0:正常,1:删除)" align="center" prop="isDel" />
      <el-table-column label="说明" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['repair:spareparts:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['repair:spareparts:remove']">删除</el-button>
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

    <!-- 添加或修改维修服务商管理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="sparepartsRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="维修服务商编码" prop="providerCode">
          <el-input v-model="form.providerCode" placeholder="请输入维修服务商编码" />
        </el-form-item>
        <el-form-item label="维修服务商名称" prop="providerName">
          <el-input v-model="form.providerName" placeholder="请输入维修服务商名称" />
        </el-form-item>
        <el-form-item label="维修服务商负责人" prop="providerCharge">
          <el-input v-model="form.providerCharge" placeholder="请输入维修服务商负责人" />
        </el-form-item>
        <el-form-item label="维修服务商联系人" prop="providerContactPerson">
          <el-input v-model="form.providerContactPerson" placeholder="请输入维修服务商联系人" />
        </el-form-item>
        <el-form-item label="维修服务商联系方式" prop="providerContactPhone">
          <el-input v-model="form.providerContactPhone" placeholder="请输入维修服务商联系方式" />
        </el-form-item>
        <el-form-item label="省ID" prop="provinceId">
          <el-input v-model="form.provinceId" placeholder="请输入省ID" />
        </el-form-item>
        <el-form-item label="省" prop="province">
          <el-input v-model="form.province" placeholder="请输入省" />
        </el-form-item>
        <el-form-item label="市ID" prop="cityId">
          <el-input v-model="form.cityId" placeholder="请输入市ID" />
        </el-form-item>
        <el-form-item label="市" prop="city">
          <el-input v-model="form.city" placeholder="请输入市" />
        </el-form-item>
        <el-form-item label="区(县)ID" prop="districtId">
          <el-input v-model="form.districtId" placeholder="请输入区(县)ID" />
        </el-form-item>
        <el-form-item label="区(县)" prop="district">
          <el-input v-model="form.district" placeholder="请输入区(县)" />
        </el-form-item>
        <el-form-item label="维修服务商归属区域" prop="serviceRegion">
          <el-input v-model="form.serviceRegion" placeholder="请输入维修服务商归属区域" />
        </el-form-item>
        <el-form-item label="是否删除(0:正常,1:删除)" prop="isDel">
          <el-input v-model="form.isDel" placeholder="请输入是否删除(0:正常,1:删除)" />
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

<script setup name="Spareparts">
import { listSpareparts, getSpareparts, delSpareparts, addSpareparts, updateSpareparts } from "@/api/repair/spareparts";

const { proxy } = getCurrentInstance();

const sparepartsList = ref([]);
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
    providerCode: null,
    providerName: null,
    providerCharge: null,
    providerContactPerson: null,
    providerContactPhone: null,
    provinceId: null,
    province: null,
    cityId: null,
    city: null,
    districtId: null,
    district: null,
    serviceRegion: null,
    isDel: null,
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

/** 查询维修服务商管理列表 */
function getList() {
  loading.value = true;
  listSpareparts(queryParams.value).then(response => {
    sparepartsList.value = response.rows;
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
    providerId: null,
    providerCode: null,
    providerName: null,
    providerCharge: null,
    providerContactPerson: null,
    providerContactPhone: null,
    provinceId: null,
    province: null,
    cityId: null,
    city: null,
    districtId: null,
    district: null,
    serviceRegion: null,
    isDel: null,
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
  proxy.resetForm("sparepartsRef");
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
  ids.value = selection.map(item => item.providerId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加维修服务商管理";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _providerId = row.providerId || ids.value
  getSpareparts(_providerId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改维修服务商管理";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["sparepartsRef"].validate(valid => {
    if (valid) {
      if (form.value.providerId != null) {
        updateSpareparts(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addSpareparts(form.value).then(response => {
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
  const _providerIds = row.providerId || ids.value;
  proxy.$modal.confirm('是否确认删除维修服务商管理编号为"' + _providerIds + '"的数据项？').then(function() {
    return delSpareparts(_providerIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('repair/spareparts/export', {
    ...queryParams.value
  }, `spareparts_${new Date().getTime()}.xlsx`)
}

getList();
</script>
