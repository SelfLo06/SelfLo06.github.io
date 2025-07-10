<!-- src/views/admin/CategoryManageView.vue (V2.0 - Element Plus Dialog & Form) -->
<template>
  <el-card class="box-card">
    <template #header>
      <div class="card-header">
        <span>分类管理</span>
        <!-- 将按钮移动到 Card Header 中 -->
        <el-button type="primary" @click="openDialog('add')">新增分类</el-button>
      </div>
    </template>

    <!-- 数据表格 -->
    <el-table :data="categoryList" v-loading="loading" style="width: 100%">
      <el-table-column prop="id" label="ID" width="100"></el-table-column>
      <el-table-column prop="name" label="分类名称"></el-table-column>
      <!-- 新增：显示描述 -->
      <el-table-column prop="description" label="描述" show-overflow-tooltip></el-table-column>
      <!-- 新增：以图片形式预览封面图 -->
      <el-table-column label="封面图预览" width="150">
        <template #default="{ row }">
          <el-image
            v-if="row.coverImage"
            style="width: 100px; height: 50px"
            :src="row.coverImage"
            :preview-src-list="[row.coverImage]"
            fit="cover"
            preview-teleported
          />
          <span v-else>无</span>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间"></el-table-column>
      <el-table-column label="操作" width="150">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="openDialog('edit', row)">编辑</el-button>
          <el-button type="danger" size="small" @click="handleDelete(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-card>

  <!-- 新增/编辑对话框 -->
  <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
    <el-form :model="formModel" :rules="rules" ref="formRef" label-width="100px">
      <el-form-item label="分类名称" prop="name">
        <el-input v-model="formModel.name" placeholder="请输入分类名称"></el-input>
      </el-form-item>
      <!-- 新增：描述输入框 -->
      <el-form-item label="分类描述" prop="description">
        <el-input v-model="formModel.description" type="textarea" placeholder="请输入分类的简短描述"></el-input>
      </el-form-item>
      <!-- 新增：封面图URL输入框 -->
      <el-form-item label="封面图URL" prop="coverImage">
        <el-input v-model="formModel.coverImage" placeholder="请输入图片的网络地址"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submitForm">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import request from '@/utils/request.js';

// --- 表格数据 ---
const categoryList = ref([]);
const loading = ref(true);

const fetchCategoryList = async () => {
  loading.value = true;
  try {
    const res = await request.get('/category');
    categoryList.value = res.data;
  } catch (error) {
    ElMessage.error(error.message || '获取分类列表失败');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchCategoryList();
});

// --- 对话框与表单逻辑 ---
const dialogVisible = ref(false);
const formModel = ref({
  id: null,
  name: '',
  description: '',
  coverImage: ''
});
const formRef = ref(null);
const editMode = ref(false);

const dialogTitle = computed(() => (editMode.value ? '编辑分类' : '新增分类'));

const rules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
};

// 打开对话框 (核心函数)
const openDialog = (mode, category = null) => {
  editMode.value = mode === 'edit';
  if (editMode.value) {
    // 编辑模式：用传入的数据填充表单
    formModel.value = { ...category };
  } else {
    // 新增模式：重置表单为空
    formModel.value = { id: null, name: '', description: '', coverImage: '' };
  }
  dialogVisible.value = true;
  // 清除上次的校验结果
  formRef.value?.clearValidate();
};

// 提交表单
const submitForm = async () => {
  // 校验表单
  await formRef.value.validate();

  try {
    if (editMode.value) {
      // 调用更新API
      await request.put('/category', formModel.value);
      ElMessage.success('更新成功！');
    } else {
      // 调用新增API
      await request.post('/category', formModel.value);
      ElMessage.success('新增成功！');
    }
    dialogVisible.value = false;
    await fetchCategoryList(); // 重新加载列表
  } catch (error) {
    ElMessage.error(error.message || '操作失败');
  }
};

// 删除分类
const handleDelete = async (id) => {
  await ElMessageBox.confirm('您确定要删除该分类吗？', '温馨提示', {
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消',
  });

  try {
    await request.delete(`/category/${id}`);
    ElMessage.success('删除成功！');
    await fetchCategoryList();
  } catch (error) {
    ElMessage.error(error.message || '删除失败');
  }
};
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
