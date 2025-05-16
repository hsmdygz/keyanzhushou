// API请求封装
import { getToken } from './storage.js';

// API基础URL - 更改为实际API地址
// const BASE_URL = 'https://clifikqzwwps.sealoshzh.site/api';
const BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3001/api'
  : 'https://clifikqzwwps.sealoshzh.site/api'; // 文档中指定的生产环境URL

// API Key
const API_KEY = 'app-gY716lkSIyQTX7h1bW2XDcti';

// 默认超时时间（毫秒）
const DEFAULT_TIMEOUT = 30000; // 增加到30秒

// 请求封装
export const request = (options) => {
  return new Promise((resolve, reject) => {
    // 构建完整URL
    const url = options.url.startsWith('http') ? options.url : `${BASE_URL}${options.url}`;
    
    // 处理请求头
    const header = options.header || {};
    
    // 添加API Key到请求头
    header['X-API-Key'] = API_KEY;
    
    // 如果需要认证，添加token到请求头
    if (options.auth !== false) {
      const token = getToken();
      if (token) {
        header['Authorization'] = `Bearer ${token}`;
      } else {
        // 如果需要认证但没有token，这可能是个问题
        console.warn('请求需要认证但没有找到token', options.url);
      }
    }
    
    console.log('发起请求:', url, options.method || 'GET');
    
    // 发起请求
    const requestTask = uni.request({
      url,
      data: options.data,
      method: options.method || 'GET',
      header,
      timeout: options.timeout || DEFAULT_TIMEOUT, // 使用更长的超时时间
      // 请求成功回调
      success: (res) => {
        console.log('请求响应:', url, res.statusCode);
        // 判断HTTP状态码
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // API响应成功
          if (res.data.code === 200) {
            resolve(res.data);
          } else {
            // API返回错误
            handleError(res.data, reject);
          }
        } else if (res.statusCode === 401) {
          console.warn('收到401未授权响应：', url);
          // 未授权
          handleUnauthorized();
          reject({
            code: 401,
            message: '未授权或登录过期，请重新登录'
          });
        } else if (res.statusCode === 404) {
          // 资源不存在
          console.warn('请求的资源不存在:', url);
          reject({
            code: 404,
            message: '请求的资源不存在',
            url: url
          });
        } else {
          // 其他HTTP错误
          reject({
            code: res.statusCode,
            message: `请求失败: ${res.statusCode}`
          });
        }
      },
      // 请求失败回调
      fail: (err) => {
        console.error('请求错误:', url, err);
        // 判断是否为超时错误
        if (err.errMsg && err.errMsg.includes('timeout')) {
          reject({
            code: -1,
            message: '请求超时，服务器响应时间过长',
            isTimeout: true
          });
        } else {
          reject({
            code: -1,
            message: '网络错误，请检查网络连接',
            isNetworkError: true
          });
        }
      }
    });
    
    // 如果需要可以返回requestTask以便外部取消请求
    if (options.getTask) {
      options.getTask(requestTask);
    }
  });
};

// 处理API错误
const handleError = (response, reject) => {
  // 处理常见错误
  switch (response.code) {
    case 400:
      // 请求参数错误
      reject({
        code: 400,
        message: response.message || '请求参数错误',
        errors: response.errors
      });
      break;
    case 401:
      // 未授权
      handleUnauthorized();
      reject({
        code: 401,
        message: '未授权或登录过期，请重新登录'
      });
      break;
    case 403:
      // 权限不足
      reject({
        code: 403,
        message: '权限不足，无法访问'
      });
      break;
    case 404:
      // 资源不存在
      reject({
        code: 404,
        message: '请求的资源不存在'
      });
      break;
    case 500:
      // 服务器错误
      reject({
        code: 500,
        message: '服务器内部错误，请稍后再试'
      });
      break;
    default:
      // 其他错误
      reject({
        code: response.code || -1,
        message: response.message || '未知错误'
      });
  }
};

// 处理未授权情况
const handleUnauthorized = () => {
  // 清除本地存储的用户信息
  try {
    const { clearUserData } = require('./storage.js');
    clearUserData();
    
    // 跳转到登录页面
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    
    // 如果当前页面不是登录页面，则跳转到登录页面
    if (currentPage && !currentPage.route.includes('login')) {
      console.log('检测到未授权状态，准备跳转到登录页面');
      
      // 延迟执行以避免导航冲突
      setTimeout(() => {
        uni.redirectTo({
          url: '/pages/login/login',
          success: () => {
            console.log('已成功跳转到登录页面');
          },
          fail: (err) => {
            console.error('跳转到登录页面失败:', err);
            // 尝试更直接的方式
            try {
              if (process.env.UNI_PLATFORM === 'h5') {
                const baseUrl = location.origin + location.pathname;
                window.location.href = baseUrl + '#/pages/login/login';
              } else {
                uni.reLaunch({
                  url: '/pages/login/login'
                });
              }
            } catch (e) {
              console.error('所有跳转尝试都失败:', e);
            }
          }
        });
      }, 100);
    }
  } catch (error) {
    console.error('处理未授权错误:', error);
  }
};

// 封装HTTP方法
export const http = {
  get: (url, params, options = {}) => {
    return request({
      url,
      method: 'GET',
      data: params,
      ...options
    });
  },
  post: (url, data, options = {}) => {
    return request({
      url,
      method: 'POST',
      data,
      ...options
    });
  },
  put: (url, data, options = {}) => {
    return request({
      url,
      method: 'PUT',
      data,
      ...options
    });
  },
  delete: (url, data, options = {}) => {
    return request({
      url,
      method: 'DELETE',
      data,
      ...options
    });
  },
  // 上传文件
  upload: (url, filePath, formData = {}, options = {}) => {
    return new Promise((resolve, reject) => {
      const token = getToken();
      const header = options.header || {};
      
      // 添加API Key到请求头
      header['X-API-Key'] = API_KEY;
      
      if (token) {
        header['Authorization'] = `Bearer ${token}`;
      }

      console.log('开始上传文件:', url, '文件路径:', filePath);
      
      const completeUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;
      console.log('完整上传URL:', completeUrl);
      
      const uploadTask = uni.uploadFile({
        url: completeUrl,
        filePath,
        name: options.name || 'file',
        formData,
        header,
        timeout: options.timeout || DEFAULT_TIMEOUT, // 使用更长的超时时间
        success: (uploadRes) => {
          console.log('上传响应:', uploadRes);
          try {
            // 尝试解析响应
            const data = JSON.parse(uploadRes.data);
            if (data.code === 200) {
              resolve(data);
            } else {
              handleError(data, reject);
            }
          } catch (e) {
            console.error('响应解析失败:', e, uploadRes);
            reject({
              code: -1,
              message: '解析响应失败: ' + (e.message || '未知错误')
            });
          }
        },
        fail: (err) => {
          console.error('上传失败详情:', err);
          // 判断是否为超时错误
          if (err.errMsg && err.errMsg.includes('timeout')) {
            reject({
              code: -1,
              message: '上传超时，服务器响应时间过长',
              isTimeout: true
            });
          } else if (err.errMsg && err.errMsg.includes('fail connect')) {
            reject({
              code: -1,
              message: '无法连接到服务器，请检查网络或服务器状态',
              isConnectionError: true
            });
          } else {
            reject({
              code: -1,
              message: '上传失败: ' + (err.errMsg || '未知错误'),
              isNetworkError: true
            });
          }
        }
      });
      
      // 监听上传进度
      uploadTask.onProgressUpdate((res) => {
        console.log('上传进度:', res.progress);
        if (options.onProgress) {
          options.onProgress(res.progress);
        }
      });
      
      // 如果需要可以返回uploadTask以便外部取消上传
      if (options.getTask) {
        options.getTask(uploadTask);
      }
    });
  }
}; 