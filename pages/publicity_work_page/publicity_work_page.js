// index.js
const API_BASE = "http://146.56.227.73:8000";
const token = wx.getStorageSync('auth_token');

Page({
  data: {
    level: 2 // 默认权限级别，需根据接口动态更新
  },
  
  onLoad() {
    this.fetchUserRole();
  },

  fetchUserRole() {
    wx.request({
      url: `${API_BASE}/users/profile`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`,
        'content-type': 'application/json'
      },
      success: (res) => {
        this.setData({ level: res.data.data.role });
      },
      fail: () => {
        wx.showToast({ title: '获取权限失败' });
      }
    });
  },

  handlerGobackClick() {
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
  },

  handlerGohomeClick() {
    wx.reLaunch({
      url: '/pages/index/index'
    });
  },

    // 导航方法
    navigateToActivitySubmit() {
      wx.navigateTo({ url: '/pages/activity_submit/activity_submit' }) // 活动宣传发布
    },
    navigateToSchedule() {
      wx.navigateTo({ url: '/pages/schedule/schedule' }) // 学年工作安排
    },
    navigateToMyXiumiLink() {
      wx.navigateTo({ url: '/pages/my_xiumi_link/my_xiumi_link' }) 
    },
    navigateToXiumiLinkPermit() {
      wx.navigateTo({ url: '/pages/xiumi_link_permit/xiumi_link_permit' }) 
    },
    navigateToTaskPost() {
      wx.navigateTo({ url: '/pages/task/task' }) // 发布任务
    },

  
  // 示例：获取用户权限
  fetchUserLevel() {
    // 发起网络请求
    wx.request({
      url: 'https://api.example.com/user/info',
      success: (res) => {
        this.setData({ level: res.data.level })
      },
      fail: () => {
        wx.showToast({ title: '获取权限失败' })
      }
    })
  }
})

