Page({
  data: {
    conceptStats: []
  },

  onLoad: function() {
    this.loadLearningStats();
  },

  loadLearningStats: function() {
    const app = getApp();
    const learningProgress = app.globalData.learningProgress;
    const concepts = getApp().globalData.concepts || []; // 需要在app.js中暴露concepts数据

    // 合并概念信息和学习进度
    const conceptStats = concepts.map(concept => {
      const progress = learningProgress.find(item => item.conceptId === concept.id) || {
        learnTime: 0,
        masteryLevel: 0
      };
      return {
        conceptId: concept.id,
        name: concept.name,
        learnTime: progress.learnTime,
        masteryLevel: progress.masteryLevel
      };
    });

    this.setData({ conceptStats });
    this.drawMasteryChart();
  },

  drawMasteryChart: function() {
    // 使用canvas绘制掌握程度饼图或柱状图
    const ctx = wx.createCanvasContext('masteryChart', this);
    // ... 图表绘制逻辑 ...
  }
})