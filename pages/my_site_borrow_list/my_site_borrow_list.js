// pages/my_site_borrow_list/my_site_borrow_list.js
const API_BASE = "http://146.56.227.73:8000";
const token = wx.getStorageSync('auth_token');

// 引入外部utils工具
const utils = require("../../utils/util")

Page({
  data: {
    tab: 0, // 当前 tab 页索引
    sortText: '默认',
    currentSort: 'default',
    isFolded: true,
    stateTag: ["待审核", "已打回", "借用中", "已归还"],
    stateText: ['#FFFFFF', '#FFFFFF', '#000000', '#FFFFFF'],
    stateColors: {
      0: "#666",      // 待审核
      1: "#E33C64",   // 已打回
      2: "#ffeaa7",   // 借用中
      3: "#00adb5"    // 已归还
    },
    list: [],         // 全部申请
    borrowingList: [], // 借用中 (state=2)
    returnedList: [],  // 已归还 (state=3)
    unpermittedList: [], // 在约 (state=0 or state=1)
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
// 初始化时加载数据
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

    const borrowingList = formattedDataList.filter(item => item.state === 2);
    const returnedList = formattedDataList.filter(item => item.state === 3);
    const unpermittedList = formattedDataList.filter(item => item.state === 0 || item.state === 1);

    this.setData({
      list: formattedDataList,
      borrowingList,
      returnedList,
      unpermittedList
    });
    console.log("list: ", this.data.list);
    console.log("borrowingList: ", this.data.borrowingList);
    console.log("returnedList: ", this.data.returnedList);
    console.log("unpermittedList: ", this.data.unpermittedList);
  },

  // 加载数据（使用模拟数据或实际API）
  loadData() {
    try {
      // 模拟API调用
      const response = this.data.mockData;
      if (response && response.data && response.data.list) {
        this.filterData(response.data.list);
      } else {
        wx.showToast({ title: '数据加载失败', icon: 'error' });
      }
    } catch (err) {
      console.error('加载数据错误:', err);
      wx.showToast({ title: '数据加载失败', icon: 'error' });
    }
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
    const applyId = e.currentTarget.dataset.applyId;
    const state = e.currentTarget.dataset.state;
    wx.navigateTo({
      url: `/pages/my_site_borrow_detail/my_site_borrow_detail?apply_id=${applyId}&state=${state}`
    });
  }
});