const app = getApp();
const ReaderComm = require('../../utils/readerComm');

Page({
  data: {
    readerIP: '192.168.3.250',
    readerPort: 60000,
    readerConnected: false,
    reading: false,
    currentTagId: '',
    cardInfo: null,
    cardHistory: [],
    filteredHistory: [],
    searchText: '',
    userName: '',
    tempUserName: ''
  },

  bindIPInput(e) {
    this.setData({ readerIP: e.detail.value.trim() });
  },
  bindPortInput(e) {
    const port = parseInt(e.detail.value);
    this.setData({ readerPort: port && port > 0 ? port : 60000 });
  },

  handleConnect() {
    if (this.data.readerConnected) {
      wx.showLoading({ title: '断开连接中...', mask: true });
      this.readerComm.disconnect();
    } else {
      this.readerComm.setConfig({ ip: this.data.readerIP, port: this.data.readerPort });
      wx.showLoading({ title: '连接中...', mask: true });
      this.readerComm.connect();
    }
  },

  onLoad() {
    this.readerComm = new ReaderComm({ simulation: true });
    this.readerComm.setConfig({ ip: this.data.readerIP, port: this.data.readerPort });

    this.readerComm.on({
      onConnect: () => {
        wx.hideLoading();
        this.setData({ readerConnected: true });
        wx.showToast({ title: '读卡器连接成功' });
      },
      onDisconnect: () => {
        wx.hideLoading();
        this.setData({ readerConnected: false, reading: false });
        wx.showToast({ title: '读卡器已断开', icon: 'none' });
      },
      onDataReceived: (data) => {
        if (data.type === 'tag') {
          const time = new Date().toLocaleString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).replace(/月|日/g, m => m === '月' ? '月' : '日 ');
          // 解析动作并处理默认值
          const resolvedAction = data.action || ['拿起了', '放置了', '整理了', '移动了', '取出了', '放回了'][Math.floor(Math.random() * 6)];
          // 根据动作类型选择合适的介词
          // 根据不同动作类型选择最合适的介词
          let preposition;
          if (resolvedAction.includes('拿起') || resolvedAction.includes('取出')) {
            preposition = '从';
          } else if (resolvedAction.includes('放置') || resolvedAction.includes('放回') || resolvedAction.includes('移动')) {
            preposition = '到';
          } else {
            preposition = '在';
          }
          const newData = {
            ...data,
            time: time,
            description: `${this.data.userName}在${time}${preposition === '从' ? `${preposition}${data.location}${resolvedAction}` : `将${data.item}${resolvedAction}${preposition}`}${preposition === '从' ? data.item : data.location} (位于${data.locationDetail})`
          };
          this.setData({
            currentTagId: data.tagId,
            cardInfo: newData
          });
          this.saveCardHistory(newData);
        }
      },
      onError: (err) => {
        wx.hideLoading();
        const errorMsg = err?.message || '连接失败，请检查IP和端口是否正确';
        wx.showToast({ title: '读卡器错误: ' + errorMsg, icon: 'none' });
      }
    });

    const userName = wx.getStorageSync('userName') || '小明';
    this.setData({ userName, tempUserName: userName });
    let history = wx.getStorageSync('cardHistory') || [];
    history = history.map(item => ({
      ...item,
      description: (item.description || '').replace(/盲童/g, userName)
    }));

    history.sort((a, b) => this.parseTime(b.time) - this.parseTime(a.time));

    if (history.length === 0) {
      this.generateDemoData(userName).forEach(item => history.unshift(item));
      wx.setStorageSync('cardHistory', history);
    }

    this.setData({
      cardHistory: history,
      filteredHistory: history
    });
  },

  parseTime(timeStr) {
    return new Date(timeStr.replace(/年|月/g, '/').replace(/日/, ''));
  },

  generateDemoData(userName) {
    const demoItems = [
      '语文课本', '数学练习册', '英语听力材料', '盲文故事书', '科学实验手册',
      '历史地图册', '音乐乐谱', '美术素描本', '地理图鉴', '生物标本集',
      '物理公式手册', '化学元素卡片', '成语词典', '唐诗三百首', '计算机基础',
      '英语口语指南', '盲文打字教程', '触觉图形卡片', '世界历史年表', '儿童故事绘本'
    ];
    const demoLocations = [
      '书桌左上角', '书架第二层', '床头柜上', '书包前袋', '教室第三排抽屉',
      '窗台上', '钢琴上', '储物柜中层', '课桌右上角', '卧室书架',
      '客厅茶几', '书房角落', '学校储物柜', '图书馆借阅台', '家庭活动室',
      '实验室操作台', '音乐教室架子', '电脑桌旁', '走廊储物柜', '食堂餐桌'
    ];
    const demoActions = ['放到了', '拿起了', '阅读了', '整理了', '识别了', '放回了', '取出了', '浏览了', '分类了', '标记了', '放置在', '取走了', '查阅了', '收拾了', '存放了', '操作了', '播放了', '打字了', '触摸了', '欣赏了'];
    const now = new Date();

    const formatDemoTime = (time) => {
      const year = time.getFullYear();
      const month = time.getMonth() + 1;
      const day = time.getDate();
      const hour = time.getHours().toString().padStart(2, '0');
      const minute = time.getMinutes().toString().padStart(2, '0');
      return `${year}年${month}月${day}日 ${hour}:${minute}`;
    };

    const directions = ['东', '南', '西', '北', '东南', '东北', '西南', '西北'];
    const result = [];

    for (let i = 0; i < 30; i++) {
      const randomHours = Math.floor(Math.random() * 168);
      const randomMinutes = Math.floor(Math.random() * 60);
      const demoTime = new Date(now);
      demoTime.setHours(demoTime.getHours() - randomHours);
      demoTime.setMinutes(randomMinutes);
      demoTime.setSeconds(0);

      const item = demoItems[Math.floor(Math.random() * demoItems.length)];
      const location = demoLocations[Math.floor(Math.random() * demoLocations.length)];
      const action = demoActions[Math.floor(Math.random() * demoActions.length)];

      let referenceLocation;
      do {
        referenceLocation = demoLocations[Math.floor(Math.random() * demoLocations.length)];
      } while (referenceLocation === location);

      const direction = directions[Math.floor(Math.random() * directions.length)];
      const distance = Math.floor(Math.random() * 20) + 1;
      const spatialDesc = `（位于${referenceLocation}${direction}方向${distance}米处）`;

      let description;
      if (['放到了', '放回了', '放置在'].includes(action)) {
        description = `${userName}在${formatDemoTime(demoTime)}将${item}${action}${location}${spatialDesc}`;
      } else if (['拿起了', '取出了', '取走了'].includes(action)) {
        description = `${userName}在${formatDemoTime(demoTime)}从${location}${action}${item}${spatialDesc}`;
      } else {
        description = `${userName}在${formatDemoTime(demoTime)}${action}${location}的${item}${spatialDesc}`;
      }

      result.push({
        id: `DEMO-${i+1}`,
        time: formatDemoTime(demoTime),
        item: item,
        location: location,
        action: action,
        description: description
      });
    }

    return result;
  },

  readCard() {
    if (!this.data.readerConnected) {
      wx.showToast({ title: '请先连接读卡器', icon: 'none' });
      return;
    }
    wx.showLoading({ title: '模拟读取中...' });
    this.readerComm.startReading();
    // 模拟读取延迟后隐藏加载提示
    setTimeout(() => {
      wx.hideLoading();
    }, 800);
  },

  saveCardHistory(cardData) {
    const newHistory = [cardData, ...this.data.cardHistory];
    newHistory.sort((a, b) => this.parseTime(b.time) - this.parseTime(a.time));

    this.setData({
      cardHistory: newHistory,
      filteredHistory: newHistory
    });

    wx.setStorageSync('cardHistory', newHistory);
    app.globalData.cardHistory = newHistory;
  },

  clearHistory() {
    wx.showModal({
      title: '确认',
      content: '确定要清除所有历史记录吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            cardHistory: [],
            filteredHistory: []
          });
          wx.setStorageSync('cardHistory', []);
          app.globalData.cardHistory = [];
          wx.showToast({ title: '已清除' });
        }
      }
    });
  },

  onTempNameInput(e) {
    this.setData({ tempUserName: e.detail.value });
  },

  confirmUserName() {
    const userName = this.data.tempUserName.trim();
    if (!userName) {
      wx.showToast({ title: '姓名不能为空', icon: 'none' });
      return;
    }

    let history = wx.getStorageSync('cardHistory') || [];
    history = history.map(item => ({
      ...item,
      description: item.description.replace(/盲童/g, userName)
    }));

    wx.setStorageSync('cardHistory', history);
    const newHistory = [...history];

    this.setData({
      userName,
      cardHistory: newHistory,
      filteredHistory: newHistory
    }, () => {
      this.filterHistory();
      wx.showToast({ title: '姓名已更新' });
    });
  },

  onSearchInput(e) {
    this.setData({ searchText: e.detail.value });
  },

  searchRecords() {
    const { searchText, cardHistory } = this.data;
    if (!searchText.trim()) {
      this.setData({ filteredHistory: cardHistory });
      return;
    }

    const keyword = searchText.toLowerCase();
    const results = cardHistory.filter(item =>
      item.description.toLowerCase().includes(keyword) ||
      item.item.toLowerCase().includes(keyword) ||
      item.location.toLowerCase().includes(keyword)
    );

    this.setData({ filteredHistory: results });
  },

  playVoice(e) {
    const description = e.currentTarget.dataset.description;
    if (!description) return;

    const appBaseInfo = wx.getAppBaseInfo();
    const sdkVersion = appBaseInfo.SDKVersion;

    const versionCompare = (v1, v2) => {
      const a = v1.split('.').map(Number);
      const b = v2.split('.').map(Number);
      for (let i = 0; i < Math.max(a.length, b.length); i++) {
        const num1 = a[i] || 0;
        const num2 = b[i] || 0;
        if (num1 > num2) return 1;
        if (num1 < num2) return -1;
      }
      return 0;
    };

    if (versionCompare(sdkVersion, '2.10.0') < 0) {
      wx.showToast({ title: '基础库版本过低，请更新微信', icon: 'error' });
      console.error('基础库版本过低，当前版本:', sdkVersion);
      return;
    }

    if (!wx.canIUse('speechSynthesis.speak')) {
      wx.showToast({ title: '当前微信版本不支持语音播放', icon: 'error' });
      console.error('微信版本不支持 speechSynthesis.speak API');
      return;
    }

    if (typeof wx.speechSynthesis === 'undefined') {
      wx.showToast({ title: '当前环境不支持语音播放', icon: 'error' });
      console.error('语音合成API不可用');
      return;
    }

    this.startVoicePlayback(description);
  },

  startVoicePlayback(description) {
    wx.speechSynthesis.stop(); // 只调用一次

    wx.speechSynthesis.speak({
      text: description,
      lang: 'zh_CN',
      success: () => {
        wx.showToast({ title: '正在播放语音', icon: 'none' });
        console.log('语音播放成功:', description);
      },
      fail: (err) => {
        let errorMsg = '语音播放失败';
        if (err.errMsg.includes('version too low')) {
          errorMsg = '微信版本过低，请更新';
        } else if (err.errMsg.includes('system permission denied')) {
          errorMsg = '系统权限被拒绝，请检查设置';
        } else if (err.errMsg.includes('not supported')) {
          errorMsg = '当前设备不支持语音播放';
        }
        wx.showToast({ title: errorMsg, icon: 'error' });
        console.error('语音播放错误:', err.errMsg, '错误代码:', err.errCode);
      },
      complete: (res) => {
        console.log('语音播放完成回调:', res);
      }
    });
  },

  startReading() {
    this.readerComm.startReading();
    this.setData({ reading: true });
  },

  stopReading() {
    this.readerComm.stopReading();
    this.setData({ reading: false });
  },

  onUnload() {
    if (this.readerComm) {
      this.readerComm.disconnect();
    }
  }
});