// 翻译API接口
import { http } from '@/utils/request.js';
import { getToken } from '@/utils/storage.js';

// 翻译风格
export const TRANSLATION_STYLES = [
  {
    id: 'casual',
    name: '普通',
    description: '日常交流的普通翻译'
  },
  {
    id: 'academic',
    name: '学术',
    description: '适合学术论文、专业文档的正式翻译'
  }
];

/**
 * 获取支持的语言列表
 * @returns {Promise} 返回支持的语言列表
 */
export const getSupportedLanguages = () => {
  // 目前只支持中英互译和中文自译
  return Promise.resolve({
    data: {
      languages: [
        { code: 'zh', name: '中文' },
        { code: 'en', name: '英文' }
      ]
    }
  });
};

/**
 * 翻译文本
 * @param {Object} params - 翻译参数
 * @param {string} params.text - 要翻译的文本
 * @param {string} params.sourceLanguage - 源语言代码
 * @param {string} params.targetLanguage - 目标语言代码
 * @returns {Promise} 返回翻译结果，包含学术版和普通版两种翻译
 */
export const translate = (params) => {
  const { text, sourceLanguage, targetLanguage } = params;
  
  if (!text) {
    return Promise.reject({
      code: 400,
      message: '请提供文本'
    });
  }
  
  // 创建请求数据对象
  const data = {
    text: text,
    sourceLanguage: sourceLanguage,
    targetLanguage: targetLanguage
  };
  
  // 设置请求选项
  const options = {
    header: {
      'Content-Type': 'application/x-www-form-urlencoded' // 使用表单编码格式
    }
  };
  
  // 使用封装好的http模块发送请求
  return http.post('/translate', data, options);
};

/**
 * 获取翻译历史
 * @param {number} page - 页码（可选，默认1）
 * @param {number} size - 每页条数（可选，默认10）
 * @param {string} style - 翻译风格（可选，academic|casual|all，默认all）
 * @returns {Promise} 翻译历史列表
 */
export const getTranslationHistory = (page = 1, size = 10, style = 'all') => {
  return http.get('/translate/history', {
    params: { page, size, style }
  });
};

/**
 * 获取翻译详情
 * @param {string} translationId - 翻译记录ID
 * @returns {Promise} 翻译详情
 */
export const getTranslationDetail = (translationId) => {
  return http.get(`/translate/history/${translationId}`);
};

/**
 * 删除翻译记录
 * @param {string} translationId - 翻译记录ID
 * @returns {Promise} 删除结果
 */
export const deleteTranslation = (translationId) => {
  return http.delete(`/translate/delete/${translationId}`);
};

/**
 * 保存翻译历史记录
 * @param {string} originalText - 原文
 * @param {object} translatedText - 译文对象，包含academic和casual两个版本
 * @param {string} sourceLanguage - 源语言
 * @param {string} targetLanguage - 目标语言
 * @param {string} style - 翻译风格
 * @returns {Promise} 保存结果
 */
export const saveTranslationHistory = (originalText, translatedText, sourceLanguage, targetLanguage, style) => {
  // 验证语言组合是否有效
  if (!isValidLanguagePair(sourceLanguage, targetLanguage)) {
    return Promise.reject(new Error('不支持的语言组合'));
  }
  
  return http.post('/translate/history', {
    originalText,
    translatedText,
    sourceLanguage,
    targetLanguage,
    style,
    timestamp: new Date().toISOString()
  });
};

/**
 * 验证语言组合是否有效
 * @param {string} source - 源语言代码
 * @param {string} target - 目标语言代码
 * @returns {boolean} 是否是有效的语言组合
 */
function isValidLanguagePair(source, target) {
  // 只支持中英互译和中文自译
  const validPairs = [
    { source: 'zh', target: 'en' },
    { source: 'en', target: 'zh' },
    { source: 'zh', target: 'zh' }
  ];
  
  return validPairs.some(pair => 
    pair.source === source && pair.target === target
  );
}

/**
 * 全功能翻译接口 - 提供普通版和学术版翻译结果
 * @param {object} params - 翻译参数
 * @param {string} params.text - 要翻译的文本
 * @param {string} params.sourceLanguage - 源语言代码 (zh/en)
 * @param {string} params.targetLanguage - 目标语言代码 (zh/en)
 * @returns {Promise} 返回普通版和学术版翻译结果
 */
export const fullTranslate = (params) => {
  return translate(params);
}; 