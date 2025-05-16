// 存储相关工具函数
const TOKEN_KEY = 'user_token';
const USER_INFO_KEY = 'user_info';

// 保存token
export const setToken = (token) => {
  uni.setStorageSync(TOKEN_KEY, token);
};

// 获取token
export const getToken = () => {
  return uni.getStorageSync(TOKEN_KEY) || '';
};

// 删除token
export const removeToken = () => {
  uni.removeStorageSync(TOKEN_KEY);
};

/**
 * 保存用户信息
 * @param {Object} userInfo - 包含userId和username的对象
 */
export const setUserInfo = (userInfo) => {
  // 确保存储的用户信息格式一致
  const userData = {
    userId: userInfo.userId,
    username: userInfo.username
  };
  uni.setStorageSync(USER_INFO_KEY, JSON.stringify(userData));
};

// 获取用户信息
export const getUserInfo = () => {
  const userInfoStr = uni.getStorageSync(USER_INFO_KEY);
  return userInfoStr ? JSON.parse(userInfoStr) : null;
};

// 删除用户信息
export const removeUserInfo = () => {
  uni.removeStorageSync(USER_INFO_KEY);
};

// 清除所有用户数据
export const clearUserData = () => {
  removeToken();
  removeUserInfo();
};

// 检查是否已登录
export const isLoggedIn = () => {
  return !!getToken();
}; 