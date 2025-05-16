// 系统相关API接口
import { http } from '@/utils/request.js';

/**
 * 获取支持的语言列表
 * @returns {Promise} - 返回Promise对象
 */
export const getLanguages = () => {
  return http.get('/system/languages', {}, { auth: false });
};

/**
 * 获取论文模板
 * @returns {Promise} - 返回Promise对象
 */
export const getTemplates = () => {
  return http.get('/system/templates');
};

/**
 * 检查服务状态
 * @returns {Promise} - 返回Promise对象
 */
export const checkStatus = () => {
  return http.get('/system/status', {}, { auth: false });
}; 