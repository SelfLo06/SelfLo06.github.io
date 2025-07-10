// /src/api/public.js
import request from '@/utils/request';

/**
 * 获取已发布的文章列表 (分页查询)
 * @param {object} params - 查询参数, 例如 { pageNum: 1, pageSize: 10 }
 * @returns Promise
 */
export const getPublishedArticles = (params) => {
  // 0 代表 "已发布"
  const queryParams = {
    status: 0,
    sortBy: 'create_time',
    order: 'desc',
    ...params
  };

  return request({
    url: '/article',
    method: 'get',
    params: queryParams
  });
};

/**
 * 根据ID获取单篇文章详情
 * @param {string|number} id - 文章ID
 * @returns Promise
 */
export const getArticleDetailById = (id) => {
  return request({
    // 【V1.5.1 新增】为即将到来的文章详情页做准备
    url: `/article/${id}`,
    method: 'get'
  });
};

/**
 * 获取带文章数量和详情的分类列表 (公开接口)
 * @returns {Promise}
 */
export const getCategoryDetails = () => {
  // 调用我们后端创建的 GET /category/details 接口
  return request.get('/category/details');
}

/**
 * 获取网站的统计数据 (文章数, 分类数等)
 * @returns {Promise}
 */
export const getSiteStats = () => {
  // 调用我们后端创建的 GET /stats/summary 接口
  return request.get('/stats/summary');
}

/**
 * 搜索已发布的文章 (分页查询)
 * @param {object} params - 查询参数, 例如 { keyword: 'Vue', pageNum: 1, pageSize: 10 }
 * @returns Promise
 */
export const searchArticles = (params) => {
  // 确保 status=0，这样访客只能搜索到已发布的文章
  const queryParams = {
    status: 0,
    ...params
  };

  return request({
    url: '/article/search', // 确保这个 URL 和你后端定义的完全一致
    method: 'get',
    params: queryParams
  });
};

/**
 * 获取所有公开的标签列表 (用于标签云、标签搜索等)
 * @returns {Promise}
 */
export const getAllTags = () => {
  // 根据终极API文档，这个接口是 GET /tags
  return request.get('/tags');
};

