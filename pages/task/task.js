const API_BASE = 'http://146.56.227.73:8000'
const TOKEN_KEY = 'auth_token'
const token = wx.getStorageSync(TOKEN_KEY)

Page({
  data: {  
    apiData: { // 统一存储要提交到API的数据
      task_type: null,
      name: '',
      department: null,
      maker_id: '',
      content: '',
      deadline: ''
    },
    taskTypes: [
      { label: '其他', value: 0 },
      { label: '活动文案', value: 1 },
      { label: '推文', value: 2 },
      { label: '新闻稿', value: 3 }
    ],
    departments: [
      { label: '基管部', value: 0 },
      { label: '宣传部', value: 1 },
      { label: '运维部', value: 2 },
      { label: '项目部', value: 3 },
      { label: '副会', value: 4 },
      { label: '会长', value: 5 }
    ],
    makersData: [], // 存储从接口获取的完整部门成员数据
    currentMakersData: [], // 存储当前负责人数据
    currentMakers: [], // 当前选中部门的负责人列表
    selectedTaskType: '',
    selectedDepartment: '',
    selectedMaker: '',
    years: Array.from({ length: 10 }, (_, i) => 2024 + i + '年'),
    months: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    days: Array.from({ length: 31 }, (_, i) => i + 1 + '日'),
    hours: Array.from({ length: 24 }, (_, i) => i + '时'),
    minutes: Array.from({ length: 60 }, (_, i) => i + '分'),
    selectedYear: null,
    selectedMonth: null,
    selectedDay: null,
    selectedHour: null,
    selectedMinute: null,
    isDescriptionFocused: false,
    isDirectorFocused: false,
    task_id: null, // 存储任务ID
    isEditMode: false // 标识是否为编辑模式
  },

  onLoad(options) {
    console.log('页面加载，options:', options);
    
    // 检查是否有taskId参数传递
    if (options.taskId) {
      this.setData({
        task_id: options.taskId,
        isEditMode: true
      });
    }
    
    // 初始化数据加载
    this.initializeData();
  },

  // 初始化数据加载
  async initializeData() {
    try {
      // 并行获取所有部门成员和当前负责人数据
      await Promise.all([
        this.getMakersData(),
        this.getCurrentMakersData()
      ]);
      
      // 如果是编辑模式，获取任务详情
      if (this.data.isEditMode) {
        await this.getTaskDetail(this.data.task_id);
      }
    } catch (error) {
      console.error('初始化数据失败:', error);
      wx.showToast({
        title: '数据加载失败',
        icon: 'none'
      });
    }
  },

  // 获取所有部门成员数据
  getMakersData() {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${API_BASE}/users/get-makers`,
        method: 'GET',
        header: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        success: (res) => {
          console.log('获取部门成员数据成功:', res.data);
          if (res.data.code === 200 && res.data.list) {
            this.setData({
              makersData: res.data.list
            });
            resolve(res.data.list);
          } else {
            reject(new Error('获取部门成员数据失败'));
          }
        },
        fail: (err) => {
          console.error('获取部门成员数据失败:', err);
          reject(err);
        }
      });
    });
  },

  // 获取当前负责人数据
  getCurrentMakersData() {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${API_BASE}/arrange/get-current`,
        method: 'GET',
        header: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        success: (res) => {
          console.log('获取当前负责人数据成功:', res.data);
          if (res.data.code === 200 && res.data.data) {
            this.setData({
              currentMakersData: res.data.data
            });
            resolve(res.data.data);
          } else {
            reject(new Error('获取当前负责人数据失败'));
          }
        },
        fail: (err) => {
          console.error('获取当前负责人数据失败:', err);
          reject(err);
        }
      });
    });
  },

  // 获取任务详情
  getTaskDetail(taskId) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${API_BASE}/tasks/detail/${taskId}`,
        method: 'GET',
        header: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        success: (res) => {
          console.log('获取任务详情成功:', res.data);
          if (res.data) {
            this.populateFormData(res.data);
            resolve(res.data);
          } else {
            reject(new Error('获取任务详情失败'));
          }
        },
        fail: (err) => {
          console.error('获取任务详情失败:', err);
          reject(err);
        }
      });
    });
  },

  // 预填充表单数据
  populateFormData(taskData) {
    const { task_id, task_type, department, maker_id, name, content, deadline } = taskData;
    
    // 解析deadline时间
    const deadlineDate = new Date(deadline);
    const year = deadlineDate.getFullYear() + '年';
    const month = (deadlineDate.getMonth() + 1) + '月';
    const day = deadlineDate.getDate() + '日';
    const hour = deadlineDate.getHours() + '时';
    const minute = deadlineDate.getMinutes() + '分';
    
    // 获取任务类型标签
    const taskTypeObj = this.data.taskTypes.find(type => type.value === task_type);
    const taskTypeLabel = taskTypeObj ? taskTypeObj.label : '';
    
    // 获取部门标签
    const departmentObj = this.data.departments.find(dept => dept.value === department);
    const departmentLabel = departmentObj ? departmentObj.label : '';
    
    // 更新页面数据和apiData
    this.setData({
      selectedTaskType: taskTypeLabel,
      selectedDepartment: departmentLabel,
      selectedMaker: name,
      selectedYear: year,
      selectedMonth: month,
      selectedDay: day,
      selectedHour: hour,
      selectedMinute: minute,
      apiData: {
        task_type: task_type,
        name: name,
        department: department,
        maker_id: maker_id,
        content: content,
        deadline: deadline
      }
    });
    
    // 根据部门更新当前负责人列表
    this.updateCurrentMakersByDepartment(department);
    
    console.log('表单数据预填充完成');
  },

  // 任务类型选择改变
  onTaskTypeChange(e) {
    const taskTypeIndex = parseInt(e.detail.value);
    const taskType = this.data.taskTypes[taskTypeIndex];
    
    this.setData({
      selectedTaskType: taskType.label,
      apiData: {
        ...this.data.apiData,
        task_type: taskType.value
      }
    });
    
    // 自动加载对应的当前负责人
    this.loadCurrentMakerByTaskType(taskType.value);
    
    console.log('选中任务类型:', taskType);
  },

  // 根据任务类型加载当前负责人
  loadCurrentMakerByTaskType(taskType) {
    const currentMaker = this.data.currentMakersData.find(maker => maker.task_type === taskType);
    
    if (currentMaker) {
      // 找到对应的部门信息
      const departmentObj = this.data.departments.find(dept => {
        // 需要根据maker_id在makersData中查找对应的部门
        return this.data.makersData.some(deptData => 
          deptData.department === dept.value && 
          deptData.makers.some(maker => maker.maker_id === currentMaker.maker_id)
        );
      });
      
      if (departmentObj) {
        this.setData({
          selectedDepartment: departmentObj.label,
          selectedMaker: currentMaker.name,
          apiData: {
            ...this.data.apiData,
            department: departmentObj.value,
            name: currentMaker.name,
            maker_id: currentMaker.maker_id
          }
        });
        
        // 更新当前部门的负责人列表
        this.updateCurrentMakersByDepartment(departmentObj.value);
      }
      
      console.log('自动加载当前负责人:', currentMaker);
    }
  },

  // 部门选择改变
  onDepartmentChange(e) {
    const departmentIndex = parseInt(e.detail.value);
    const department = this.data.departments[departmentIndex];
    
    this.setData({
      selectedDepartment: department.label,
      selectedMaker: '', // 重置负责人选择
      apiData: {
        ...this.data.apiData,
        department: department.value,
        name: '',
        maker_id: ''
      }
    });
    
    // 更新当前部门的负责人列表
    this.updateCurrentMakersByDepartment(department.value);
    
    console.log('选中部门:', department);
  },

  // 根据部门更新当前负责人列表
  updateCurrentMakersByDepartment(departmentValue) {
    const departmentData = this.data.makersData.find(item => item.department === departmentValue);
    
    let currentMakers = [];
    if (departmentData && departmentData.makers) {
      currentMakers = departmentData.makers;
    }
    
    this.setData({
      currentMakers: currentMakers
    });
    
    console.log('更新部门负责人列表:', currentMakers);
  },

  // 负责人选择改变
  onMakerChange(e) {
    const makerIndex = parseInt(e.detail.value);
    const selectedMaker = this.data.currentMakers[makerIndex];
    
    if (selectedMaker) {
      this.setData({
        selectedMaker: selectedMaker.name,
        apiData: {
          ...this.data.apiData,
          name: selectedMaker.name,
          maker_id: selectedMaker.maker_id
        }
      });
      
      console.log('选中负责人:', selectedMaker);
    }
  },

  // 通用输入处理
  onInput(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    
    this.setData({
      apiData: {
        ...this.data.apiData,
        [field]: value
      }
    });
  },

  // 时间选择器事件处理
  onYearChange(e) {
    this.setData({
      selectedYear: this.data.years[e.detail.value]
    });
  },

  onMonthChange(e) {
    this.setData({
      selectedMonth: this.data.months[e.detail.value]
    });
  },

  onDayChange(e) {
    this.setData({
      selectedDay: this.data.days[e.detail.value]
    });
  },

  onHourChange(e) {
    this.setData({
      selectedHour: this.data.hours[e.detail.value]
    });
  },

  onMinuteChange(e) {
    this.setData({
      selectedMinute: this.data.minutes[e.detail.value]
    });
  },

  // 焦点处理事件
  onDescriptionFocused() {
    this.setData({
      isDescriptionFocused: true
    });
  },

  onDescriptionBlur() {
    this.setData({
      isDescriptionFocused: false
    });
  },

  onSubmit() {
    console.log('调试信息 - 当前数据状态:');
    console.log('apiData:', this.data.apiData);
    console.log('编辑模式:', this.data.isEditMode);
    
    const { task_name, name, maker_id, content, deadline } = this.data.apiData;
    const { selectedYear, selectedMonth, selectedDay, selectedHour, selectedMinute } = this.data;
    
    if (!task_name || !name || !maker_id || !content || !selectedYear || !selectedMonth || !selectedDay || !selectedHour || !selectedMinute) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none',
      });
      return;
    }
    
    // 格式化 deadline
    const formattedDeadline = `${selectedYear}-${selectedMonth}-${selectedDay} ${selectedHour}:${selectedMinute}`;
    
    // 更新 apiData 中的 deadline
    this.setData({
      apiData: {
        ...this.data.apiData,
        deadline: formattedDeadline
      }
    });
    
    console.log('任务信息:', this.data.apiData);
    
    // 根据是否为编辑模式选择不同的接口
    const apiUrl = this.data.isEditMode 
      ? `${API_BASE}/api/tasks/${this.data.task_id}` 
      : `${API_BASE}/api/tasks`;
    const method = this.data.isEditMode ? 'PUT' : 'POST';
    
    wx.request({
      url: apiUrl,
      method: method,
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      data: {
        ...this.data.apiData,
        priority: 2 // 添加优先级字段
      },
      success: (res) => {
        console.log(`任务${this.data.isEditMode ? '更新' : '创建'}成功:`, res.data);
        wx.showToast({
          title: `任务${this.data.isEditMode ? '更新' : '创建'}成功`,
          icon: 'success'
        });
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      },
      fail: (err) => {
        console.error(`任务${this.data.isEditMode ? '更新' : '创建'}失败:`, err);
        wx.showToast({
          title: `${this.data.isEditMode ? '更新' : '创建'}失败,请稍后重试`,
          icon: 'none'
        });
      }
    });
  }
});
