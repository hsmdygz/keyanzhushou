// 写作助手相关API接口
import { http } from '@/utils/request.js';

/**
 * 生成论文提纲
 * @param {string} topic - 论文主题
 * @param {string} type - 论文类型 (research或review)
 * @returns {Promise} - 返回Promise对象
 */
export const generateOutline = (topic, type) => {
  return http.post('/writing/outline', { topic, type });
};

/**
 * AI辅助写作
 * @param {string} prompt - 提示词
 * @param {string} [style] - 写作风格 (formal或concise)
 * @returns {Promise} - 返回Promise对象
 */
export const getWritingAssistance = (prompt, style) => {
  return http.post('/writing/assist', { prompt, style });
};

/**
 * 获取写作助手对话
 * @param {string} message - 用户消息
 * @param {string} [sessionId] - 会话ID(可选，首次对话不需要)
 * @param {Object} [context] - 上下文信息(可选)
 * @returns {Promise} - 返回Promise对象
 */
export const writingChat = (message, sessionId, context) => {
  const params = { message };
  
  // 只有当sessionId有值且不为空字符串时才添加
  if (sessionId && sessionId.trim() !== '') {
    params.sessionId = sessionId;
    console.log('使用现有会话ID:', sessionId);
  } else {
    console.log('创建新会话，不使用会话ID');
  }
  
  if (context) params.context = context;
  
  console.log('发送写作对话请求:', params);
  
  return http.post('/writing/chat', params)
    .then(response => {
      console.log('写作对话API响应原始数据:', response);
      
      // 处理并返回响应数据
      let answer = null;
      let responseSessionId = sessionId;
      
      // 处理多层嵌套的可能性
      if (response && response.data && response.data.data) {
        // 处理二层嵌套的情况 - response.data.data 结构
        const innerData = response.data.data;
        responseSessionId = innerData.sessionId || sessionId;
        
        if (innerData.reply) {
          answer = innerData.reply;
        } else if (innerData.suggestions && innerData.suggestions.length > 0) {
          answer = innerData.suggestions[0];
        }
      } else if (response && response.data) {
        // 处理一层嵌套的情况 - response.data 结构
        responseSessionId = response.data.sessionId || sessionId;
        
        if (response.data.reply) {
          answer = response.data.reply;
        } else if (response.data.suggestions && response.data.suggestions.length > 0) {
          answer = response.data.suggestions[0];
        }
      }
      
      // 如果没有找到answer，尝试其他可能的结构
      if (!answer) {
        if (response.reply) {
          answer = response.reply;
        } else if (response.content) {
          answer = response.content;
        } else if (response.answer) {
          answer = response.answer;
        } else if (response.response) {
          answer = response.response;
        } else if (response.suggestions && response.suggestions.length > 0) {
          answer = response.suggestions[0];
        } else if (response.data) {
          // 最后尝试直接访问各种可能的字段
          const data = response.data;
          answer = data.reply || data.content || data.answer || data.response || 
                  (data.suggestions && data.suggestions.length > 0 ? data.suggestions[0] : null);
        }
      }
      
      // 确保会话ID有效
      if (responseSessionId) {
        console.log('成功获取到会话ID:', responseSessionId);
      } else {
        console.warn('未能获取到会话ID，这可能会影响连续对话');
      }
      
      console.log('处理后的结果:', { answer, sessionId: responseSessionId });
      
      return {
        answer: answer,
        sessionId: responseSessionId
      };
    })
    .catch(error => {
      console.error('写作对话API错误:', error);
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
  return http.get(`/writing/history/${sessionId}`);
};

/**
 * 获取对话列表
 * @param {number} page - 页码（可选，默认1）
 * @param {number} size - 每页条数（可选，默认10）
 * @returns {Promise} - 返回Promise对象
 */
export const getChatSessions = (page = 1, size = 10) => {
  return http.get('/writing/sessions', {
    params: { page, size }
  });
};

/**
 * 删除对话
 * @param {string} sessionId - 会话ID
 * @returns {Promise} - 返回Promise对象
 */
export const deleteSession = (sessionId) => {
  return http.delete(`/writing/sessions/${sessionId}`);
};

/**
 * 论文写作辅助
 * @param {string} type - 写作类型 (outline|introduction|conclusion|abstract|methodology)
 * @param {string} topic - 主题
 * @param {string} [paperId] - 关联的论文ID(可选)
 * @param {string} [requirements] - 写作要求(可选)
 * @returns {Promise} - 返回Promise对象
 */
export const writingAssist = (type, topic, paperId, requirements) => {
  const params = { type, topic };
  if (paperId) params.paperId = paperId;
  if (requirements) params.requirements = requirements;
  
  return http.post('/writing/assist', params);
};

/**
 * 改进文本内容
 * @param {string} text - 需要改进的文本
 * @param {string[]} [aspects] - 需要改进的方面 (grammar, clarity, academic)
 * @returns {Promise} - 返回Promise对象
 */
export const improveText = (text, aspects) => {
  const params = { text };
  if (aspects && aspects.length > 0) params.aspects = aspects;
  
  return http.post('/writing/improve', params);
};

/**
 * 获取写作记录
 * @param {number} page - 页码（可选，默认1）
 * @param {number} size - 每页条数（可选，默认10）
 * @param {string} type - 类型（可选，assist|improve|all，默认all）
 * @returns {Promise} - 返回Promise对象
 */
export const getWritingRecords = (page = 1, size = 10, type = 'all') => {
  return http.get('/writing/records', {
    params: { page, size, type }
  });
};

/**
 * 保存文稿
 * @param {string} title - 文稿标题
 * @param {string} content - 文稿内容
 * @param {string[]} [tags] - 标签（可选）
 * @returns {Promise} - 返回Promise对象
 */
export const saveDraft = (title, content, tags) => {
  const params = { title, content };
  if (tags && tags.length > 0) params.tags = tags;
  
  return http.post('/writing/save', params);
};

/**
 * 获取文稿列表
 * @param {number} page - 页码（可选，默认1）
 * @param {number} size - 每页条数（可选，默认10）
 * @param {string} [tag] - 按标签筛选（可选）
 * @returns {Promise} - 返回Promise对象
 */
export const getDraftList = (page = 1, size = 10, tag) => {
  const params = { page, size };
  if (tag) params.tag = tag;
  
  return http.get('/writing/drafts', { params });
};

/**
 * 获取文稿详情
 * @param {string} draftId - 文稿ID
 * @returns {Promise} - 返回Promise对象
 */
export const getDraftDetail = (draftId) => {
  return http.get(`/writing/drafts/${draftId}`);
};

/**
 * 更新文稿
 * @param {string} draftId - 文稿ID
 * @param {string} title - 文稿标题
 * @param {string} content - 文稿内容
 * @param {string[]} [tags] - 标签（可选）
 * @returns {Promise} - 返回Promise对象
 */
export const updateDraft = (draftId, title, content, tags) => {
  const params = { title, content };
  if (tags && tags.length > 0) params.tags = tags;
  
  return http.put(`/writing/drafts/${draftId}`, params);
};

/**
 * 删除文稿
 * @param {string} draftId - 文稿ID
 * @returns {Promise} - 返回Promise对象
 */
export const deleteDraft = (draftId) => {
  return http.delete(`/writing/drafts/${draftId}`);
};

/**
 * 根据提示扩展内容
 * @param {string} prompt - 扩展提示
 * @param {string} [context] - 上下文内容（可选）
 * @param {string} [length] - 生成长度（可选，short、medium或long，默认medium）
 * @returns {Promise} - 返回Promise对象
 */
export const expandContent = (prompt, context, length) => {
  return http.post('/writing/expand', {
    prompt,
    context,
    length
  });
};

/**
 * 完善写作改进
 * @param {string} text - 需要改进的文本
 * @param {string} [aspectToImprove] - 需要改进的方面（可选）
 * @returns {Promise} - 返回Promise对象
 */
export const improveWriting = (text, aspectToImprove) => {
  return http.post('/writing/improve', {
    text,
    aspectToImprove
  });
};

/**
 * 获取写作辅助状态
 * @param {string} assistId - 辅助ID
 * @returns {Promise} - 返回Promise对象
 */
export const getWritingAssistStatus = (assistId) => {
  return http.get(`/writing/assist/status/${assistId}`);
}; 