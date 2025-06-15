// pages/xuimi_submit/xiumi_submit.js
const token = wx.getStorageSync('auth_token');
const API_BASE = "http://146.56.227.73:8000";

Page({
  data: {
    formData: {
      "link_id": '',
      "title": '',
      "name": '',
      "link": ''
    },
    // 状态确定变量
    isEdited: false,  // 识别修改状态还是新建提交状态
    isValid: true,    // 识别是否可以提交
    // 样式渲染需要的变量
    isTitleFocused: false,
    isNameFocused: false,
    isLinkFocused: false
  },

  // 页面加载时的逻辑
  onLoad(options) {
    if (options.link_id) {
      this.setData({
        isEdited: true,
        'formData.link_id': options.link_id,
        'formData.title': decodeURIComponent(options.title || ''),
        'formData.name': decodeURIComponent(options.name || ''),
        'formData.link': decodeURIComponent(options.link || '')
      });
    }
    console.log("link_id: ", options.link_id);
    console.log("formData passed: ", JSON.stringify(this.data.formData, null, 2));
  },

  // 提交按钮
  onSubmit() {
    const { title, name, link } = this.data.formData;

    // 简单非空校验
    if (!title) return wx.showToast({ title: '请输入推文标题', icon: 'none' });
    if (!name)  return wx.showToast({ title: '请输入制作人姓名', icon: 'none' });
    if (!link)  return wx.showToast({ title: '请输入秀米链接', icon: 'none' });

    // 根据模式选择 URL 和 Method
    const url = this.data.isEdited
      ? `${API_BASE}/publicity-link/update/${this.data.formData.link_id}`
      : `${API_BASE}/publicity-link/post`;
    const method = this.data.isEdited ? 'PATCH' : 'POST';

    wx.request({
      url,
      method,
      header: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: { title, name, link },
      success: res => {
        console.log('服务器返回：', res.data);
        wx.showToast({ title: this.data.isEdited ? '修改成功' : '提交成功', icon: 'success' });
        // 编辑模式下可直接返回列表，新建模式下可清空表单
        if (this.data.isEdited) {
          wx.navigateBack({ delta: 1 });
        } else {
          this.setData({ formData: { title: '', name: '', link: '' } });
        }
      },
      fail: err => {
        console.error('请求失败：', err);
        wx.showToast({ title: '操作失败，请稍后重试', icon: 'none' });
      }
    });
  },


 // Title输入框处理
onTitleFocused() { 
  this.setData({ isTitleFocused: true }); 
},
onTitleBlur(e) { 
  this.setData({ 
    isTitleFocused: false,
    'formData.title': e.detail.value
  });
},

// Name输入框处理函数
onNameFocused() { 
  this.setData({ isNameFocused: true }); 
},
onNameBlur(e) { 
  this.setData({ 
    isNameFocused: false,
    'formData.name': e.detail.value
  });
},

// Link输入框处理函数
onLinkFocused() { 
  this.setData({ isLinkFocused: true }); 
},
onLinkBlur(e) { 
  this.setData({ 
    isLinkFocused: false,
    'formData.link': e.detail.value
  });
},

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
    wx.reLaunch({
      url: '/pages/index/index'
    });
  },

});