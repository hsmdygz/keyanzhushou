// 用户相关API接口
import { http } from '@/utils/request.js';

/**
 * 用户登录
 * @param {string} username - 用户名或邮箱
 * @param {string} password - 密码
 * @returns {Promise} - 返回Promise对象
 */
export const login = (username, password) => {
  return http.post('/user/login', {
    username,
    password
  });
};

/**
 * 用户注册
 * @param {string} username - 用户名
 * @param {string} email - 邮箱
 * @param {string} password - 密码
 * @returns {Promise} - 返回Promise对象
 */
export const register = (username, email, password) => {
  return http.post('/user/register', {
    username,
    email,
    password
  });
};

/**
 * 获取用户信息
 * @returns {Promise} - 返回Promise对象
 */
export const getUserInfo = () => {
  return http.get('/user/info');
};

/**
 * 更新用户信息
 * @param {Object} userData - 用户资料
 * @param {string} [userData.username] - 用户名
 * @param {string} [userData.email] - 邮箱
 * @param {string} [userData.avatar] - 头像URL
 * @returns {Promise} - 返回Promise对象
 */
export const updateUserInfo = (userData) => {
  return http.put('/user/update', userData);
};

/**
 * 修改密码
 * @param {string} oldPassword - 旧密码
 * @param {string} newPassword - 新密码
 * @returns {Promise} - 返回Promise对象
 */
export const changePassword = (oldPassword, newPassword) => {
  return http.put('/user/password', {
    oldPassword,
    newPassword
  });
};

/**
 * 退出登录
 * @returns {Promise} - 返回Promise对象
 */
export const logout = () => {
  return http.post('/user/logout');
}; 