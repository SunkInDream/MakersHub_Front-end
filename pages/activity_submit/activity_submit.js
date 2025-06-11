// pages/activity/activity.js
const token = wx.getStorageSync('auth_token');
const API_BASE = "http://146.56.227.73:8000";
// 导入外部util工具
const utils = require('../../utils/util')

Page({
  data: {
    // 表单数据
    event: {
      event_name: '',
      poster: '',       // 本地图片路径
      posterUrl: '',    // 后端返回的URL (只在提交时才会获取)
      description: '',
      location: '',
      link: '',
      participant: '',
      start_time: '', 
      end_time: '',
      registration_deadline: ''
    },
    
    // 其他数据保持不变
    timePicker: {
      startTime: { year: '', month: '', day: '', hour: '', minute: '' },
      endTime: { year: '', month: '', day: '', hour: '', minute: '' },
      deadline: { year: '', month: '', day: '', hour: '', minute: '' }
    },
    formattedStartTime: { year: '年', month: '月', day: '日', hour: '时', minute: '分' },
    formattedEndTime: { year: '年', month: '月', day: '日', hour: '时', minute: '分' },
    formattedDeadline: { year: '年', month: '月', day: '日', hour: '时', minute: '分' },
    options: {
      years: Array.from({ length: 100 }, (_, i) => 2024 + i),
      months: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
      days: Array.from({ length: 31 }, (_, i) => i + 1 + '日'),
      hours: Array.from({ length: 24 }, (_, i) => i + '时'),
      minutes: Array.from({ length: 60 }, (_, i) => i + '分')
    },
    isNameFocused: false,
    isDescriptionFocused: false,
    isLocationFocused: false,
    isLinkFocused: false,
    isParticipantFocused: false,
    isValid: true
  },

  // 输入框处理函数保持不变...
  onNameFocused() { this.setData({ isNameFocused: true }); },
  onNameBlur(e) { 
    this.setData({ 
      isNameFocused: false,
      'event.event_name': e.detail.value
    });
  },
  
  onDescriptionFocused() { this.setData({ isDescriptionFocused: true }); },
  onDescriptionBlur(e) { 
    this.setData({ 
      isDescriptionFocused: false,
      'event.description': e.detail.value 
    });
  },
  
  onLocationFocused() { this.setData({ isLocationFocused: true }); },
  onLocationBlur(e) { 
    this.setData({ 
      isLocationFocused: false,
      'event.location': e.detail.value 
    });
  },
  
  onLinkFocused() { this.setData({ isLinkFocused: true }); },
  onLinkBlur(e) { 
    this.setData({ 
      isLinkFocused: false,
      'event.link': e.detail.value 
    });
  },
  
  onParticipantFocused() { this.setData({ isParticipantFocused: true }); },
  onParticipantBlur(e) { 
    this.setData({
      isParticipantFocused: false,
      'event.participant': e.detail.value
    });
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({
      [`event.${field}`]: e.detail.value,
    });
  },

  // 修改：选择海报但不上传
  onUploadPoster() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        this.setData({ 
          'event.poster': tempFilePath,
          'event.posterUrl': '' // 清空posterUrl，因为还未上传
        });
      },
      fail: (err) => {
        console.error('选择图片失败:', err);
      }
    });
  },

  // 添加：上传海报的方法，返回Promise
  uploadPoster(filePath) {
    return new Promise((resolve, reject) => {
      if (!filePath) {
        reject('没有选择海报');
        return;
      }

      wx.uploadFile({
        url: `${API_BASE}/events/poster`,
        filePath: filePath,
        name: 'file',
        header: {
          'Authorization': `Bearer ${token}`
        },
        success: (res) => {
          try {
            const result = JSON.parse(res.data);
            if (result.code === 200 && result.data && result.data.poster) {
              resolve(result.data.poster);
            } else {
              reject(result.message || '上传失败');
            }
          } catch (e) {
            reject('解析响应失败');
          }
        },
        fail: (err) => {
          reject(err);
        }
      });
    });
  },

   // 检查起始时间并复制到结束时间的函数
  checkAndCopyStartTime() {
    const startTime = this.data.timePicker.startTime;
    
    // 检查起始时间是否所有字段都已填写
    if (startTime.year && startTime.month && startTime.day && 
        startTime.hour && startTime.minute) {
      
      // 将起始时间复制到结束时间
      this.setData({
        'timePicker.endTime': {
          year: startTime.year,
          month: startTime.month,
          day: startTime.day,
          hour: startTime.hour,
          minute: startTime.minute
        }
      }, () => {
        // 更新结束时间的格式化显示和ISO时间
        this.updateFormattedTime('endTime');
      });
    }
  },

  // 修改时间相关函数
  updateFormattedTime(type) {
    const timeData = this.data.timePicker[type];
    
    const data = {
      [`formatted${type.charAt(0).toUpperCase() + type.slice(1)}`]: {
        year: timeData.year ? timeData.year.toString() + '年' : '年',
        month: timeData.month || '月',
        day: timeData.day || '日',
        hour: timeData.hour || '时',
        minute: timeData.minute || '分'
      }
    };
    this.setData(data);
    
    this.updateISOTime(type);
  },

  updateISOTime(type) {
    const timeData = this.data.timePicker[type];
    // 假设formatToISOTime已定义
    const isoTime = utils.formatToISOTime(timeData);

    if (isoTime) {
      const field = type === 'startTime' ? 'start_time' : 
                  type === 'endTime' ? 'end_time' : 'registration_deadline';
                  
      this.setData({
        [`event.${field}`]: isoTime
      });
    }
  },

  // 修改时间选择器事件处理函数
  onYearChange(e) {
    const type = e.currentTarget.dataset.type;
    const value = this.data.options.years[e.detail.value];
    this.setData({ 
      [`timePicker.${type}.year`]: value 
    }, () => {
      this.updateFormattedTime(type);
      // 如果是起始时间更新，检查并复制到结束时间
      if (type === 'startTime') {
        this.checkAndCopyStartTime();
      }
    });
  },

  onMonthChange(e) {
    const type = e.currentTarget.dataset.type;
    const value = this.data.options.months[e.detail.value];
    this.setData({ 
      [`timePicker.${type}.month`]: value 
    }, () => {
      this.updateFormattedTime(type);
      if (type === 'startTime') {
        this.checkAndCopyStartTime();
      }
    });
  },

  onDayChange(e) {
    const type = e.currentTarget.dataset.type;
    const value = this.data.options.days[e.detail.value];
    this.setData({ 
      [`timePicker.${type}.day`]: value 
    }, () => {
      this.updateFormattedTime(type);
      if (type === 'startTime') {
        this.checkAndCopyStartTime();
      }
    });
  },

  onHourChange(e) {
    const type = e.currentTarget.dataset.type;
    const value = this.data.options.hours[e.detail.value];
    this.setData({ 
      [`timePicker.${type}.hour`]: value 
    }, () => {
      this.updateFormattedTime(type);
      if (type === 'startTime') {
        this.checkAndCopyStartTime();
      }
    });
  },

  onMinuteChange(e) {
    const type = e.currentTarget.dataset.type;
    const value = this.data.options.minutes[e.detail.value];
    this.setData({ 
      [`timePicker.${type}.minute`]: value 
    }, () => {
      this.updateFormattedTime(type);
      if (type === 'startTime') {
        this.checkAndCopyStartTime();
      }
    });
  },

  validateForm() {
    console.log("开始表单验证...");
    try {
      const event = this.data.event;
      
      // 手动检查每个必填字段
      if (!event.event_name) {
        console.log("活动名称验证失败");
        wx.showToast({ title: '请填写活动名称', icon: 'none' });
        this.data.isValid = false;
      }
      
      if (!event.poster) {
        console.log("海报验证失败");
        wx.showToast({ title: '请选择活动海报', icon: 'none' });
        this.data.isValid = false;
      }
      
      if (!event.description) {
        console.log("简介验证失败");
        wx.showToast({ title: '请填写活动简介', icon: 'none' });
        this.data.isValid = false;
      }
      
      if (!event.location) {
        console.log("地点验证失败");
        wx.showToast({ title: '请填写举办地点', icon: 'none' });
        this.data.isValid = false;
      }
      
      if (!event.link) {
        console.log("链接验证失败");
        wx.showToast({ title: '请填写二课链接', icon: 'none' });
        this.data.isValid = false;
      }
      
      if (!event.participant) {
        console.log("参与对象验证失败");
        wx.showToast({ title: '请填写参与对象', icon: 'none' });
        this.data.isValid = false;
      }
      
      // 时间验证
      console.log("验证时间字段:", {
        start_time: event.start_time,
        end_time: event.end_time,
        registration_deadline: event.registration_deadline
      });
      
      if (!event.start_time) {
        console.log("开始时间验证失败");
        wx.showToast({ title: '请选择举办时间', icon: 'none' });
        this.data.isValid = false;
      }
      
      if (!event.end_time) {
        console.log("结束时间验证失败");
        wx.showToast({ title: '请选择结束时间', icon: 'none' });
        this.data.isValid = false;
      }
      
      if (!event.registration_deadline) {
        console.log("报名截止时间验证失败");
        wx.showToast({ title: '请选择报名截止时间', icon: 'none' });
        this.data.isValid = false;
      }
      
      console.log("表单验证通过！");
      this.data.isValid = true;
    } catch (error) {
      console.error("表单验证过程中出错:", error);
      this.data.isValid = false;
    }
  },


  // 修改：提交表单，先上传海报，成功后再提交表单
  onSubmit(e) {
    console.log('点击了提交按钮', e);
    console.log('表单数据:', this.data.event);
    console.log('时间选择器数据:', this.data.timePicker);

    const isValid = this.data.isValid;
    // 先进行表单验证
    if (!isValid) {
      console.log("表单验证失败");
      return;
    }

    wx.showLoading({ title: '提交中...' });

    // 确保filePath有值
    const filePath = this.data.event.poster;
    if (!filePath) {
      wx.hideLoading();
      wx.showToast({ title: '请选择活动海报', icon: 'none' });
      return;
    }

    // 使用新的Promise链，确保上下文正确
    new Promise((resolve, reject) => {
      wx.uploadFile({
        url: `${API_BASE}/events/poster`,
        filePath: filePath,
        name: 'file',
        header: {
          'Authorization': `Bearer ${token}`
        },
        success: (res) => {
          try {
            const result = JSON.parse(res.data);
            if (result.code === 200 && result.data && result.data.poster) {
              resolve(result.data.poster);
            } else {
              reject(result.message || '上传失败');
            }
          } catch (e) {
            reject('解析响应失败');
          }
        },
        fail: (err) => {
          reject(err);
        }
      });
    })
    .then(posterUrl => {
      // 海报上传成功，更新posterUrl
      this.setData({ 'event.posterUrl': posterUrl });
      
      // 准备提交表单数据
      const postData = {
        ...this.data.event,
        poster: posterUrl  // 使用后端返回的URL
      };

      // 提交表单
      return new Promise((resolve, reject) => {
        wx.request({
          url: `${API_BASE}/events/post`,
          method: 'POST',
          header: {
            'Authorization': `Bearer ${token}`,
            'content-type': 'application/json'
          },
          data: postData,
          success: (res) => {
            if (res.data.code === 200) {
              resolve();
            } else {
              reject(res.data.message || '发布失败');
            }
          },
          fail: (err) => {
            reject('网络错误，请重试');
          }
        });
      });
    })
    .then(() => {
      wx.hideLoading();
      wx.showToast({ title: '发布成功', icon: 'success' });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    })
    .catch(err => {
      console.error('发布失败:', err);
      wx.hideLoading();
      wx.showToast({ 
        title: typeof err === 'string' ? err : '发布失败', 
        icon: 'error' 
      });
    });
  },

  // 返回处理函数
  handlerGobackClick() {
    wx.showModal({
      content: '返回将丢失已填写的内容，\n确认返回？',
      cancelColor: '#00ADB5',
      confirmColor: '#222831',
      success: (res) => {
        if (res.confirm) {
          wx.navigateBack();
        }
      }
    });
  },

  handlerGohomeClick() {
    wx.showModal({
      title: '确认返回首页',
      content: '返回首页将丢失已填写的内容，是否确认？',
      success: (res) => {
        if (res.confirm) {
          wx.reLaunch({ url: '/pages/index/index' });
        }
      }
    });
  }
});
