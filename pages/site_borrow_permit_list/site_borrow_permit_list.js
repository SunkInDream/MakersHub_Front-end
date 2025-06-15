// pages/FieldApply/FieldApply.js
const API_BASE = "http://146.56.227.73:8000";
const token = wx.getStorageSync('auth_token');

// 引入外部utils工具
const utils = require("../../utils/util")

Page({
  data: {
    // 页面渲染样式相关
    tab: 0, // 当前 tab 页索引
    sortText: '默认',
    currentSort: 'default',
    isFolded: true,
    stateTag: ["待审核", "已打回", "已通过", "已归还"],
    stateText: ['#FFFFFF', '#FFFFFF', '#000000', '#FFFFFF'],
    stateColors: {
      0: "#666",      // 待审核
      1: "#E33C64",   // 已打回
      2: "#ffeaa7",   // 已通过
      3: "#00adb5"    // 已归还
    },

    // 分类列表
    list: [],         // 全部申请
    unreviewedList: [],   // 未审核申请
    approvedList: [],     // 已通过申请
    rejectedList: [],     // 已打回申请
    returnedList: [],      // 已归还申请

    // 模拟数据
    mockData: {
      code: 200,
      message: "successfully get application list",
      data: {
        total: 4,
        list: [
          {
            apply_id: "LB1749636004000",
            state: 2,
            created_time: "2024-01-14T10:10:10Z",
            site: "二基楼B101",
            number: 1
          },
          {
            apply_id: "LB1749636006000",
            state: 0,
            created_time: "2024-02-14T10:10:12Z",
            site: "二基楼B208+",
            number: 2
          },
          {
            apply_id: "LB1749636007000",
            state: 3,
            created_time: "2024-03-14T10:10:12Z",
            site: "二基楼B102",
            number: 3
          },
          {
            apply_id: "LB1749636008000",
            state: 1,
            created_time: "2024-04-14T10:10:12Z",
            site: "二基楼B209",
            number: 1
          }
        ]
      }
    }
  },

  // 初始化不需要 currentList
  onLoad() {
    this.loadData();
  },

  // 过滤数据到不同分类
  filterData(dataList) {
    // 处理时间格式
    const formattedDataList = dataList.map(item => {
      return {
        ...item,
        formatted_time: utils.formatDateTime(item.created_time)
      };
    });

    const unreviewedList = formattedDataList.filter(item => item.state === 0);
    const rejectedList = formattedDataList.filter(item => item.state === 1);
    const approvedList = formattedDataList.filter(item => item.state === 2);
    const returnedList = formattedDataList.filter(item => item.state === 3);
    

    this.setData({
      list: formattedDataList,
      unreviewedList,
      approvedList,
      returnedList,
      rejectedList
    });
    console.log("list: ", this.data.list);
    console.log("unreviewedList: ", this.data.unreviewedList);
    console.log("approvedList: ", this.data.approvedList);
    console.log("rejecedList: ", this.data.rejectedList);
    console.log("returnedList: ", this.data.returnedList);
  },

  // 加载数据（使用模拟数据或实际API）
  loadData() {
    const that = this;
    wx.showLoading({ title: '加载中...' });
    wx.request({
      url: `${API_BASE}/sites-borrow/view-all`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`
      },
      success(res) {
        wx.hideLoading();
        console.log("apiData", JSON.stringify(res.data.data, null, 2));
        if (res.data && res.data.code === 200 && res.data.data && Array.isArray(res.data.data.list)) {
          that.filterData(res.data.data.list);
        } else {
          wx.showToast({
            title: res.data.message || '数据加载失败',
            icon: 'error'
          });
          console.error('后端返回异常：', res);
        }
      },
      fail(err) {
        wx.hideLoading();
        wx.showToast({ title: '网络请求失败', icon: 'error' });
        console.error('wx.request 调用失败：', err);
      }
    });
  },


  // 切换 tab
  changeItem(e) {
    const index = parseInt(e.currentTarget.dataset.item);
    this.setData({ tab: index });
  },

  onSwiperChange(e) {
    this.setData({ tab: e.detail.current });
  },

  handlerGobackClick() {
    wx.showModal({
      title: '你点击了返回',
      content: '是否确认返回',
      success: e => {
        if (e.confirm) {
          const pages = getCurrentPages();
          if (pages.length >= 2) {
            wx.navigateBack({ delta: 1 });
          } else {
            wx.reLaunch({ url: '/pages/index/index' });
          }
        }
      }
    });
  },

  handlerGohomeClick() {
    wx.reLaunch({ url: '/pages/index/index' });
  },

  // 跳转到详情页
  navigateToDetail(e) {
    console.log(e);
    const applyId = e.currentTarget.dataset.applyId;
    const state = e.currentTarget.dataset.state;
    console.log("applyId", applyId);
    console.log("state", state);
    wx.navigateTo({
      url: `/pages/site_borrow_permit/site_borrow_permit?apply_id=${applyId}&state=${state}`
    });
  }
});
