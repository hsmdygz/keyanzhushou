<template>
  <view class="analysis-page">
    <ChatLayout
      ref="chatLayout"
      appTitle="科研助手"
      :functionItems="functionItems"
      :activeFunctionIndex="activeFunctionIndex"
      @function-selected="handleFunctionSelected"
      @send-message="handleSendMessage"
      @settings-click="handleSettingsClick"
      :showInputBar="false"
    >
      <template #header-actions>
        <button class="action-button" @click="navigateToHistory" title="历史记录">
          <text class="action-icon">📋</text>
        </button>
      </template>
      
      <div class="analysis-container">
        <div class="upload-section" v-if="!isAnalyzing && !analysisResult">
          <div class="card main-card">
            <div class="card-title">论文分析助手</div>
            
            <div class="card-content">
              <div class="upload-area">
                <div class="upload-icon">📄</div>
                <div class="upload-title">上传论文</div>
                <div class="upload-desc">选择PDF格式的论文进行智能分析</div>
                
                <div class="upload-actions">
                  <button class="primary-button" @click="selectFile">
                    选择文件
                  </button>
                </div>
                
                <div 
                  class="drop-zone"
                  @dragover.prevent="handleDragOver"
                  @drop.prevent="handleDrop"
                >
                  <div class="drop-icon">📥</div>
                  <div class="drop-text">拖放文件到此处</div>
                </div>
              </div>
              
              <div class="file-info" v-if="selectedFile">
                <div class="file-icon">📄</div>
                <div class="file-details">
                  <div class="file-name">{{ selectedFile.name }}</div>
                  <div class="file-size">{{ formatFileSize(selectedFile.size) }}</div>
                </div>
                <button class="remove-button" @click="clearSelectedFile">
                  ✕
                </button>
              </div>
            </div>
            
            <div class="features-grid">
              <div class="feature-item">
                <div class="feature-icon">📌</div>
                <div class="feature-text">提取文章要点</div>
              </div>
              <div class="feature-item">
                <div class="feature-icon">🔄</div>
                <div class="feature-text">整理文章思路</div>
              </div>
              <div class="feature-item">
                <div class="feature-icon">🧭</div>
                <div class="feature-text">分析研究方向</div>
              </div>
              <div class="feature-item">
                <div class="feature-icon">🔍</div>
                <div class="feature-text">生成文章模型图</div>
              </div>
            </div>
            
            <div class="action-section">
              <button 
                class="analyze-button" 
                @click="startAnalysis" 
                :disabled="!selectedFile || isAnalyzing"
              >
                开始分析
              </button>
            </div>
          </div>
        </div>
        
        <div class="analyzing-state" v-if="isAnalyzing">
          <div class="card">
            <div class="analyzing-content">
              <div class="spinner"></div>
              <div class="analyzing-title">正在分析论文</div>
              <div class="analyzing-desc">这可能需要几分钟时间，请耐心等待</div>
              
              <div class="progress-bar">
                <div class="progress-fill" :style="{width: `${analysisProgress}%`}"></div>
              </div>
              <div class="progress-text">{{ analysisProgress }}%</div>
              
              <div class="current-task">{{ currentTask }}</div>
            </div>
          </div>
        </div>
        
        <div class="result-section" v-if="analysisResult">
          <div class="card result-card">
            <div class="card-header">
              <div class="result-title">分析结果: {{ analysisResult.fileName }}</div>
              <div class="result-actions">
                <button class="action-btn" @click="exportResults">
                  <text class="btn-icon">💾</text> 导出
                </button>
                <button class="action-btn" @click="resetAnalysis">
                  <text class="btn-icon">🔄</text> 重新分析
                </button>
              </div>
            </div>
            
            <div class="tabs">
              <div 
                v-for="(tab, index) in resultTabs" 
                :key="index"
                class="tab"
                :class="{ active: activeTabIndex === index }"
                @click="activeTabIndex = index"
              >
                {{ tab.name }}
              </div>
            </div>
            
            <div class="tab-content">
              <!-- 要点摘要 -->
              <div v-if="activeTabIndex === 0" class="tab-pane">
                <div class="summary-section">
                  <div class="section-title">
                    <span class="section-icon">📌</span>
                    文章要点
                  </div>
                  
                  <div class="point-item">
                    <div class="point-header">研究目的</div>
                    <div class="point-content">{{ analysisResult.purpose }}</div>
                  </div>
                  
                  <div class="point-item">
                    <div class="point-header">研究方法</div>
                    <div class="point-content">{{ analysisResult.methodology }}</div>
                  </div>
                  
                  <div class="point-item">
                    <div class="point-header">主要发现</div>
                    <div class="point-content">{{ analysisResult.findings }}</div>
                  </div>
                  
                  <div class="point-item">
                    <div class="point-header">结论</div>
                    <div class="point-content">{{ analysisResult.conclusion }}</div>
                  </div>
                </div>
              </div>
              
              <!-- 文章思路 -->
              <div v-if="activeTabIndex === 1" class="tab-pane">
                <div class="structure-section">
                  <div class="section-title">
                    <span class="section-icon">🔄</span>
                    文章思路
                  </div>
                  
                  <div class="structure-tree">
                    <div 
                      v-for="(section, index) in analysisResult.structure" 
                      :key="index"
                      class="structure-item"
                      :class="`level-${section.level}`"
                    >
                      <div class="structure-line" v-if="section.level > 0"></div>
                      <div class="structure-content">
                        <div class="structure-title">{{ section.title }}</div>
                        <div class="structure-page">P{{ section.page }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- 研究方向 -->
              <div v-if="activeTabIndex === 2" class="tab-pane">
                <div class="research-section">
                  <div class="section-title">
                    <span class="section-icon">🧭</span>
                    研究方向
                  </div>
                  
                  <div class="research-summary">
                    {{ analysisResult.summary }}
                  </div>
                  
                  <div class="keywords-container">
                    <div class="keywords-group">
                      <div class="group-title">主题关键词</div>
                      <div class="keywords-list">
                        <div 
                          v-for="(keyword, index) in analysisResult.keywords.topics" 
                          :key="index"
                          class="keyword-tag"
                        >
                          {{ keyword }}
                        </div>
                      </div>
                    </div>
                    
                    <div class="keywords-group">
                      <div class="group-title">方法关键词</div>
                      <div class="keywords-list">
                        <div 
                          v-for="(keyword, index) in analysisResult.keywords.methods" 
                          :key="index"
                          class="keyword-tag"
                        >
                          {{ keyword }}
                        </div>
                      </div>
                    </div>
                    
                    <div class="related-work">
                      <div class="group-title">相关文献</div>
                      <div class="reference-list">
                        <div 
                          v-for="(reference, index) in analysisResult.references" 
                          :key="index"
                          class="reference-item"
                        >
                          <div class="reference-number">{{ index + 1 }}</div>
                          <div class="reference-text">{{ reference }}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- 文章模型图 -->
              <div v-if="activeTabIndex === 3" class="tab-pane">
                <div class="model-section">
                  <div class="section-title">
                    <span class="section-icon">🔍</span>
                    文章模型图
                  </div>
                  
                  <div class="model-visualization">
                    <div class="model-center">{{ analysisResult.fileName }}</div>
                    <div class="model-branches">
                      <div class="model-branch">
                        <div class="branch-line"></div>
                        <div class="branch-node purpose">研究目的</div>
                        <div class="branch-text">{{ formatShortText(analysisResult.purpose) }}</div>
                      </div>
                      <div class="model-branch">
                        <div class="branch-line"></div>
                        <div class="branch-node method">研究方法</div>
                        <div class="branch-text">{{ formatShortText(analysisResult.methodology) }}</div>
                      </div>
                      <div class="model-branch">
                        <div class="branch-line"></div>
                        <div class="branch-node findings">主要发现</div>
                        <div class="branch-text">{{ formatShortText(analysisResult.findings) }}</div>
                      </div>
                      <div class="model-branch">
                        <div class="branch-line"></div>
                        <div class="branch-node conclusion">结论</div>
                        <div class="branch-text">{{ formatShortText(analysisResult.conclusion) }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ChatLayout>
  </view>
</template>

<script>
import ChatLayout from '@/components/ChatLayout.vue';

export default {
  components: {
    ChatLayout
  },
  data() {
    return {
      functionItems: [
        { name: '首页', icon: '🏠' },
        { name: '论文分析助手', icon: '📊', starred: true },
        { name: '文本翻译助手', icon: '🌐' },
        { name: '科研问答助手', icon: '🔍' }
      ],
      activeFunctionIndex: 1, // 论文分析助手激活
      selectedFile: null,
      isAnalyzing: false,
      analysisProgress: 0,
      currentTask: '解析文档...',
      analysisResult: null,
      activeTabIndex: 0,
      resultTabs: [
        { name: '文章要点', icon: '📌' },
        { name: '文章思路', icon: '🔄' },
        { name: '研究方向', icon: '🧭' },
        { name: '文章模型图', icon: '🔍' }
      ]
    };
  },
  methods: {
    handleFunctionSelected(index) {
      this.activeFunctionIndex = index;
      
      // 导航到相应页面
      if (this.functionItems[index]) {
        const functionName = this.functionItems[index].name;
        
        if (functionName === '首页') {
          uni.navigateTo({ url: '/pages/home/home' });
        } else if (functionName === '文本翻译助手') {
          uni.navigateTo({ url: '/pages/translate/translate' });
        } else if (functionName === '科研问答助手') {
          uni.redirectTo({ url: '/pages/qa/qa' });
        }
      }
    },
    handleSendMessage(message) {
      // 在论文分析页面不需要处理消息
    },
    selectFile() {
      uni.chooseFile({
        count: 1,
        type: 'file',
        extension: ['.pdf'],
        success: (res) => {
          this.selectedFile = {
            path: res.tempFilePaths[0],
            name: res.tempFiles[0].name,
            size: res.tempFiles[0].size
          };
        },
        fail: (err) => {
          console.error('选择文件失败:', err);
        }
      });
    },
    clearSelectedFile() {
      this.selectedFile = null;
    },
    formatFileSize(bytes) {
      if (bytes === 0) return '0 B';
      
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    handleDragOver(event) {
      event.target.classList.add('dragover');
    },
    handleDrop(event) {
      event.target.classList.remove('dragover');
      
      const files = event.dataTransfer.files;
      if (files.length > 0) {
        const file = files[0];
        if (file.name.toLowerCase().endsWith('.pdf')) {
          this.selectedFile = {
            file: file,
            name: file.name,
            size: file.size
          };
        } else {
          uni.showToast({
            title: '请选择PDF文件',
            icon: 'none'
          });
        }
      }
    },
    startAnalysis() {
      if (!this.selectedFile) return;
      
      this.isAnalyzing = true;
      this.analysisProgress = 0;
      
      // 模拟分析进度
      const progressInterval = setInterval(() => {
        if (this.analysisProgress < 95) {
          this.analysisProgress += Math.floor(Math.random() * 5) + 1;
          
          if (this.analysisProgress < 20) {
            this.currentTask = '解析文档...';
          } else if (this.analysisProgress < 40) {
            this.currentTask = '提取文章要点...';
          } else if (this.analysisProgress < 60) {
            this.currentTask = '整理文章思路...';
          } else if (this.analysisProgress < 80) {
            this.currentTask = '分析研究方向...';
          } else {
            this.currentTask = '生成文章模型图...';
          }
        }
      }, 300);
      
      // 模拟分析完成
      setTimeout(() => {
        clearInterval(progressInterval);
        this.analysisProgress = 100;
        this.isAnalyzing = false;
        this.analysisResult = this.generateMockResult();
      }, 5000);
      
      // 真实API调用示例
      // try {
      //   const formData = new FormData();
      //   formData.append('file', this.selectedFile.file);
      //   
      //   const response = await analyzePaper(formData);
      //   this.analysisResult = response.data;
      // } catch (error) {
      //   uni.showToast({
      //     title: '分析失败',
      //     icon: 'none'
      //   });
      //   console.error('分析失败:', error);
      // } finally {
      //   clearInterval(progressInterval);
      //   this.isAnalyzing = false;
      // }
    },
    generateMockResult() {
      return {
        fileName: this.selectedFile.name,
        summary: '本论文探讨了人工智能在医疗诊断中的应用，通过深度学习模型实现了比传统方法更高的准确率。研究证明，结合医学专家知识的AI系统能够有效辅助医生进行诊断决策，降低误诊率。',
        purpose: '本研究旨在开发一种基于深度学习的医学图像诊断系统，提高罕见疾病的诊断准确率，并验证其在临床环境中的实用性。',
        methodology: '研究采用卷积神经网络(CNN)和迁移学习方法，使用超过5万张带标注的医学图像进行训练。通过与多家医院合作，收集了不同设备拍摄的真实医学图像，并由专家团队进行标注。',
        findings: '实验表明，所提出的模型在测试集上达到了92.8%的准确率，比传统的计算机辅助诊断方法高出15.3个百分点。在罕见疾病诊断方面，模型表现尤为突出，敏感性达到88.5%。',
        conclusion: '研究证明了深度学习技术在医疗诊断领域的巨大潜力，特别是在罕见疾病诊断方面。未来工作将进一步探索模型的可解释性，以及在更多临床场景中的应用。',
        structure: [
          { title: '引言', level: 0, page: 1 },
          { title: '研究背景', level: 1, page: 1 },
          { title: '研究目标', level: 1, page: 2 },
          { title: '相关工作', level: 0, page: 3 },
          { title: '医学图像诊断', level: 1, page: 3 },
          { title: '深度学习在医疗领域的应用', level: 1, page: 4 },
          { title: '方法', level: 0, page: 6 },
          { title: '数据收集与处理', level: 1, page: 6 },
          { title: '深度学习模型设计', level: 1, page: 8 },
          { title: '训练与优化策略', level: 1, page: 10 },
          { title: '实验结果', level: 0, page: 12 },
          { title: '诊断准确率', level: 1, page: 12 },
          { title: '与传统方法比较', level: 1, page: 14 },
          { title: '临床验证', level: 1, page: 15 },
          { title: '讨论', level: 0, page: 17 },
          { title: '模型优势与局限性', level: 1, page: 17 },
          { title: '临床应用前景', level: 1, page: 19 },
          { title: '结论', level: 0, page: 21 },
          { title: '参考文献', level: 0, page: 22 }
        ],
        keywords: {
          topics: ['医学图像分析', '深度学习', '疾病诊断', '人工智能辅助医疗', '卷积神经网络', '罕见疾病'],
          methods: ['迁移学习', '卷积神经网络', '监督学习', '交叉验证', '多中心研究', '临床验证']
        },
        references: [
          'Smith, J., & Johnson, A. (2020). Deep learning approaches for medical image analysis. Journal of Medical Imaging, 45(3), 112-128.',
          'Chen, X., Wang, Y., & Li, Z. (2019). A survey on deep learning in medical image diagnosis. IEEE Transactions on Medical Imaging, 38(6), 1289-1302.',
          'Wilson, M., & Davis, R. (2021). Transfer learning for rare disease identification. Medical Image Analysis, 67, 101845.',
          'Brown, K., et al. (2018). Clinical validation of AI-assisted diagnostic systems. Nature Medicine, 24(9), 1559-1567.',
          'Garcia, L., & Martinez, S. (2022). Explainable AI in healthcare: challenges and opportunities. Artificial Intelligence in Medicine, 124, 102158.'
        ]
      };
    },
    resetAnalysis() {
      this.analysisResult = null;
      this.selectedFile = null;
      this.activeTabIndex = 0;
    },
    exportResults() {
      uni.showToast({
        title: '结果已导出',
        icon: 'success'
      });
    },
    navigateToHistory() {
      uni.navigateTo({
        url: '/pages/paper/history'
      });
    },
    handleSettingsClick() {
      uni.navigateTo({
        url: '/pages/account/account'
      });
    },
    formatShortText(text) {
      return text.length > 50 ? text.substring(0, 50) + '...' : text;
    }
  }
}
</script>

<style lang="scss" scoped>
.analysis-page {
  height: 100vh;
  width: 100%;
}

.analysis-container {
  padding: 16px;
  height: 100%;
  overflow-y: auto;
  max-width: 900px;
  margin: 0 auto;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card {
  background-color: #2a2a2a;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.main-card {
  margin-bottom: 0;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #e0e0e0;
  border-bottom: 1px solid #3c3c3c;
  padding-bottom: 10px;
}

.upload-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  text-align: center;
}

.upload-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.upload-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #e0e0e0;
}

.upload-desc {
  color: #a0a0a0;
  font-size: 14px;
  margin-bottom: 24px;
}

.upload-actions {
  margin-bottom: 20px;
}

.primary-button {
  background-color: #0e639c;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 20px;
  font-size: 15px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.primary-button:hover {
  background-color: #1177bb;
}

.drop-zone {
  border: 2px dashed #444;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  color: #888;
  margin-top: 16px;
  width: 100%;
  transition: all 0.2s;
}

.drop-zone:hover {
  border-color: #0e639c;
  background-color: rgba(14, 99, 156, 0.05);
}

.drop-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.drop-text {
  font-size: 14px;
}

.file-info {
  display: flex;
  align-items: center;
  background-color: #333;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 20px;
  width: 100%;
}

.file-icon {
  font-size: 24px;
  margin-right: 12px;
}

.file-details {
  flex: 1;
  overflow: hidden;
}

.file-name {
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-size {
  font-size: 12px;
  color: #888;
}

.remove-button {
  background: none;
  border: none;
  color: #888;
  font-size: 16px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
}

.remove-button:hover {
  background-color: #444;
  color: #e0e0e0;
}

.features-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin: 20px 0;
}

.feature-item {
  flex: 1;
  min-width: calc(50% - 6px);
  background-color: #333;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.feature-icon {
  font-size: 20px;
  color: #0e639c;
}

.feature-text {
  font-size: 14px;
  color: #e0e0e0;
}

.action-section {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.analyze-button {
  background-color: #0e639c;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.analyze-button:hover {
  background-color: #1177bb;
}

.analyze-button:disabled {
  background-color: #333;
  color: #777;
  cursor: not-allowed;
}

.analyzing-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px;
  text-align: center;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 4px solid #0e639c;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.analyzing-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 8px;
}

.analyzing-desc {
  color: #a0a0a0;
  font-size: 14px;
  margin-bottom: 24px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background-color: #333;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background-color: #0e639c;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 14px;
  color: #a0a0a0;
  margin-bottom: 16px;
}

.current-task {
  font-size: 16px;
  color: #e0e0e0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #3c3c3c;
  padding-bottom: 10px;
}

.result-title {
  font-size: 18px;
  font-weight: 600;
  color: #e0e0e0;
}

.result-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  background-color: #333;
  border: none;
  color: #e0e0e0;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.action-btn:hover {
  background-color: #444;
}

.btn-icon {
  font-size: 14px;
}

.tabs {
  display: flex;
  border-bottom: 1px solid #3c3c3c;
  margin-bottom: 20px;
}

.tab {
  padding: 10px 16px;
  cursor: pointer;
  font-size: 14px;
  color: #a0a0a0;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.tab:hover {
  color: #e0e0e0;
}

.tab.active {
  color: #0e639c;
  border-bottom-color: #0e639c;
}

.tab-pane {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #e0e0e0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-icon {
  font-size: 18px;
}

.point-item {
  background-color: #333;
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 16px;
}

.point-header {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 8px;
  color: #0e639c;
}

.point-content {
  font-size: 14px;
  line-height: 1.6;
  color: #e0e0e0;
}

.structure-tree {
  padding-left: 8px;
}

.structure-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 12px;
  position: relative;
}

.structure-line {
  width: 2px;
  background-color: #444;
  position: absolute;
  top: 0;
  bottom: 0;
  left: -12px;
}

.structure-content {
  display: flex;
  justify-content: space-between;
  width: 100%;
  background-color: #333;
  border-radius: 6px;
  padding: 10px 16px;
}

.structure-title {
  font-size: 14px;
  color: #e0e0e0;
}

.structure-page {
  font-size: 12px;
  color: #888;
}

.level-0 .structure-title {
  font-weight: 600;
  color: #0e639c;
}

.level-1 {
  padding-left: 24px;
}

.level-2 {
  padding-left: 48px;
}

.research-summary {
  background-color: #333;
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 20px;
  font-size: 14px;
  line-height: 1.6;
  color: #e0e0e0;
}

.keywords-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.keywords-group {
  margin-bottom: 16px;
}

.group-title {
  font-size: 16px;
  margin-bottom: 12px;
  color: #0e639c;
}

.keywords-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.keyword-tag {
  background-color: #333;
  color: #e0e0e0;
  font-size: 13px;
  padding: 6px 12px;
  border-radius: 20px;
}

.reference-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.reference-item {
  display: flex;
  gap: 12px;
  background-color: #333;
  border-radius: 6px;
  padding: 10px 16px;
}

.reference-number {
  font-size: 14px;
  font-weight: 600;
  color: #0e639c;
  min-width: 20px;
}

.reference-text {
  font-size: 13px;
  color: #e0e0e0;
  line-height: 1.5;
}

.model-visualization {
  background-color: #333;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
}

.model-center {
  background-color: #0e639c;
  color: white;
  font-size: 16px;
  font-weight: 500;
  padding: 16px 24px;
  border-radius: 8px;
  max-width: 300px;
  text-align: center;
}

.model-branches {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  justify-content: space-around;
  width: 100%;
}

.model-branch {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: calc(50% - 12px);
  position: relative;
}

.branch-line {
  width: 2px;
  height: 40px;
  background-color: #444;
}

.branch-node {
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  color: white;
  margin-bottom: 12px;
  text-align: center;
  min-width: 120px;
}

.branch-node.purpose {
  background-color: #2c8073;
}

.branch-node.method {
  background-color: #8f4e7e;
}

.branch-node.findings {
  background-color: #7e673b;
}

.branch-node.conclusion {
  background-color: #4b6584;
}

.branch-text {
  font-size: 13px;
  color: #e0e0e0;
  text-align: center;
  max-width: 200px;
  line-height: 1.5;
}

/* 响应式设计 */
@media screen and (max-width: 768px) {
  .analysis-container {
    padding: 12px;
  }
  
  .upload-area {
    padding: 16px;
  }
  
  .features-grid {
    flex-direction: column;
  }
  
  .feature-item {
    min-width: 100%;
  }
  
  .model-branches {
    flex-direction: column;
  }
  
  .model-branch {
    width: 100%;
  }
  
  .tabs {
    overflow-x: auto;
    white-space: nowrap;
  }
  
  .tab {
    padding: 8px 12px;
  }
}
</style> 