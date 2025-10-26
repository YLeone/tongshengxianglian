class ReaderComm {
  constructor(options = {}) {
    this.isSimulation = options.simulation || false;
    this.simulationData = {
          tagId: 'SIM' + Math.floor(Math.random() * 1000000),
          item: ['语文课本', '数学练习册', '英语听力材料', '盲文故事书'][Math.floor(Math.random() * 4)],
          location: ['书桌', '书架', '床头柜', '书包', '音乐教室架子', '走廊储物柜', '书房角落'][Math.floor(Math.random() * 7)],
        locationDetail: `${['书桌左上角', '书架第二层', '床头柜上', '书包前袋', '音乐教室架子上层', '走廊储物柜中层', '书房角落抽屉'][Math.floor(Math.random() * 7)]}${['东', '南', '西', '北', '东南', '东北', '西南', '西北'][Math.floor(Math.random() * 8)]}方向${Math.floor(Math.random() * 20) + 1}米处`,
          action: ['放到了', '拿起了', '阅读了', '整理了', '识别了'][Math.floor(Math.random() * 5)]
        };
  this.socket = null;
  this.isConnected = false;
  this.connectionAttempts = 0;
  this.maxConnectionAttempts = 3;
  this.callbacks = {
    onConnect: null,
    onDisconnect: null,
    onDataReceived: null,
    onError: null
  };

  this.config = {
    ip: '192.168.3.250',
    port: 60000,
    deviceCode: 0xFF,
    baudRate: 115200
  };
}

  
  setConfig(config) {
    this.config = { ...this.config, ...config };
  }

  
  connect() {
    if (this.isConnected) return;

    if (this.isSimulation) {
      console.log('Simulating connection...');
      setTimeout(() => {
        this.isConnected = true;
        this.connectionAttempts = 0;
        this.callbacks.onConnect && this.callbacks.onConnect();
        
        // 模拟模式下仅在主动读卡时发送数据
      }, 1000);
      return;
    }

    this.socket = wx.createTCPSocket();
    console.log(`[连接配置] IP: ${this.config.ip}, 端口: ${this.config.port}, 尝试次数: ${this.connectionAttempts+1}`);

    this.socket.connect({
      address: this.config.ip,
      port: this.config.port,
      success: () => {
        console.log('TCP连接成功建立');
        this.isConnected = true;
        this.connectionAttempts = 0; 
        this.callbacks.onConnect && this.callbacks.onConnect();
      },
      fail: (err) => {
        console.error('TCP连接失败详情:', JSON.stringify(err));
        this.connectionAttempts++;
        const errorMsg = err.errMsg || '未知错误';
        let userFriendlyMsg = '';

        if (errorMsg.includes('connect fail')) {
          userFriendlyMsg = '连接失败: 请检查读卡器IP和端口是否正确';
        } else if (errorMsg.includes('timeout')) {
          userFriendlyMsg = '连接超时: 读卡器未响应';
        } else if (errorMsg.includes('refused')) {
          userFriendlyMsg = '连接被拒绝: 读卡器可能未启动或端口错误';
        } else if (errorMsg.includes('network')) {
          userFriendlyMsg = '网络错误: 请检查设备网络连接';
        } else {
          userFriendlyMsg = `连接失败: ${errorMsg}`;
        }

        if (this.connectionAttempts < this.maxConnectionAttempts) {
          console.log(`将在1秒后尝试第${this.connectionAttempts+1}次重连...`);
          setTimeout(() => this.connect(), 1000);
          userFriendlyMsg += `(正在尝试第${this.connectionAttempts+1}次重连)`;
        } else {
          this.connectionAttempts = 0; 
        }

        this.callbacks.onError && this.callbacks.onError(new Error(userFriendlyMsg));
      }
    });

    this.socket.onClose((res) => {
      this.isConnected = false;
      console.log('TCP连接已关闭:', res);
      // 意外断开时尝试重连
      if (res.code !== 1000) { 
        console.log('意外断开连接，尝试重连...');
        setTimeout(() => this.connect(), 2000);
      }
      this.callbacks.onDisconnect && this.callbacks.onDisconnect(res);
    });

    this.socket.onError((err) => {
      console.error('TCP连接错误:', err);
      this.callbacks.onError && this.callbacks.onError(new Error(`连接错误: ${err.errMsg || '网络异常'}`));
    });

    this.socket.onMessage((res) => {
      console.log('收到TCP数据:', res.data);
      this._handleReceivedData(res.data);
    });
  }
  
  disconnect() {
    if (this.isSimulation) {
      clearInterval(this.simulationInterval);
      this.isConnected = false;
      this.callbacks.onDisconnect && this.callbacks.onDisconnect();
      return;
    }

    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.isConnected = false;
    }
  }

  
  on(callbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  
  sendCommand(cmd, data = new Uint8Array()) {
    if (!this.socket) {
      console.warn('Socket is not connected');
      this.callbacks.onError?.({ message: 'Socket is not connected' });
      return;
    }
    if (!this.isConnected) {
      this.callbacks.onError && this.callbacks.onError(new Error('未连接读卡器'));
      return;
    }


    const header = new Uint8Array([0x53, 0x57]);
    const length = new Uint8Array([0x00, data.length + 2]); 
    const deviceCode = new Uint8Array([this.config.deviceCode]);
    const commandCode = new Uint8Array([cmd]);


    const frameWithoutChecksum = this._concatArrays(header, length, deviceCode, commandCode, data);
    const checksum = this._calculateChecksum(frameWithoutChecksum);


    const frame = this._concatArrays(frameWithoutChecksum, new Uint8Array([checksum]));


    if (!this.isConnected) {
      const error = new Error('发送失败: 未建立连接');
      console.error(error.message);
      this.callbacks.onError && this.callbacks.onError(error);
      return;
    }

    const result = this.socket.write(frame.buffer);
    if (!result) {
      const error = new Error('发送失败: 数据写入失败');
      console.error(error.message);
      this.callbacks.onError && this.callbacks.onError(error);
    } else {
      console.log(`命令发送成功: 0x${cmd.toString(16).toUpperCase()}`);
    }
  }

  
  startReading() {
    if (this.isSimulation) {
      console.log('Simulating reading start');
      // 生成新的模拟数据
      this.simulationData = {
        tagId: 'SIM' + Math.floor(Math.random() * 1000000),
        item: ['语文课本', '数学练习册', '英语听力材料', '盲文故事书'][Math.floor(Math.random() * 4)],
        location: ['书桌左上角', '书架第二层', '床头柜上', '书包前袋'][Math.floor(Math.random() * 4)],
        action: ['拿起了', '放置在', '整理了', '移动了', '取出了', '放回了'][Math.floor(Math.random() * 6)],
        locationDetail: `${['书桌左上角', '书架第二层', '床头柜上', '书包前袋'][Math.floor(Math.random() * 4)]}${['东', '南', '西', '北'][Math.floor(Math.random() * 4)]}方向${Math.floor(Math.random() * 20) + 1}米处` // 添加此行
      };
      // 立即发送模拟数据
      const data = {
        type: 'tag',
        tagId: this.simulationData.tagId,
        item: this.simulationData.item,
        location: this.simulationData.location,
        locationDetail: this.simulationData.locationDetail // 添加此行
      };
      this.callbacks.onDataReceived && this.callbacks.onDataReceived(data);
      return;
    }
    this.sendCommand(0x41); 
  }

  
  stopReading() {
    this.sendCommand(0x40); 
  }

  
  readSystemParams() {
    this.sendCommand(0x10); 
  }

  
  _handleReceivedData(data) {
    const uint8Data = new Uint8Array(data);


    if (uint8Data[0] !== 0x43 || uint8Data[1] !== 0x54) {
      console.warn('无效的数据包类型');
      return;
    }


    const checksum = uint8Data[uint8Data.length - 1];
    const frameWithoutChecksum = uint8Data.subarray(0, uint8Data.length - 1);
    const calculatedChecksum = this._calculateChecksum(frameWithoutChecksum);

    if (checksum !== calculatedChecksum) {
      console.warn('校验和错误', checksum, calculatedChecksum);
      return;
    }


    const length = (uint8Data[2] << 8) | uint8Data[3];
    const deviceCode = uint8Data[4];
    const responseCode = uint8Data[5];
    const responseData = uint8Data.subarray(6, 6 + (length - 2)); 


    if (responseCode === 0x45) {
      this._parseActiveData(responseData);
    } else {
  
      this.callbacks.onDataReceived && this.callbacks.onDataReceived({
        deviceCode,
        responseCode,
        data: responseData
      });
    }
  }

  
  _parseActiveData(data) {


    const tagIdLength = data[0];
    const tagId = data.subarray(1, 1 + tagIdLength);
    const antennaId = data[1 + tagIdLength];
    const rssi = data[2 + tagIdLength];

    const tagIdHex = Array.from(tagId)
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');

    this.callbacks.onDataReceived && this.callbacks.onDataReceived({
      type: 'tag',
      tagId: tagIdHex,
      antennaId,
      rssi,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * @param {Uint8Array} data
   * @returns {number} 
   */
  _calculateChecksum(data) {
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += data[i];
    }
    return sum & 0xFF; 
  }

  /**
   * @param  {...Uint8Array} arrays 
   * @returns {Uint8Array} 
   */
  _concatArrays(...arrays) {
    const totalLength = arrays.reduce((acc, arr) => acc + arr.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const arr of arrays) {
      result.set(arr, offset);
      offset += arr.length;
    }
    return result;
  }
}

module.exports = ReaderComm;