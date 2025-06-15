const API_BASE = 'http://146.56.227.73:8000';
const TOKEN_KEY = 'auth_token';

function parseDate(dateStr) {
  try {
    if (!dateStr) return { year: '----', month: '--', day: '--' };
    const clean = dateStr.split('.')[0]; // 去除微秒
    const date = new Date(clean);
    if (isNaN(date)) throw new Error('Invalid date');
    return {
      year: date.getFullYear().toString(),
      month: (date.getMonth() + 1).toString().padStart(2, '0'),
      day: date.getDate().toString().padStart(2, '0')
    };
  } catch {
    return { year: '----', month: '--', day: '--' };
  }
}

Page({
  data: {
    borrowId: '',
    replyReason: '',
    loading: true,
    isLinkFocused: false,
    applyDetail: {},
    borrowTime: {},
    returnTime: {},
    materialsList: []
  },

  onLoad(options) {
    const borrowId = options?.borrow_id;
    if (!borrowId) {
      wx.showToast({ title: '缺少申请ID', icon: 'none' });
      setTimeout(() => wx.navigateBack(), 1500);
      return;
    }
    this.setData({ borrowId }, () => this.loadDetail());
  },

  loadDetail() {
    const token = wx.getStorageSync(TOKEN_KEY);
    if (!token) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }

    this.setData({ loading: true });

    wx.request({
      url: `${API_BASE}/stuff-borrow/detail/${this.data.borrowId}`,
      method: 'GET',
      header: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      success: res => {
        const detail = res.data?.data;
        if (!detail || res.data.code !== 200) {
          wx.showToast({ title: res.data?.message || '获取失败', icon: 'none' });
          return;
        }

        const statusMap = {
          0: '未审核',
          1: '已通过',
          2: '已打回',
          3: '已归还'
        };

        const materialsList = Array.isArray(detail.stuff_list)
          ? detail.stuff_list.map((m, i) => ({ id: i, text: m.stuff || '未知物资' }))
          : Array.isArray(detail.materials)
            ? detail.materials.map((m, i) => ({ id: i, text: typeof m === 'string' ? m : JSON.stringify(m) }))
            : [];

        this.setData({
          applyDetail: {
            borrow_id: detail.borrow_id,
            task_name: detail.task_name || '',
            name: detail.name || '',
            student_id: detail.student_id || '',
            phone_num: detail.phone_num || '',
            email: detail.email || '',
            grade: detail.grade || '',
            major: detail.major || '',
            project_id: detail.project_id || detail.project_number || '',
            advisor_name: detail.advisor_name || detail.supervisor_name || '',
            advisor_phone: detail.advisor_phone || detail.supervisor_phone || '',
            content: detail.content || '',
            materials: detail.materials || [],
            created_at: detail.created_at || '',
            deadline: detail.deadline || '',
            status: detail.status ?? 0,
            status_desc: statusMap[detail.status ?? 0] || '未知状态',
            type: detail.type || 1
          },
          borrowTime: parseDate(detail.start_time),
          returnTime: parseDate(detail.deadline),
          materialsList,
          loading: false
        });
      },
      fail: () => {
        wx.showToast({ title: '请求失败', icon: 'none' });
        this.setData({ loading: false });
      }
    });
  },

  onInput(e) {
    this.setData({ replyReason: e.detail.value });
  },

  onSubmit(e) {
    const action = e.currentTarget.dataset.action;
    if (action === 'reject' && !this.data.replyReason.trim()) {
      wx.showToast({ title: '请输入打回理由', icon: 'none' });
      return;
    }

    wx.showModal({
      title: '确认操作',
      content: action === 'approve' ? '确认通过？' : '确认打回？',
      success: res => {
        if (res.confirm) this.submitReview(action);
      }
    });
  },

  submitReview(action) {
    const token = wx.getStorageSync(TOKEN_KEY);
    if (!token) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '提交中...' });

    wx.request({
      url: `${API_BASE}/borrow/applies/${this.data.borrowId}/review`,
      method: 'POST',
      header: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: {
        action,
        reason: this.data.replyReason || ''
      },
      success: res => {
        wx.hideLoading();
        if (res.statusCode === 200) {
          wx.showToast({
            title: action === 'approve' ? '审核通过' : '已打回',
            icon: 'success'
          });
          setTimeout(() => wx.navigateBack(), 1500);
        } else {
          wx.showToast({ title: res.data?.message || '操作失败', icon: 'none' });
        }
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({ title: '网络错误', icon: 'none' });
      }
    });
  },

  handlerGobackClick() {
    wx.navigateBack({ fail: () => wx.switchTab({ url: '/pages/index/index' }) });
  },

  handlerGohomeClick() {
    wx.switchTab({
      url: '/pages/index/index',
      fail: () => wx.navigateTo({ url: '/pages/index/index' })
    });
  },

  onPullDownRefresh() {
    this.loadDetail();
    setTimeout(() => wx.stopPullDownRefresh(), 1500);
  },

  onLinkFocused() {
    this.setData({ isLinkFocused: true });
  },

  onLinkBlur() {
    this.setData({ isLinkFocused: false });
  },

  onShareAppMessage() {
    return {
      title: '团队借物申请详情',
      path: '/pages/team_stuff_borrow_permit/team_stuff_borrow_permit?borrow_id=' + this.data.borrowId
    };
  }
});
