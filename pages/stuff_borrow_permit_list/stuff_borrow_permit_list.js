const API_BASE = 'http://146.56.227.73:8000';
const TOKEN_KEY = 'auth_token';

Page({
  data: {
    unreviewedList: [],
    approvedList: [],
    returnedList: [],
    loading: false,
    currentSort: 'default',
    sortText: '默认',
    isFolded: true,
    tab: 0,
    stats: {
      total: 0,
      pending: 0,
      approved: 0,
      borrowed: 0,
      returned: 0,
      rejected: 0,
      overdue: 0
    }
  },

  onLoad() {
    this.loadBorrowApplies();
  },

  onShow() {
    this.loadBorrowApplies();
  },

  loadBorrowApplies() {
    const token = wx.getStorageSync(TOKEN_KEY);
    if (!token) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }

    this.setData({ loading: true });

    wx.request({
      url: `${API_BASE}/stuff-borrow/view-all`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      success: (res) => {
        if (res.data && res.data.code === 200) {
          const records = res.data.data.records || [];
          const stats = { total: res.data.data.total || records.length };
          this.processBorrowData(records, stats);
        } else {
          wx.showToast({ title: res.data.message || '数据错误', icon: 'none' });
        }
      },
      fail: () => {
        wx.showToast({ title: '网络请求失败', icon: 'none' });
      },
      complete: () => {
        this.setData({ loading: false });
      }
    });
  },

  processBorrowData(borrowList, stats) {
    const unreviewedList = [], approvedList = [], returnedList = [], rejectedList = [], overdueList = [];

    const statusPosterMap = {
      0: '/images/object_borrow_list/pending.png',
      1: '/images/object_borrow_list/approved.png',
      2: '/images/object_borrow_list/borrowed.png',
      3: '/images/object_borrow_list/returned.png',
      4: '/images/object_borrow_list/rejected.png',
      5: '/images/object_borrow_list/overdue.png'
    };

    borrowList.forEach(item => {
      const record = {
        event_id: item.sb_id || '',
        event_name: item.task_name || '未命名申请',
        name: item.name || '未知申请人',
        start_str: '申请时间',
        start_time: item.start_time ? item.start_time.split('T')[0] : '未知时间',
        deadline: item.deadline ? item.deadline.split('T')[0] : '未设置',
        type: item.type === 1 ? '团队' : '个人',
        originalType: item.type,
        status: item.state,
        status_desc: this.mapStateToText(item.state),
        materials_count: item.materials ? item.materials.length : 0,
        materials_summary: '未知',
        phone: item.phone || '',
        email: item.email || '',
        grade: item.grade || '',
        major: item.major || '',
        poster: statusPosterMap[item.state] || '/images/object_borrow_list/1.png',
        project_number: item.project_number || '',
        supervisor_name: item.supervisor_name || '',
        supervisor_phone: item.supervisor_phone || ''
      };

      switch (item.state) {
        case 0: unreviewedList.push(record); break;
        case 1:
        case 2: approvedList.push(record); break;
        case 3: returnedList.push(record); break;
        case 4: rejectedList.push(record); break;
        case 5: overdueList.push(record); break;
        default: console.warn('未知状态:', item.state);
      }
    });

    this.setData({
      unreviewedList,
      approvedList,
      returnedList,
      stats: stats || this.data.stats
    });

    this.sortAllLists();
  },

  mapStateToText(state) {
    switch (state) {
      case 0: return '待审批';
      case 1: return '已批准';
      case 2: return '已借出';
      case 3: return '已归还';
      case 4: return '已拒绝';
      case 5: return '已过期';
      default: return '未知状态';
    }
  },

  sortAllLists() {
    this.sortCurrentList('unreviewedList');
    this.sortCurrentList('approvedList');
    this.sortCurrentList('returnedList');
  },

  sortCurrentList(targetListName) {
    if (this.data.currentSort === 'default') return;
    const list = this.data[targetListName];
    if (!list || list.length === 0) return;

    const sorted = list.slice().sort((a, b) => {
      if (this.data.currentSort === 'asc') {
        return a.start_time.localeCompare(b.start_time);
      } else {
        return b.start_time.localeCompare(a.start_time);
      }
    });

    this.setData({ [targetListName]: sorted });
  },

  changeItem(e) {
    this.setData({ tab: parseInt(e.currentTarget.dataset.item) });
  },

  onSwiperChange(e) {
    this.setData({ tab: e.detail.current });
  },

  toggleSortDropdown() {
    this.setData({ isFolded: !this.data.isFolded });
  },

  selectSort(e) {
    const value = e.currentTarget.dataset.value;
    const targetList = ['unreviewedList', 'approvedList', 'returnedList'][this.data.tab];

    this.setData({
      currentSort: value,
      sortText: value === 'default' ? '默认' : value === 'asc' ? '正序' : '逆序',
      isFolded: true
    }, () => {
      this.sortCurrentList(targetList);
    });
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

  navigateToDetail(e) {
    const dataset = e.currentTarget.dataset || {};
    const borrowId = dataset.eventId || dataset.eventid || dataset['event-id'];
    const originalType = dataset.originalType || dataset.originaltype || dataset['original-type'];

    if (!borrowId) {
      wx.showToast({ title: '缺少申请ID', icon: 'none' });
      return;
    }

    let url = originalType === 1 || originalType === '1'
      ? `/pages/team_stuff_borrow_permit/team_stuff_borrow_permit?borrow_id=${borrowId}`
      : `/pages/personal_stuff_borrow_permit/personal_stuff_borrow_permit?borrow_id=${borrowId}`;

    wx.navigateTo({
      url,
      fail: () => {
        wx.showToast({ title: '页面跳转失败', icon: 'none' });
      }
    });
  },

  onPullDownRefresh() {
    this.loadBorrowApplies();
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1500);
  }
});
