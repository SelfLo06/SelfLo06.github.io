import request from '@/utils/request.js'


/**
 * [后台] 根据条件高级查询文章列表 (分页)
 * @param {object} params - { keyword, categoryId, status, pageNum, pageSize, ... }
 * @returns {Promise}
 */
export const getAdminArticles = (params) => {
  // 【修正】后台的所有查询都指向公共的 GET /article 接口
  // 后端会根据Token判断是否为管理员，从而返回所有状态的文章
  return request.get('/article', { params });
};


/**
 * [后台] 根据ID删除文章
 * @param {number | string} id - 文章ID
 * @returns {Promise}
 */
export const deleteArticleById = (id) => {
  // 【关键】确保这里的 URL 和你的后端 API 完全匹配
  // 通常 RESTful 风格的删除操作是 DELETE /resource/{id}
  return request.delete(`/article/${id}`);
};

/**
 * [后台] 获取所有分类列表
 * @returns {Promise}
 */
export const getAllCategories = () => {
  // 根据终极API文档，这个接口需要认证，所以放在 admin.js 中是正确的
  // 路径是 /category
  return request.get('/category');
};


export const addTagAdmin = (data) => {
  // 【修正】/tags -> /tag
  return request.post('/tags', data);
};

export const updateTagAdmin = (id, data) => {
  // 【修正】/tags/{id} -> /tag/{id}
  return request.put(`/tags/${id}`, data);
};

export const deleteTagAdmin = (id) => {
  // 【修正】/tags/{id} -> /tag/{id}
  return request.delete(`/tags/${id}`);
};

// 【注意】GET /tags 接口是复数，这个是正确的，无需修改。
export const getAllTagsAdmin = () => {
  return request.get('/tags');
};
