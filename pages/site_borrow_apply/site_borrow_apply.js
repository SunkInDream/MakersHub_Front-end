// pages/site_borrow_apply/site_borrow_apply.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    siteBorrow: {
      apply_id: '',
      name: '',
      student_id: '',
      phone_num: '',
      email: '',
      purpose: '',
      mentor_name: '',
      mentor_phone_num: '',
      site: '',
      number: '',
      end_time: '',
    },
    options: {
      site: [
        {
          site_name: '二基楼B101',
          number: Array.from({ length: 5 }, (_, i) => 1 + i),
        },
        {
          site_name: '二基楼B208',
          number: Array.from({length: 3}, (_,i) => 1 + i)
        }],
      years: Array.from({ length: 10 }, (_, i) => 2024 + i + '年'),
      months: Array.from({ length: 12 }, (_, i) => i + 1 + '月'),
      days: Array.from({ length: 31 }, (_, i) => i + 1 + '日'),
    },
    siteNames: [], // 将在onLoad中初始化
    selectedSiteIndex: -1,
    selectedSiteName: '',
    currentNumbers: [],
    selectedNumber: '',
    // 日期选择相关
    selectedYear: '',
    selectedMonth: '',
    selectedDay: '',
    currentDays: [], // 根据月份动态调整
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 初始化siteNames数组，方便picker使用
    const siteNames = this.data.options.site.map(item => item.site_name);
    this.setData({
      siteNames: siteNames
    });
  },
  // 场地选择处理
  onSiteChange(e) {
    const siteIndex = e.detail.value;
    
    this.setData({
      selectedSiteIndex: siteIndex,
      selectedSiteName: this.data.options.site[siteIndex].site_name,
      currentNumbers: this.data.options.site[siteIndex].number,
      selectedNumber: '' // 重置编号选择
    });
  },
  
  // 场地编号选择处理
  onSiteNumberChange(e) {
    const numberIndex = e.detail.value;
    
    this.setData({
      selectedNumber: this.data.currentNumbers[numberIndex]
    });
  },
  
  // 年份选择处理
  onYearChange(e) {
    const yearIndex = e.detail.value;
    const year = this.data.options.years[yearIndex].replace('年', '');
    
    this.setData({
      selectedYear: this.data.options.years[yearIndex]
    });
    
    this.updateDays();
  },

  // 月份选择处理
  onMonthChange(e) {
    const monthIndex = e.detail.value;
    const month = this.data.options.months[monthIndex].replace('月', '');
    
    this.setData({
      selectedMonth: this.data.options.months[monthIndex]
    });
    
    this.updateDays();
  },

  // 日期选择处理
  onDayChange(e) {
    const dayIndex = e.detail.value;
    
    this.setData({
      selectedDay: this.data.options.days[dayIndex]
    });
  },

  // 更新日数组，根据选择的年月调整天数
  updateDays() {
    if (!this.data.selectedYear || !this.data.selectedMonth) return;
    
    const year = parseInt(this.data.selectedYear.replace('年', ''));
    const month = parseInt(this.data.selectedMonth.replace('月', ''));
    
    // 获取当月天数
    const daysInMonth = new Date(year, month, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1 + '日');
    
    this.setData({
      'options.days': days,
      selectedDay: this.data.selectedDay > daysInMonth ? days[0] : this.data.selectedDay
    });
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