// pages/my_xiumi_list/my_xiumi_link.js
const API_BASE = "http://146.56.227.73:8000";
const token = wx.getStorageSync('auth_token');
// 引入外部utils工具
const utils = require("../../utils/util")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    tab: 0, // 当前 tab 页索引
    stateTag: ["待审核", "已打回", "已通过"],
    stateColors: {
      0: "#666",      // 待审核
      1: "#E33C64",   // 已打回
      2: "#00adb5"    // 已通过
    },
    list: [],         // 全部申请
    unreviewedList: [
      {
        "link_id": "PL1749790054000",
        "title": "全国大学生物联网设计竞赛经验分享会",
        "create_time": "2024-02-13T10:00:00Z",
        "link": "http://example.com",
        "state": 0
      }
    ], // 待审核 (state=0)
    rejectedList: [
      {
        "link_id": "PL1749790056000",
        "title": "作弊经验分享会",
        "create_time": "2024-02-13T10:00:00Z",
        "link": "http://example.com",
        "state": 1
      }
    ],  // 已打回 (state=1)
    approvedList: [
      {
        "link_id": "PL1749790054000",
        "title": "全国大学生物联网设计竞赛经验分享会",
        "create_time": "2024-02-13T10:00:00Z",
        "link": "http://example.com",
        "state": 2
      }
    ], // 已通过 (state=2)
    mockData: {
      code: 200,
      message: "successfully get application list",
      data: {
        total: 2,
        "list": [
          {
            "link_id": "PL1749790054000",
            "title": "全国大学生物联网设计竞赛经验分享会",
            "create_time": "2024-02-13T10:00:00Z",
            "link": "http://example.com",
            "state": 0
          },
          {
            "link_id": "PL1749790056000",
            "title": "作弊经验分享会",
            "create_time": "2024-02-13T10:00:00Z",
            "link": "http://example.com",
            "state": 1
          }
        ]
      }
    }
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },
  // 切换 tab
  changeItem(e) {
    const index = parseInt(e.currentTarget.dataset.item);
    this.setData({ tab: index });
  },
  onSwiperChange(e) {
    this.setData({ tab: e.detail.current });
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})