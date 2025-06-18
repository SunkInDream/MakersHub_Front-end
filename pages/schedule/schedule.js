const API_BASE = "http://146.56.227.73:8000";
const TOKEN_KEY = 'auth_token';

Page({
  data: {
    isEditing: false,
    level: 1,
    tableData: []
  },

  onLoad() {
    console.log('[onLoad] 页面加载');
    const token = wx.getStorageSync(TOKEN_KEY);
  
    wx.request({
      url: `${API_BASE}/arrange/get-arrangement`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      success: res => {
        console.log('[onLoad] 获取数据成功:', res.data);
        const allData = res.data?.data || {};
  
        const scriptList = allData[1] || [];
        const pushList = allData[2] || [];
        const newsList = allData[3] || [];
  
        const maxLen = Math.max(scriptList.length, pushList.length, newsList.length);
        const tableData = [];
  
        for (let i = 0; i < maxLen; i++) {
          tableData.push({
            script: scriptList[i]?.name || '',
            push: pushList[i]?.name || '',
            news: newsList[i]?.name || ''
          });
        }
  
        console.log('[onLoad] 最终映射后的 tableData:', tableData);
        this.setData({ tableData });
      },
      fail: err => {
        console.error('[onLoad] 获取数据失败:', err);
        wx.showToast({ title: '加载失败', icon: 'none' });
      }
    });
  },
  

  handlerGobackClick() {
    wx.showModal({
      title: '提示',
      content: '是否确认返回首页？',
      success: e => {
        if (e.confirm) {
          wx.reLaunch({ url: '/pages/index/index' });
        }
      }
    });
  },

  handlerGohomeClick() {
    wx.reLaunch({ url: '/pages/index/index' });
  },

  onCellInput(e) {
    const { index, field } = e.currentTarget.dataset;
    const value = e.detail.value;
    this.setData({
      [`tableData[${index}].${field}`]: value
    });
  },

  toggleEdit() {
    this.setData({ isEditing: !this.data.isEditing });
  },

  submitEdit() {
    const token = wx.getStorageSync(TOKEN_KEY);
    const { tableData } = this.data;
  
    // 把 tableData 拆分为 1/2/3 三种任务类型结构
    const requestData = {
      "1": [], // 活动文案
      "2": [], // 推文
      "3": []  // 新闻稿
    };
  
    tableData.forEach((row, index) => {
      requestData["1"].push({
        name: row.script,
        order: index + 1,
        current: index === 0,
        maker_id: "MK_script_" + index // 🧪 这里你可以用真实的 maker_id 替换
      });
      requestData["2"].push({
        name: row.push,
        order: index + 1,
        current: index === 0,
        maker_id: "MK_push_" + index
      });
      requestData["3"].push({
        name: row.news,
        order: index + 1,
        current: index === 0,
        maker_id: "MK_news_" + index
      });
    });
  
    wx.showModal({
      title: '确认提交',
      content: '是否提交编辑内容？',
      success: e => {
        if (e.confirm) {
          wx.request({
            url: `${API_BASE}/arrange/arrangements/batch`,
            method: 'POST',
            header: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            data: requestData, // ✅ 正确格式的字典结构
            success: res => {
              console.log('[submitEdit] 上传成功:', res.data);
              wx.showToast({
                title: res.data.message || '提交成功',
                icon: 'success'
              });
              this.setData({ isEditing: false });
            },
            fail: err => {
              console.error('[submitEdit] 上传失败:', err);
              wx.showToast({
                title: '上传失败',
                icon: 'none'
              });
            }
          });
        }
      }
    });
  },
  

  cancelEdit() {
    wx.showModal({
      title: '取消确认',
      content: '是否放弃已修改内容？',
      success: e => {
        if (e.confirm) {
          this.setData({ isEditing: false });
          this.onLoad(); // 重新加载
        }
      }
    });
  }
});
