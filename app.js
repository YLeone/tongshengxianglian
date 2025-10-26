App({
  onLaunch() {
    if (typeof sdg === 'undefined') {
      console.log('使用模拟SDG开发包进行演示');
      global.sdg = {
        init: function(config) {
          return new Promise((resolve) => {
            setTimeout(() => {
              console.log('SDG开发包模拟初始化成功');
              resolve();
            }, 800);
          });
        },
        readCard: function() {
          return new Promise((resolve) => {
            setTimeout(() => {
              const mockCards = [
                { cardId: 'CARD-2025-001', content: '语文课本,书桌' },
                { cardId: 'CARD-2025-002', content: '盲文练习册,书包' },
                { cardId: 'CARD-2025-003', content: '故事书,床头柜' },
                { cardId: 'CARD-2025-004', content: '笔记本,书架' }
              ];
              const randomCard = mockCards[Math.floor(Math.random() * mockCards.length)];
              resolve(randomCard);
            }, 1200);
          });
        }
      };
    }

    global.sdg.init({
      deviceType: 'reader',
      timeout: 5000
    }).then(() => {
      console.log('SDG开发包初始化成功');
    }).catch(err => {
      console.error('SDG开发包初始化失败:', err);
      wx.showToast({
        title: '读卡器初始化失败',
        icon: 'error'
      });
    });

    // 初始化学习进度数据
    const learningProgress = wx.getStorageSync('learningProgress') || [];
    this.globalData.learningProgress = learningProgress;
  },
  globalData: {
    cardHistory: [],
    learningProgress: [] // 新增学习进度数组
  }
})