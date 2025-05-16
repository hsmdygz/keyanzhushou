// AI请求历史相关API接口
import { http } from '@/utils/request.js';

/**
 * 获取AI请求历史记录
 * @param {number} page - 页码（可选，默认1）
 * @param {number} size - 每页条数（可选，默认10）
 * @param {string} [appType] - 应用类型（可选，paper|translation|qa）
 * @returns {Promise} - 返回Promise对象
 */
export const getAIHistory = (page = 1, size = 10, appType) => {
  const params = { page, size };
  if (appType) params.appType = appType;
  
  return http.get('/ai/history', { params });
};

/**
 * 获取AI请求详情
 * @param {string} requestId - 请求ID
 * @returns {Promise} - 返回Promise对象
 */
export const getAIRequestDetail = (requestId) => {
  return http.get(`/ai/history/${requestId}`);
}; 