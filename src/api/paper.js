// 论文分析相关API接口
import { http } from '@/utils/request.js';

/**
 * 上传论文
 * @param {File} file - 论文文件（PDF格式）
 * @param {string} title - 论文标题（可选）
 * @returns {Promise} - 返回Promise对象
 */
export const uploadPaper = (file, title) => {
  // 设置超时选项为60秒，因为文件上传可能需要更长时间
  const options = {
    timeout: 60000,
    name: 'file'
  };
  
  // 准备FormData
  const formData = {};
  if (title) {
    formData.title = title;
  }
  
  // 如果是uni-app环境中选择的文件，直接使用path
  if (file && file.path) {
    return http.upload('/paper/upload', file.path, formData, options);
  } 
  // 如果是普通的File对象（H5环境）
  else if (file instanceof File) {
    const formData = new FormData();
    formData.append('file', file);
    if (title) {
      formData.append('title', title);
    }
    return http.post('/paper/upload', formData, {
      header: {
        'Content-Type': 'multipart/form-data'
      },
      timeout: 60000
    });
  }
  // 参数错误
  else {
    return Promise.reject({
      code: 400,
      message: '无效的文件参数'
    });
  }
};

/**
 * 分析论文
 * @param {string} paperId - 论文ID
 * @returns {Promise} - 返回Promise对象
 */
export const analyzePaper = (paperId) => {
  return http.get(`/paper/analyze/${paperId}`);
};

/**
 * 获取论文列表
 * @param {number} page - 页码（可选，默认1）
 * @param {number} size - 每页条数（可选，默认10）
 * @param {string} status - 分析状态（可选，all|processing|completed|failed）
 * @returns {Promise} - 返回Promise对象
 */
export const getPaperList = (page = 1, size = 10, status = 'all') => {
  return http.get('/paper/list', {
    params: {
      page,
      size,
      status
    }
  });
};

/**
 * 获取论文详情
 * @param {string} id - 论文ID
 * @returns {Promise} - 返回Promise对象
 */
export const getPaperDetail = (id) => {
  return http.get(`/papers/${id}`);
};

/**
 * 删除论文
 * @param {string} paperId - 论文ID
 * @returns {Promise} - 返回Promise对象
 */
export const deletePaper = (paperId) => {
  return http.delete(`/paper/delete/${paperId}`);
};

/**
 * 更新论文标签
 * @param {string} id - 论文ID
 * @param {string[]} tags - 标签数组
 * @returns {Promise} - 返回Promise对象
 */
export const updatePaperTags = (id, tags) => {
  return http.put(`/papers/${id}/tags`, { tags });
};

/**
 * 获取论文笔记
 * @param {string} paperId - 论文ID
 * @returns {Promise} - 返回Promise对象
 */
export const getPaperNotes = (paperId) => {
  return http.get(`/papers/${paperId}/notes`);
};

/**
 * 保存论文笔记
 * @param {string} paperId - 论文ID
 * @param {string} content - 笔记内容
 * @returns {Promise} - 返回Promise对象
 */
export const savePaperNotes = (paperId, content) => {
  return http.post(`/papers/${paperId}/notes`, { content });
};

/**
 * 提取论文重点
 * @param {string} paperId - 论文ID
 * @param {string} section - 章节名称（可选）
 * @returns {Promise} - 返回Promise对象
 */
export const extractHighlights = (paperId, section) => {
  return http.get(`/papers/${paperId}/highlights`, {
    params: { section }
  });
};

/**
 * 生成论文总结
 * @param {string} paperId - 论文ID
 * @param {string} language - 语言（例如：'zh-CN', 'en-US'）
 * @returns {Promise} - 返回Promise对象
 */
export const generateSummary = (paperId, language) => {
  return http.post(`/papers/${paperId}/summary`, { language });
};

/**
 * 论文问答
 * @param {Object} params - 参数对象
 * @param {string} params.paperId - 论文ID
 * @param {string} params.question - 问题内容
 * @returns {Promise} - 返回Promise对象
 */
export const paperQA = (params) => {
  return http.post(`/papers/${params.paperId}/qa`, { question: params.question });
};

/**
 * 获取论文摘要
 * @param {string} id - 论文ID
 * @returns {Promise} - 返回Promise对象
 */
export const getPaperSummary = (id) => {
  return http.get(`/papers/${id}/summary`);
};

/**
 * 获取论文关键点
 * @param {string} id - 论文ID
 * @returns {Promise} - 返回Promise对象
 */
export const getPaperKeypoints = (id) => {
  return http.get(`/papers/${id}/keypoints`);
};

/**
 * 获取论文分析状态
 * @param {string} paperId - 论文ID
 * @returns {Promise} - 返回Promise对象，包含分析状态、进度和预计完成时间
 */
export const getPaperStatus = (paperId) => {
  return http.get(`/paper/analysis/status/${paperId}`);
};

/**
 * 获取论文分析结果
 * @param {string} paperId - 论文ID
 * @returns {Promise} - 返回Promise对象，包含完整的分析结果
 */
export const getPaperAnalysisResult = (paperId) => {
  return http.get(`/paper/analysis/${paperId}`);
};

/**
 * 提取文章要点
 * @param {string} fileId - 文件ID
 * @returns {Promise} - 返回Promise对象
 */
export const extractKeypoints = (fileId) => {
  return http.post(`/paper/keypoints`, { fileId });
};

/**
 * 分析研究方向
 * @param {string} fileId - 文件ID
 * @param {Array} keypoints - 关键点数组（可选）
 * @returns {Promise} - 返回Promise对象
 */
export const analyzeDirection = (fileId, keypoints = []) => {
  return http.post(`/paper/directions`, { 
    fileId,
    keypoints
  });
};

/**
 * 分析论文思路
 * @param {string} fileId - 文件ID
 * @returns {Promise} - 返回Promise对象
 */
export const analyzeThinking = (fileId) => {
  return http.post(`/paper/thinking`, { fileId });
};

/**
 * 生成研究模型
 * @param {string} fileId - 文件ID
 * @param {string} directionId - 研究方向ID
 * @returns {Promise} - 返回Promise对象
 */
export const generateModel = (fileId, directionId) => {
  return http.post(`/paper/model/generate`, {
    fileId,
    directionId
  });
};

/**
 * 生成论文大纲
 * @param {string} modelId - 模型ID
 * @param {Object} options - 选项对象
 * @returns {Promise} - 返回Promise对象
 */
export const generateOutline = (modelId, options = {}) => {
  return http.post(`/paper/outline/generate`, {
    modelId,
    ...options
  });
};

/**
 * 根据大纲生成完整论文
 * @param {string} outlineId - 大纲ID
 * @param {Object} options - 选项对象
 * @returns {Promise} - 返回Promise对象
 */
export const generateFullPaper = (outlineId, options = {}) => {
  return http.post(`/paper/generate`, {
    outlineId,
    ...options
  });
};

/**
 * AI文本补全
 * @param {string} prompt - 提示文本
 * @param {Object} options - 选项
 * @param {Object} [options.inputs] - 上下文参数
 * @param {boolean} [options.streamResponse] - 是否流式响应
 * @param {string} [options.userId] - 用户标识
 * @returns {Promise} - 返回Promise对象
 */
export const difyTextCompletion = (prompt, options = {}) => {
  return http.post(`/ai/completion`, {
    prompt,
    options
  });
};

/**
 * uploadFile 函数 - 作为 uploadPaper 的别名，保持向后兼容性
 * @param {File} file - 论文文件（PDF格式）
 * @returns {Promise} - 返回Promise对象
 */
export const uploadFile = uploadPaper;

/**
 * 获取论文分析历史记录（别名，实际调用getPaperList）
 * @param {number} page - 页码（可选，默认1）
 * @param {number} size - 每页条数（可选，默认10）
 * @param {string} status - 分析状态（可选，默认completed）
 * @returns {Promise} - 返回Promise对象，包含历史记录列表
 */
export const getPaperAnalysisHistory = (page = 1, size = 10, status = 'completed') => {
  return getPaperList(page, size, status);
};

/**
 * 完整论文分析（一体化分析）- 为保持向后兼容，实际上只是uploadPaper的别名
 * @param {string} fileId - 文件ID
 * @returns {Promise} - 返回Promise对象，包含所有分析结果（文章要点、文章思路、研究方向、文章模型图）
 */
export const analyzeFullPaper = (fileId) => {
  // 由于后端直接在上传时开始分析，这个函数实际上已不需要
  console.warn('analyzeFullPaper 已废弃，上传文件后服务器会自动开始分析');
  return Promise.resolve({ 
    code: 200,
    message: '分析已在上传时自动开始',
    data: { paperId: fileId }
  });
}; 