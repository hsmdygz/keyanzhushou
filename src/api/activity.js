// 活动相关API接口
import { http } from '@/utils/request.js';

/**
 * 获取最近活动
 * @returns {Promise} - 返回Promise对象
 */
export const getRecentActivities = () => {
  return http.get('/activity/recent');
};

/**
 * 删除活动记录
 * @param {string} activityId - 活动ID
 * @returns {Promise} - 返回Promise对象
 */
export const deleteActivity = (activityId) => {
  return http.delete(`/activity/delete/${activityId}`);
}; 