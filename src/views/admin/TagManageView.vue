<!-- src/views/admin/TagManageView.vue -->
<template>
  <div class="tag-manage-view">
    <h1>标签管理</h1>

    <div class="actions">
      <el-button type="primary" @click="handleAddNew">新增标签</el-button>
    </div>

    <el-table :data="tagList" v-loading="loading" style="width: 100%">
      <el-table-column prop="id" label="ID" width="180" />
      <el-table-column prop="name" label="标签名称" />
      <el-table-column prop="articleCount" label="关联文章数" />
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button link type="danger" size="small" @click="handleDelete(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑标签' : '新增标签'" width="30%">
      <el-form ref="formRef" :model="formModel" :rules="rules" label-width="80px">
        <el-form-item label="标签名称" prop="name">
          <el-input v-model="formModel.name" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleConfirm">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
// 假设你将要创建的API函数放在这里
import { getAllTagsAdmin, addTagAdmin, updateTagAdmin, deleteTagAdmin } from '@/api/admin';

// 表格数据
const tagList = ref([]);
const loading = ref(true);

// 弹窗与表单
const dialogVisible = ref(false);
const isEdit = ref(false);
const formRef = ref(null);
const formModel = ref({ id: null, name: '' });
const rules = {
  name: [{ required: true, message: '请输入标签名称', trigger: 'blur' }]
};

// 获取列表数据
const fetchTagList = async () => {
  loading.value = true;
  try {
    const res = await getAllTagsAdmin();
    tagList.value = res.data;
  } finally {
    loading.value = false;
  }
};

onMounted(fetchTagList);

// 新增
const handleAddNew = () => {
  isEdit.value = false;
  formModel.value = { id: null, name: '' };
  dialogVisible.value = true;
  formRef.value?.resetFields();
};

// 编辑
const handleEdit = (row) => {
  isEdit.value = true;
  formModel.value = { ...row };
  dialogVisible.value = true;
};

// 删除
const handleDelete = async (id) => {
  await ElMessageBox.confirm('确认删除该标签吗？', '提示', { type: 'warning' });
  await deleteTagAdmin(id);
  ElMessage.success('删除成功');
  fetchTagList();
};

// 弹窗确认
const handleConfirm = async () => {
  await formRef.value.validate();
  if (isEdit.value) {
    await updateTagAdmin(formModel.value.id, { name: formModel.value.name });
    ElMessage.success('更新成功');
  } else {
    await addTagAdmin({ name: formModel.value.name });
    ElMessage.success('新增成功');
  }
  dialogVisible.value = false;
  fetchTagList();
};
</script>

<style scoped>
h1 {
  margin-bottom: 20px;
}
.actions {
  margin-bottom: 20px;
}
</style>
