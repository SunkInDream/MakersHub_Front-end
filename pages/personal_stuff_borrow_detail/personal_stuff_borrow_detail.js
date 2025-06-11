// pages/personal_stuff_borrow_detail/personal_stuff_borrow_detail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 状态相关数据
    statusColor: '',     // 状态标签背景色
    statusText: '',      // 状态标签文本

    // 借物详情数据
    apiData: {
      // 状态值 (0:待审核, 1:已打回, 2:未归还, 3:已归还)
      status: 0,

      // 借物人信息
      borrowerInfo: {
        name: '张三',
        student_id: '2023141460059',
        major: '计算机科学与技术',
        phone_num: '13800138000',
        email: 'zhangsan@example.com',
        grade: '2023级',
      },
    }
  },

  // 更新状态显示
  updateStatus(status) {
    let statusColor = '';
    let statusText = '';
    
    switch (status) {
      case 0: // 待审核
        statusColor = '#393E46';
        statusText = '待审核';
        break;
      case 1: // 已打回
        statusColor = '#E33C64';
        statusText = '已打回';
        break;
      case 2: // 未归还
        statusColor = '#FFE89E';
        statusText = '未归还';
        break;
      case 3: // 已归还
        statusColor = '#00adb5';
        statusText = '已归还';
        break;
      default:
        statusColor = '#999999';
        statusText = '未知状态';
    }
    
    this.setData({
      statusColor,
      statusText
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.updateStatus(this.data.apiData.status);
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