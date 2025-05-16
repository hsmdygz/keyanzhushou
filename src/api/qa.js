// 科研问答助手相关API接口
import { http } from '@/utils/request.js';

/**
 * 科研问答
 * @param {string} question - 用户问题
 * @param {string} [sessionId] - 会话ID(可选，首次对话不需要)
 * @param {Object} [context] - 科研上下文信息(可选)
 * @returns {Promise} - 返回Promise对象
 */
export const qaChat = (question, sessionId, context) => {
  const params = { question };
  
  // 只有当sessionId有值且不为空字符串时才添加
  if (sessionId && sessionId.trim() !== '') {
    params.sessionId = sessionId;
    console.log('使用现有会话ID:', sessionId);
  } else {
    console.log('创建新会话，不使用会话ID');
  }
  
  if (context) params.context = context;
  
  console.log('发送科研问答请求:', params);
  
  return http.post('/qa/chat', params)
    .then(response => {
      console.log('科研问答API响应原始数据:', response);
      
      // 处理并返回响应数据
      let answer = null;
      let responseSessionId = sessionId;
      let references = [];
      
      // 处理多层嵌套的可能性
      if (response && response.data && response.data.data) {
        // 处理二层嵌套的情况 - response.data.data 结构
        const innerData = response.data.data;
        responseSessionId = innerData.sessionId || sessionId;
        references = innerData.references || [];
        
        if (innerData.answer) {
          answer = innerData.answer;
        } else if (innerData.reply) {
          answer = innerData.reply;
        }
      } else if (response && response.data) {
        // 处理一层嵌套的情况 - response.data 结构
        responseSessionId = response.data.sessionId || sessionId;
        references = response.data.references || [];
        
        if (response.data.answer) {
          answer = response.data.answer;
        } else if (response.data.reply) {
          answer = response.data.reply;
        }
      }
      
      // 如果没有找到answer，尝试其他可能的结构
      if (!answer) {
        if (response.answer) {
          answer = response.answer;
        } else if (response.reply) {
          answer = response.reply;
        } else if (response.content) {
          answer = response.content;
        } else if (response.response) {
          answer = response.response;
        } else if (response.data) {
          // 最后尝试直接访问各种可能的字段
          const data = response.data;
          answer = data.answer || data.reply || data.content || data.response;
        }
      }
      
      // 确保会话ID有效
      if (responseSessionId) {
        console.log('成功获取到会话ID:', responseSessionId);
      } else {
        console.warn('未能获取到会话ID，这可能会影响连续对话');
      }
      
      console.log('处理后的结果:', { answer, sessionId: responseSessionId, references });
      
      return {
        answer: answer,
        sessionId: responseSessionId,
        references: references
      };
    })
    .catch(error => {
      console.error('科研问答API错误:', error);
      // 标记错误类型，以便上层能更好地处理
      if (error.code === 404) {
        error.sessionInvalid = true;
      } else if (error.code === 401 || error.code === 400) {
        error.authError = true;
      }
      throw error;
    });
};

/**
 * 获取对话历史
 * @param {string} sessionId - 会话ID
 * @returns {Promise} - 返回Promise对象
 */
export const getChatHistory = (sessionId) => {
  return http.get(`/qa/history/${sessionId}`);
};

/**
 * 获取对话列表
 * @param {number} page - 页码（可选，默认1）
 * @param {number} size - 每页条数（可选，默认10）
 * @returns {Promise} - 返回Promise对象
 */
export const getChatSessions = (page = 1, size = 10) => {
  return http.get('/qa/sessions', {
    params: { page, size }
  });
};

/**
 * 删除对话
 * @param {string} sessionId - 会话ID
 * @returns {Promise} - 返回Promise对象
 */
export const deleteSession = (sessionId) => {
  return http.delete(`/qa/sessions/${sessionId}`);
}; 