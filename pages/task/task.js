const API_BASE = 'http://146.56.227.73:8000'
const TOKEN_KEY = 'auth_token'
const token = wx.getStorageSync(TOKEN_KEY)
// pages/task/task.js
Page({
  data: {
    task_name: '',
    name: '',
    content: '',
    deadline:'',
    years: Array.from({ length: 100 }, (_, i) => 2024 + i + '年'),
    months: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    days: Array.from({ length: 31 }, (_, i) => i + 1 + '日'),
    hours: Array.from({ length: 24 }, (_, i) => i + 1 + '时'),
    minutes: Array.from({ length: 60 }, (_, i) => i + 1 + '分'),
    selectedYear: null,
    selectedMonth: null,
    selectedDay: null,
    selectedHour: null,
    selectedMinute: null,
    isNameFocused: false,
    isDirectorFocused: false,
    isDescriptionFocused: false
  },

  onLoad() {
    
    // 页面加载时的逻辑
  },

  handlerGobackClick() {
    wx.showModal({
      title: '你点击了返回',
      content: '是否确认放回',
      success: e => {
        if (e.confirm) {
          const pages = getCurrentPages();
          if (pages.length >= 2) {
            wx.navigateBack({
              delta: 1
            });
          } else {
            wx.reLaunch({
              url: '/pages/index/index'
            });
          }
        }
      }
    });
  },
  handlerGohomeClick() {
    wx.reLaunch({
      url: '/pages/index/index'
    });
  },

  onNameFocused : function() {
    this.setData({
      isNameFocused: true
    });
  },

  onNameBlur : function() {
    this.setData({
      isNameFocused: false
    });
  },

  onDirectorFocused : function() {
    this.setData({
      isDirectorFocused: true
    });
  },

  onDirectorBlur : function() {
    this.setData({
      isDirectorFocused: false
    });
  },

  onDescriptionFocused : function() {
    this.setData({
      isDescriptionFocused: true
    });
  },

  onDescriptionBlur : function() {
    this.setData({
      isDescriptionFocused: false
    });
  },
  
  onInput(e) {//编辑函数
    const field = e.currentTarget.dataset.field;
    this.setData({
      [field]: e.detail.value,
    });
  },

  onYearChange(e) {//改变选择器年份
    this.setData({
      selectedYear: this.data.years[e.detail.value],
    });
  },

  onMonthChange(e) {//改变选择器月份
    this.setData({
      selectedMonth: this.data.months[e.detail.value],
    });
  },

  onDayChange(e) {//改变选择器日期
    this.setData({
      selectedDay: this.data.days[e.detail.value],
    });
  },

  onHourChange(e) {//改变选择器小时
    this.setData({
      selectedHour: this.data.hours[e.detail.value],
    });
  },

  onMinuteChange(e) {//改变选择器分钟
    this.setData({
      selectedMinute: this.data.minutes[e.detail.value],
    });
  },

  onSubmit() {
    console.log('调试信息 - 当前数据状态:');
    console.log('task_name:', this.data.task_name);
    console.log('name:', this.data.name);  
    console.log('content:', this.data.content);
    console.log('selectedYear:', this.data.selectedYear);
    console.log('selectedMonth:', this.data.selectedMonth);
    console.log('selectedDay:', this.data.selectedDay);
    console.log('selectedHour:', this.data.selectedHour);
    console.log('selectedMinute:', this.data.selectedMinute);
    
    const { task_name, name, content, selectedYear, selectedMonth, selectedDay, selectedHour, selectedMinute } = this.data;
    
    if (!task_name || !name || !content || !selectedYear || !selectedMonth || !selectedDay || !selectedHour || !selectedMinute) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none',
      });
      return;
    }
    
    const deadline = `${selectedYear}-${selectedMonth}-${selectedDay} ${selectedHour}:${selectedMinute}`;
    
    // 更新 deadline 到 data 中
    this.setData({
      deadline: deadline
    });
    
    console.log('任务信息:', {
      task_name: this.data.task_name,
      name: this.data.name,
      content: this.data.content,
      deadline: deadline,
    });
    
    wx.request({
      url: `${API_BASE}/api/tasks`, // 修改这里：从 /users/profile 改为 /api/tasks
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      data: {
        task_name: this.data.task_name,
        name: this.data.name,
        content: this.data.content,
        deadline: deadline,
        priority: 2 // 添加优先级字段，默认为中等优先级
      },
      success: (res) => {
        console.log('任务创建成功:', res.data);
        wx.showToast({
          title: '任务创建成功',
          icon: 'success'
        });
        // 可以选择返回上一页或清空表单
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      },
      fail: (err) => {
        console.error('任务创建失败:', err);
        wx.showToast({
          title: '创建失败,请稍后重试',
          icon: 'none'
        });
      }
    });
  }
});