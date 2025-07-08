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
