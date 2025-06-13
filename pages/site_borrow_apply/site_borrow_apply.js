// pages/site_borrow_apply/site_borrow_apply.js
const API_BASE = "http://146.56.227.73:8000";
const DEBUG = true;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    isEdit: false,
    apply_id: '',
    formData: {
      name: '',
      student_id: '',
      phone_num: '',
      email: '',
      purpose: '',
      project_id: '',
      mentor_name: '',
      mentor_phone_num: '',
      site: '',
      number: '',
      start_time: '',
      end_time: '',
    },
    // 存储原始数据，用于比较变更
    originalData: {
      name: '',
      student_id: '',
      phone_num: '',
      email: '',
      purpose: '',
      project_id: '',
      mentor_name: '',
      mentor_phone_num: '',
      site: '',
      number: '',
      start_time: '',
      end_time: '',
    },
    // 跟踪字段变更
    changedFields: {},
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
    
    // 起借日期选择相关
    startSelectedYear: '',
    startSelectedMonth: '',
    startSelectedDay: '',
    startCurrentDays: [], // 根据月份动态调整
    
    // 归还日期选择相关
    endSelectedYear: '',
    endSelectedMonth: '',
    endSelectedDay: '',
    endCurrentDays: [], // 根据月份动态调整
    
    // 表单焦点状态
    isLeaderNameFocused: false,
    isGradeFocused: false,
    isLeaderPhoneFocused: false,
    isEmailFocused: false,
    isDescriptionFocused: false,
    isAdvisorNameFocused: false,
    isAdvisorPhoneFocused: false,

    // 表单可提交验证
    isValid: true
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
    
    // 检查是否是编辑模式
    if (options.edit === 'true' && options.apply_id) {
      this.setData({
        isEdit: true,
        apply_id: options.apply_id
      });
      
      // 从后端获取申请数据
      this.fetchApplyData(options.apply_id);
    } else {
      // 非编辑模式，默认设置起借时间为当前日期
      const today = new Date();
      const year = today.getFullYear() + '年';
      const month = (today.getMonth() + 1) + '月';
      const day = today.getDate() + '日';
      
      this.setData({
        startSelectedYear: year,
        startSelectedMonth: month,
        startSelectedDay: day
      });
      
      this.updateStartDays();
      this.updateStartTimeInFormData();
    }
  },
  
  // 从后端获取申请数据
  fetchApplyData(apply_id) {
    wx.showLoading({
      title: '加载数据...'
    });
    if(DEBUG) {
      // 模拟API调用
      setTimeout(() => {
        // 模拟数据
        const mockData = {
          code: 200,
          message: "successfully get site-application detail",
          data: {
            apply_id: "LB1749636004000",
            name: "张三",
            student_id: "2023141460079",
            phone_num: "13800138000",
            email: "student@example.com",
            purpose: "创新项目展示与研讨",
            project_id: "PJ1749636004000",
            mentor_name: "李华",
            mentor_phone_num: "13900139000",
            site: "二基楼B101",
            number: 1,
            start_time: "2024-02-15",
            end_time: "2024-02-25",
            state: 0,
            review: ""
          }
        };
        
        // 处理模拟响应
        if (mockData.code === 200 && mockData.data) {
          this.loadApplyData(mockData.data);
        } else {
          wx.showToast({
            title: mockData.message || '获取申请数据失败',
            icon: 'none'
          });
        }
        
        wx.hideLoading();
      }, 500); // 模拟网络延迟
    } else {
      wx.request({
        url: `${API_BASE}/site-borrow/detail/${apply_id}`,
        method: 'GET',
        header: {
          'content-type': 'application/json',
          'Authorization': wx.getStorageSync('token')
        },
        success: (res) => {
          if (res.data.code === 200 && res.data.data) {
            // 加载申请数据到表单
            this.loadApplyData(res.data.data);
          } else {
            wx.showToast({
              title: res.data.message || '获取申请数据失败',
              icon: 'none'
            });
          }
        },
        fail: (err) => {
          console.error('请求失败:', err);
          wx.showToast({
            title: '网络错误，请重试',
            icon: 'none'
          });
        },
        complete: () => {
          wx.hideLoading();
        }
      });
    }
  },
  
  // 加载申请数据到表单
  loadApplyData(applyData) {
    // 设置基本表单数据
    const formData = {
      name: applyData.name,
      student_id: applyData.student_id,
      phone_num: applyData.phone_num,
      email: applyData.email,
      purpose: applyData.purpose,
      project_id: applyData.project_id,
      mentor_name: applyData.mentor_name,
      mentor_phone_num: applyData.mentor_phone_num,
      site: applyData.site,
      number: applyData.number,
      start_time: applyData.start_time,
      end_time: applyData.end_time
    };
    
    // 同时保存原始数据用于比较
    this.setData({
      formData: formData,
      originalData: JSON.parse(JSON.stringify(formData)), // 深拷贝
      changedFields: {} // 重置变更跟踪
    });
    
    // 设置场地信息
    const siteIndex = this.data.siteNames.findIndex(site => site === applyData.site);
    if (siteIndex !== -1) {
      this.setData({
        selectedSiteIndex: siteIndex,
        selectedSiteName: applyData.site,
        currentNumbers: this.data.options.site[siteIndex].number
      });
      
      // 设置场地编号
      const numberIndex = this.data.currentNumbers.findIndex(num => num === applyData.number);
      if (numberIndex !== -1) {
        this.setData({
          selectedNumber: applyData.number
        });
      }
    }
    
    // 设置起借日期
    if (applyData.start_time) {
      const startDate = new Date(applyData.start_time);
      const startYear = startDate.getFullYear() + '年';
      const startMonth = (startDate.getMonth() + 1) + '月';
      const startDay = startDate.getDate() + '日';
      
      this.setData({
        startSelectedYear: startYear,
        startSelectedMonth: startMonth,
        startSelectedDay: startDay
      });
      
      this.updateStartDays();
      this.updateStartTimeInFormData(); // 添加这行来更新formData
    }
    
    // 设置归还日期
    if (applyData.end_time) {
      const endDate = new Date(applyData.end_time);
      const endYear = endDate.getFullYear() + '年';
      const endMonth = (endDate.getMonth() + 1) + '月';
      const endDay = endDate.getDate() + '日';
      
      this.setData({
        endSelectedYear: endYear,
        endSelectedMonth: endMonth,
        endSelectedDay: endDay
      });
      
      this.updateEndDays();
      this.updateEndTimeInFormData(); // 添加这行来更新formData
    }
  },

  // 更新字段变更跟踪
  updateChangedField(field, value) {
    console.log(`updateChangedField called with field: ${field}, value:`, value);
    
    // 确保值不是undefined
    if (value === undefined) {
      console.warn(`Field ${field} value is undefined, skipping update`);
      return;
    }
    
    // 比较与原始值是否不同
    if (this.data.originalData[field] !== value) {
      // 字段已变更，添加到变更跟踪对象
      const updatedChangedFields = {
        ...this.data.changedFields,
        [field]: value
      };
      
      this.setData({
        changedFields: updatedChangedFields
      });
      
      console.log(`字段 ${field} 已变更为:`, value);
    } else {
      // 字段值与原始值相同，从变更跟踪中删除
      const changedFields = { ...this.data.changedFields };
      delete changedFields[field];
      this.setData({
        changedFields: changedFields
      });
      console.log(`字段 ${field} 恢复为原始值，已从变更跟踪中移除`);
    }
    
    console.log('当前变更字段:', this.data.changedFields);
  },

  // 表单焦点处理函数
  onLeaderNameFocus() {
    this.setData({ isLeaderNameFocused: true });
  },
  onLeaderNameBlur(e) {
    const value = e.detail.value;
    this.setData({ 
      isLeaderNameFocused: false,
      'formData.name': value
    });
    console.log("newLeaderName: ", value);
    if (this.data.isEdit) {
      this.updateChangedField('name', value);
    }
  },
  
  onGradeFocus() {
    this.setData({ isGradeFocused: true });
  },
  onGradeBlur(e) {
    const value = e.detail.value;
    this.setData({ 
      isGradeFocused: false,
      'formData.student_id': value
    });
    if (this.data.isEdit) {
      this.updateChangedField('student_id', value);
    }
  },
  
  onLeaderPhoneFocus() {
    this.setData({ isLeaderPhoneFocused: true });
  },
  onLeaderPhoneBlur(e) {
    const value = e.detail.value;
    this.setData({ 
      isLeaderPhoneFocused: false,
      'formData.phone_num': value
    });
    if (this.data.isEdit) {
      this.updateChangedField('phone_num', value);
    }
  },
  
  onEmailFocus() {
    this.setData({ isEmailFocused: true });
  },
  onEmailBlur(e) {
    const value = e.detail.value;
    this.setData({ 
      isEmailFocused: false,
      'formData.email': value
    });
    if (this.data.isEdit) {
      this.updateChangedField('email', value);
    }
  },
  
  onDescriptionFocused() {
    this.setData({ isDescriptionFocused: true });
  },
  onDescriptionBlur(e) {
    const value = e.detail.value;
    this.setData({ 
      isDescriptionFocused: false,
      'formData.purpose': value
    });
    if (this.data.isEdit) {
      this.updateChangedField('purpose', value);
    }
  },
  
  onAdvisorNameFocus() {
    this.setData({ isAdvisorNameFocused: true });
  },
  onAdvisorNameBlur(e) {
    const value = e.detail.value;
    this.setData({ 
      isAdvisorNameFocused: false,
      'formData.mentor_name': value
    });
    if (this.data.isEdit) {
      this.updateChangedField('mentor_name', value);
    }
  },
  
  onAdvisorPhoneFocus() {
    this.setData({ isAdvisorPhoneFocused: true });
  },
  onAdvisorPhoneBlur(e) {
    const value = e.detail.value;
    this.setData({ 
      isAdvisorPhoneFocused: false,
      'formData.mentor_phone_num': value
    });
    if (this.data.isEdit) {
      this.updateChangedField('mentor_phone_num', value);
    }
  },

  // 场地选择处理
  onSiteChange(e) {
    const siteIndex = e.detail.value;
    const siteName = this.data.options.site[siteIndex].site_name;
    
    this.setData({
      selectedSiteIndex: siteIndex,
      selectedSiteName: siteName,
      currentNumbers: this.data.options.site[siteIndex].number,
      selectedNumber: '', // 重置编号选择
      'formData.site': siteName
    });
    
    if (this.data.isEdit) {
      this.updateChangedField('site', siteName);
    }
  },
  
  // 场地编号选择处理
  onSiteNumberChange(e) {
    const numberIndex = e.detail.value;
    const number = this.data.currentNumbers[numberIndex];
    
    this.setData({
      selectedNumber: number,
      'formData.number': number
    });
    
    if (this.data.isEdit) {
      this.updateChangedField('number', number);
    }
  },
  
 
  // 起借日期 - 年份选择处理
  onYearChange(e) {
    // 确定是哪个日期选择器触发的事件
    const target = e.currentTarget.dataset.type || 'start';
    const yearIndex = e.detail.value;
    const year = this.data.options.years[yearIndex];
    
    if (target === 'end') {
      this.setData({
        endSelectedYear: year
      });
      this.updateEndDays();
      this.updateEndTimeInFormData();
    } else {
      this.setData({
        startSelectedYear: year
      });
      this.updateStartDays();
      this.updateStartTimeInFormData();
    }
  },

  // 月份选择处理
  onMonthChange(e) {
    // 确定是哪个日期选择器触发的事件
    const target = e.currentTarget.dataset.type || 'start';
    const monthIndex = e.detail.value;
    const month = this.data.options.months[monthIndex];
    
    if (target === 'end') {
      this.setData({
        endSelectedMonth: month
      });
      this.updateEndDays();
      this.updateEndTimeInFormData();
    } else {
      this.setData({
        startSelectedMonth: month
      });
      this.updateStartDays();
      this.updateStartTimeInFormData();
    }
  },

  // 日期选择处理
  onDayChange(e) {
    // 确定是哪个日期选择器触发的事件
    const target = e.currentTarget.dataset.type || 'start';
    const dayIndex = e.detail.value;
    const day = this.data.options.days[dayIndex];
    
    if (target === 'end') {
      this.setData({
        endSelectedDay: day
      });
      this.updateEndTimeInFormData();
    } else {
      this.setData({
        startSelectedDay: day
      });
      this.updateStartTimeInFormData();
    }
  },

  // 更新起借日期数组，根据选择的年月调整天数
  updateStartDays() {
    if (!this.data.startSelectedYear || !this.data.startSelectedMonth) return;
    
    const year = parseInt(this.data.startSelectedYear.replace('年', ''));
    const month = parseInt(this.data.startSelectedMonth.replace('月', ''));
    
    // 获取当月天数
    const daysInMonth = new Date(year, month, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1 + '日');
    
    this.setData({
      'options.days': days,
      startSelectedDay: this.data.startSelectedDay && parseInt(this.data.startSelectedDay) <= daysInMonth ? 
                    this.data.startSelectedDay : days[0]
    });
  },
  
  // 更新归还日期数组，根据选择的年月调整天数
  updateEndDays() {
    if (!this.data.endSelectedYear || !this.data.endSelectedMonth) return;
    
    const year = parseInt(this.data.endSelectedYear.replace('年', ''));
    const month = parseInt(this.data.endSelectedMonth.replace('月', ''));
    
    // 获取当月天数
    const daysInMonth = new Date(year, month, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1 + '日');
    
    this.setData({
      'options.days': days,
      endSelectedDay: this.data.endSelectedDay && parseInt(this.data.endSelectedDay) <= daysInMonth ? 
                  this.data.endSelectedDay : days[0]
    });
  },

  updateStartTimeInFormData() {
    if (!this.data.startSelectedYear || !this.data.startSelectedMonth || !this.data.startSelectedDay) return;
    
    const year = parseInt(this.data.startSelectedYear.replace('年', ''));
    const month = parseInt(this.data.startSelectedMonth.replace('月', ''));
    const day = parseInt(this.data.startSelectedDay.replace('日', ''));
    
    // 格式化为YYYY-MM-DD
    const formattedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    
    this.setData({
      'formData.start_time': formattedDate
    });
    
    if (this.data.isEdit) {
      // 直接使用formattedDate，不要从this.data中读取
      this.updateChangedField('start_time', formattedDate);
      console.log('更新起借日期:', formattedDate);
    }
},

  // 更新formData中的end_time
  updateEndTimeInFormData() {
      if (!this.data.endSelectedYear || !this.data.endSelectedMonth || !this.data.endSelectedDay) return;
      
      const year = parseInt(this.data.endSelectedYear.replace('年', ''));
      const month = parseInt(this.data.endSelectedMonth.replace('月', ''));
      const day = parseInt(this.data.endSelectedDay.replace('日', ''));
      
      // 格式化为YYYY-MM-DD
      const formattedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      
      this.setData({
        'formData.end_time': formattedDate
      });
      
      if (this.data.isEdit) {
        // 直接使用formattedDate，不要从this.data中读取
        this.updateChangedField('end_time', formattedDate);
        console.log('更新归还日期:', formattedDate);
      }
  },

  // 显示场地编号规则
  showSiteNumberRule() {
    wx.showModal({
      title: '场地编号规则',
      content: '每个场地有不同数量的编号，请根据需求选择合适的场地和编号。',
      showCancel: false
    });
  },
  
  // 表单验证
  validateForm() {
    this.setData({ isValid: true }); // 重置验证状态
    const { formData } = this.data;
    
    if (!formData.name) {
      wx.showToast({ title: '请输入借用人姓名', icon: 'none' });
      this.setData({ isValid: false });
      return false;
    }
    
    if (!formData.student_id) {
      wx.showToast({ title: '请输入借用人学号', icon: 'none' });
      this.setData({ isValid: false });
      return false;
    }
    
    if (!formData.phone_num) {
      wx.showToast({ title: '请输入借用人电话', icon: 'none' });
      this.setData({ isValid: false });
      return false;
    }
    
    if (!formData.email) {
      wx.showToast({ title: '请输入借用人邮箱', icon: 'none' });
      this.setData({ isValid: false });
      return false;
    }
    
    if (!formData.purpose) {
      wx.showToast({ title: '请输入借用用途', icon: 'none' });
      this.setData({ isValid: false });
      return false;
    }
    
    if (!formData.mentor_name) {
      wx.showToast({ title: '请输入指导老师姓名', icon: 'none' });
      this.setData({ isValid: false });
      return false;
    }
    
    if (!formData.mentor_phone_num) {
      wx.showToast({ title: '请输入指导老师电话', icon: 'none' });
      this.setData({ isValid: false });
      return false;
    }
    
    if (!this.data.selectedSiteName) {
      wx.showToast({ title: '请选择场地', icon: 'none' });
      this.setData({ isValid: false });
      return false;
    }
    
    if (!this.data.selectedNumber) {
      wx.showToast({ title: '请选择场地编号', icon: 'none' });
      this.setData({ isValid: false });
      return false;
    }
    
    if (!this.data.startSelectedYear || !this.data.startSelectedMonth || !this.data.startSelectedDay) {
      wx.showToast({ title: '请选择起借日期', icon: 'none' });
      this.setData({ isValid: false });
      return false;
    }
    
    if (!this.data.endSelectedYear || !this.data.endSelectedMonth || !this.data.endSelectedDay) {
      wx.showToast({ title: '请选择归还日期', icon: 'none' });
      this.setData({ isValid: false });
      return false;
    }
    
    // 验证归还日期是否晚于起借日期
    // 使用字符串比较代替Date对象（格式为YYYY-MM-DD）
    if (this.data.formData.end_time <= this.data.formData.start_time) {
      wx.showToast({ 
        title: `归还日期(${this.data.formData.end_time})必须晚于起借日期(${this.data.formData.start_time})`, 
        icon: 'none' 
      });
      this.setData({ isValid: false });
    }
    
    return true;
  },
  
  // 提交表单
  onSubmit() {
    // 验证表单
    if (!this.data.isValid) {
      wx.hideLoading();
      return;
    }
    
    wx.showLoading({ title: '提交中...' });
    
    // 准备提交的数据，统一格式
    const submitData = {
      name: this.data.formData.name,
      student_id: this.data.formData.student_id,
      phonenum: this.data.formData.phone_num, // 注意字段名改为 phonenum
      email: this.data.formData.email,
      purpose: this.data.formData.purpose,
      project_id: this.data.formData.project_id || '',
      mentor_name: this.data.formData.mentor_name,
      mentor_phone_num: this.data.formData.mentor_phone_num,
      site: this.data.selectedSiteName,
      number: this.data.selectedNumber,
      start_time: this.data.formData.start_time,
      end_time: this.data.formData.end_time
    };
    
    // 根据是否是编辑模式选择不同的API
    if (this.data.isEdit) {
      // 编辑模式，发送完整表单数据
      console.log('提交的编辑数据:', submitData);
      
      if (DEBUG) {
        // 模拟API调用
        setTimeout(() => {
          const mockResponse = {
            code: 200,
            message: "successfully update application",
            data: {
              apply_id: this.data.apply_id,
              changed: submitData
            }
          };
          
          if (mockResponse.code === 200) {
            wx.showToast({
              title: '修改成功',
              icon: 'success',
              duration: 1500,
              success: () => {
                setTimeout(() => {
                  wx.navigateBack({ delta: 1 });
                }, 1500);
              }
            });
            console.log('修改成功，提交数据:', submitData);
          } else {
            wx.showToast({
              title: mockResponse.message || '修改失败',
              icon: 'none'
            });
          } 
          wx.hideLoading();
        }, 1000); // 模拟网络延迟
      } else {
        wx.request({
          url: `${API_BASE}/site-borrow/update/${this.data.apply_id}`,
          method: 'PATCH', // 保持 PATCH 方法，因为接口通常用于更新
          header: {
            'content-type': 'application/json',
            'Authorization': wx.getStorageSync('token')
          },
          data: submitData,
          success: (res) => {
            if (res.data.code === 200) {
              wx.showToast({
                title: '修改成功',
                icon: 'success',
                duration: 1500,
                success: () => {
                  setTimeout(() => {
                    wx.navigateBack({ delta: 1 });
                  }, 1500);
                }
              });
              console.log("修改成功，提交数据:", submitData);
            } else {
              wx.showToast({
                title: res.data.message || '修改失败',
                icon: 'none'
              });
            }
          },
          fail: (err) => {
            console.error('请求失败:', err);
            wx.showToast({
              title: '网络错误，请重试',
              icon: 'none'
            });
          },
          complete: () => {
            wx.hideLoading();
          }
        });
      }
    } else {
      // 新申请模式，发送完整表单（逻辑不变）
      console.log('提交的新申请数据:', submitData);
      
      if (DEBUG) {
        // 模拟API调用
        setTimeout(() => {
          const mockResponse = {
            code: 200,
            message: "successfully create new site-application",
            data: {
              event_id: "LB" + Date.now()
            }
          };
          
          if (mockResponse.code === 200) {
            wx.showToast({
              title: '申请成功',
              icon: 'success',
              duration: 1500,
              success: () => {
                setTimeout(() => {
                  wx.navigateBack({ delta: 1 });
                }, 1500);
              }
            });
            console.log('提交的新申请数据:', submitData);
          } else {
            wx.showToast({
              title: mockResponse.message || '申请失败',
              icon: 'none'
            });
          }
          
          wx.hideLoading();
        }, 1000); // 模拟网络延迟
      } else {
        wx.request({
          url: `${API_BASE}/site-borrow/post`,
          method: 'POST',
          header: {
            'content-type': 'application/json',
            'Authorization': wx.getStorageSync('token')
          },
          data: submitData,
          success: (res) => {
            if (res.data.code === 200) {
              wx.showToast({
                title: '申请成功',
                icon: 'success',
                duration: 1500,
                success: () => {
                  setTimeout(() => {
                    wx.navigateBack({ delta: 1 });
                  }, 1500);
                }
              });
            } else {
              wx.showToast({
                title: res.data.message || '申请失败',
                icon: 'none'
              });
            }
          },
          fail: (err) => {
            console.error('请求失败:', err);
            wx.showToast({
              title: '网络错误，请重试',
              icon: 'none'
            });
          },
          complete: () => {
            wx.hideLoading();
          }
        });
      }
    }
  },
  
  // 返回处理
  handlerGobackClick() {
    wx.showModal({
      title: '确认返回',
      content: '返回将丢失已填写的内容，是否确认？',
      success: (res) => {
        if (res.confirm) {
          wx.navigateBack({ delta: 1 });
        }
      }
    });
  },
  
  // 返回首页
  handlerGohomeClick() {
    wx.showModal({
      title: '返回首页',
      content: '返回首页将丢失已填写的内容，是否确认？',
      success: (res) => {
        if (res.confirm) {
          wx.switchTab({ url: '/pages/index/index' });
        }
      }
    });
  }
})
