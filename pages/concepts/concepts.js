Page({
  data: {
    concepts: [
      {
        id: 1,
        name: '金属',
        introduction: '金属是一种具有光泽、富有延展性、容易导电、导热等性质的物质。常见的金属有铁、铜、铝等。金属摸起来硬硬的，敲击时会发出清脆的声音。',
        introductionAudio: '',
        scenes: [
          {
            id: 101,
            name: '金属棒敲击',
            audio: '',
            description: '金属棒被木槌敲击时发出的清脆、响亮的"铛铛"声，回音较长。'
          },
          {
            id: 102,
            name: '金属冶炼',
            audio: '',
            description: '高温下金属熔化的咕嘟声和锻造时的"叮叮当当"敲击声。'
          },
          {
            id: 103,
            name: '钥匙开门',
            audio: '',
            description: '金属钥匙插入锁孔的摩擦声和转动锁芯的"咔哒"声。'
          },
          {
            id: 104,
            name: '金属生锈',
            audio: '',
            description: '生锈的金属片相互摩擦时发出的沙哑、粗糙的声音。'
          },
          {
            id: 105,
            name: '金属弯曲',
            audio: '',
            description: '金属片被用力弯曲时发出的"咯吱"声和金属疲劳的细微破裂声。'
          }
        ]
      },
      {
        id: 2,
        name: '水',
        introduction: '水是一种无色无味的透明液体，是生命之源。水可以流动，有不同的形态，包括液态、固态（冰）和气态（水蒸气）。',
        introductionAudio: '',
        scenes: [
          {
            id: 201,
            name: '雨滴声',
            audio: '',
            description: '小雨滴落在玻璃窗上的"滴答滴答"声。'
          },
          {
            id: 202,
            name: '溪流声',
            audio: '',
            description: '清澈的小溪水流过鹅卵石的"潺潺"声。'
          },
          {
            id: 203,
            name: '海浪声',
            audio: '',
            description: '海浪拍打岸边沙滩的"哗哗"声和退潮时的"唰唰"声。'
          },
          {
            id: 204,
            name: '沸腾声',
            audio: '',
            description: '水壶里的水沸腾时发出的"咕嘟咕嘟"声和蒸汽喷出的"嘶嘶"声。'
          }
        ]
      },
      {
        id: 3,
        name: '木头',
        introduction: '木头是树木的主干部分，是一种天然材料。木头通常比较坚硬，有纹理，能浮在水面上，燃烧时会产生火焰和烟雾。',
        introductionAudio: '',
        scenes: [
          {
            id: 301,
            name: '木头敲击',
            audio: '',
            description: '用手敲击实木桌面发出的"咚咚"声，声音比较沉闷。'
          },
          {
            id: 302,
            name: '木头燃烧',
            audio: '',
            description: '木柴在火中燃烧的"噼啪"声和火焰燃烧的"呼呼"声。'
          },
          {
            id: 303,
            name: '锯木头',
            audio: '',
            description: '电锯锯木头时发出的"嗡嗡"声和木屑掉落的声音。'
          },
          {
            id: 304,
            name: '风吹树叶',
            audio: '',
            description: '风吹过树叶发出的"沙沙"声和树枝摇晃的轻微声响。'
          }
        ]
      },
      {
        id: 4,
        name: '玻璃',
        introduction: '玻璃是一种透明、易碎的材料，通常由沙子、石灰石和纯碱等原料制成。玻璃表面光滑，能透光，敲击时发出清脆的声音。',
        introductionAudio: '',
        scenes: [
          {
            id: 401,
            name: '玻璃杯碰撞',
            audio: '',
            description: '两个玻璃杯轻轻碰撞发出的"叮铃"声。'
          },
          {
            id: 402,
            name: '玻璃破碎',
            audio: '',
            description: '玻璃窗被打碎时发出的"哗啦"声和玻璃碎片落地的声音。'
          },
          {
            id: 403,
            name: '雨水打玻璃',
            audio: '',
            description: '大雨滴打在玻璃窗上的"啪啪"声。'
          },
          {
            id: 404,
            name: '玻璃摩擦',
            audio: '',
            description: '两块玻璃相互摩擦发出的尖锐"吱吱"声。'
          }
        ]
      },
      {
        id: 5,
        name: '布料',
        introduction: '布料是一种柔软、有弹性的材料，通常由棉、麻、丝、毛等纤维制成。布料可以用来做衣服、被子等，有不同的厚度和质感。',
        introductionAudio: '',
        scenes: [
          {
            id: 501,
            name: '丝绸摩擦',
            audio: '',
            description: '光滑的丝绸布料相互摩擦发出的轻微"沙沙"声。'
          },
          {
            id: 502,
            name: '棉布折叠',
            audio: '',
            description: '厚实的棉布被折叠时发出的"窸窣"声。'
          },
          {
            id: 503,
            name: '布料撕裂',
            audio: '',
            description: '布料被用力撕裂时发出的"刺啦"声。'
          },
          {
            id: 504,
            name: '风吹布料',
            audio: '',
            description: '旗帜或窗帘在风中飘动发出的"哗啦啦"声。'
          }
        ]
      }
    ],
    currentConcept: null,
    isPlaying: false,
    audioContext: null,
    currentAudioScene: null // 新增当前播放场景标识
  },

  onLoad: function() {
    this.setData({
      audioContext: wx.createInnerAudioContext()
    });
    // 添加音频播放完成监听
    this.data.audioContext.onEnded(() => {
      this.handleAudioEnded();
    });
    
    if (this.data.concepts.length === 0) {
      wx.showModal({
        title: '数据错误',
        content: '未加载到概念数据',
        showCancel: false
      });
      return;
    }
    
    this.setData({
      currentConcept: this.data.concepts[0]
    });
  },

  // 修改播放介绍音频方法 - 模拟播放/暂停并记录进度
  playIntroduction: function() {
    if (this.data.isPlaying) {
        this.pauseAudio();
        // 传入当前概念ID
        this.updateLearningProgress(this.data.currentConcept.id);
    } else {
        this.setData({
            isPlaying: true
        });
        // 移除模拟播放成功提示
        setTimeout(() => {
            this.pauseAudio();
            // 传入当前概念ID
            this.updateLearningProgress(this.data.currentConcept.id);
        }, 3000);
    }
},

  // 修改播放场景音频方法 - 模拟播放/暂停并记录进度
  playSceneAudio: function(e) {
    const sceneId = e.currentTarget.dataset.sceneId;
    const scene = this.data.currentConcept.scenes.find(s => s.id === sceneId);
    const isPlaying = this.data.isPlaying;
    const currentSceneId = this.data.currentAudioScene;
    const conceptId = this.data.currentConcept.id; // 获取当前概念ID

    // 如果点击同一音频且正在播放，则暂停并记录进度
    if (isPlaying && currentSceneId === sceneId) {
      this.setData({ isPlaying: false, currentAudioScene: null });
      // 记录学习进度 - 传入概念ID
      this.updateLearningProgress(conceptId);
    } else {
      // 开始模拟播放新场景音频
      this.setData({
        isPlaying: true,
        currentAudioScene: sceneId
      });
      // 删除模拟播放提示
    }
  },

  // 新增音频播放完成处理函数
  handleAudioEnded: function() {
    this.setData({ isPlaying: false });
    this.updateLearningProgress();
  },

  // 新增学习进度更新方法
  updateLearningProgress: function() {
    const conceptId = this.data.currentConcept.id;
    const now = new Date();
    const app = getApp();
    let progress = app.globalData.learningProgress.find(item => item.conceptId === conceptId);

    if (!progress) {
      // 新增学习记录
      progress = {
        conceptId,
        learnTime: 0,
        masteryLevel: 0,
        lastLearnDate: now.toISOString()
      };
      app.globalData.learningProgress.push(progress);
    }

    // 累计学习时间（假设每个场景音频平均时长为10秒）
    progress.learnTime += 10;
    // 更新掌握程度（每学习一次增加20分，最高100分）
    progress.masteryLevel = Math.min(progress.masteryLevel + 20, 100);
    progress.lastLearnDate = now.toISOString();

    // 保存到本地存储
    wx.setStorageSync('learningProgress', app.globalData.learningProgress);
    // 更新UI显示 - 添加进度条重绘
    this.drawProgressRing(conceptId);
    this.setData({
      progressUpdateTime: new Date().getTime()
    });
  },

  pauseAudio: function() {
    this.data.audioContext.pause();
    this.setData({ isPlaying: false });
  },

  switchConcept: function(e) {
    const conceptId = parseInt(e.currentTarget.dataset.conceptId);
    const concept = this.data.concepts.find(c => c.id === conceptId);

    if (!concept) {
      wx.showModal({
        title: '错误',
        content: `无法找到ID为${conceptId}的概念`,
        showCancel: false
      });
      return;
    }

    try {
      if (this.data.audioContext) {
        this.data.audioContext.stop();
      }

      this.setData({
        currentConcept: null,
        isPlaying: false,
        currentAudioScene: null
      }, () => {
        setTimeout(() => {
          this.setData({
            currentConcept: concept
          }, () => {
            this.drawProgressRing(conceptId);
            wx.showToast({
              title: `已切换到${concept.name}`,
              icon: 'success',
              duration: 1000
            });
          });
        }, 100);
      });
    } catch (err) {
      wx.showModal({
        title: '切换失败',
        content: `错误信息: ${err.message}`,
        showCancel: false
      });
    }
  },

  onUnload: function() {
    this.data.audioContext.destroy();
  },

  onShow: function() {
    this.data.concepts.forEach(concept => {
      this.drawProgressRing(concept.id);
    });
  },

  // 获取掌握程度
  getMasteryLevel: function(conceptId) {
    const app = getApp();
    // 确保learningProgress存在且为数组
    if (!Array.isArray(app.globalData.learningProgress)) {
      app.globalData.learningProgress = [];
    }
    const progress = app.globalData.learningProgress.find(item => item.conceptId === conceptId);
    // 确保返回数值类型，默认为0
    return progress && typeof progress.masteryLevel === 'number' ? progress.masteryLevel : 0;
  },

  // 绘制环形进度条
  drawProgressRing: function(conceptId) {
    const masteryLevel = this.getMasteryLevel(conceptId);
    const ctx = wx.createCanvasContext(`progress-${conceptId}`, this);
    const radius = 18; // 增大半径从15到18
    const lineWidth = 4;
    const centerX = 24; // 调整中心坐标
    const centerY = 24;
  
    // 绘制背景圆环
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.setStrokeStyle('#EEEEEE');
    ctx.setLineWidth(lineWidth);
    ctx.stroke();
  
    // 绘制进度圆环
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, -0.5 * Math.PI, (masteryLevel / 100) * 2 * Math.PI - 0.5 * Math.PI);
    ctx.setStrokeStyle('#007AFF');
    ctx.setLineWidth(lineWidth);
    ctx.setLineCap('round');
    ctx.stroke();
  
    ctx.draw();
  },
})