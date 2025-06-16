const API_BASE = 'http://146.56.227.73:8000';
const TOKEN_KEY = 'auth_token';

function parseDate(dateStr) {
  try {
    if (!dateStr) return { year: '----', month: '--', day: '--' };
    const clean = dateStr.split('.')[0];
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
          3: '已借出'
        };

        const materialsList = Array.isArray(detail.stuff_list)
          ? detail.stuff_list.map((m, i) => ({ id: i, text: m.stuff || '未知物资' }))
          : Array.isArray(detail.materials)
            ? detail.materials.map((m, i) => ({ id: i, text: typeof m === 'string' ? m : JSON.stringify(m) }))
            : [];

        this.setData({
          applyDetail: {
            borrow_id: detail.sb_id || detail.borrow_id || '',
            task_name: detail.task_name || '',
            name: detail.name || '',
            student_id: detail.student_id || '',
            phone_num: detail.phone_num || '',
            email: detail.email || '',
            grade: detail.grade || '',
            major: detail.major || '',
            project_id: detail.project_num || detail.project_id || '',
            advisor_name: detail.mentor_name || detail.advisor_name || '',
            advisor_phone: detail.mentor_phone_num || detail.advisor_phone || '',
            content: detail.reason || detail.content || '',
            materials: detail.materials || [],
            created_at: detail.created_at || '',
            deadline: detail.deadline || '',
            status: detail.state ?? 0,
            status_desc: statusMap[detail.state ?? 0] || '未知状态',
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
    const action = e.currentTarget.dataset.action || '通过';
    const isApprove = action === 'approve' || action.indexOf('通过') !== -1;
    const isReject = action === 'reject' || action.indexOf('打回') !== -1;
  
    if (isReject && !this.data.replyReason.trim()) {
      wx.showToast({ title: '请输入打回理由', icon: 'none' });
      return;
    }
  
    wx.showModal({
      title: '确认操作',
      content: isApprove ? '确认通过此申请？物资余量将自动减少。' : '确认打回此申请？',
      success: res => {
        if (res.confirm) {
          this.submitReview(isApprove);
        }
      }
    });
  },
  

  submitReview(isApprove) {
    const token = wx.getStorageSync(TOKEN_KEY);
    if (!token) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }

    const submitData = {
      borrow_id: this.data.borrowId,
      action: isApprove ? 'approve' : 'reject',
      reason: isApprove ? '' : this.data.replyReason
    };

    wx.showLoading({ title: '处理中...' });

    wx.request({
      url: `${API_BASE}/stuff-borrow/review`,
      method: 'POST',
      data: submitData,
      header: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      success: res => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          if (isApprove) {
            this.updateStuffQuantity();
          } else {
            wx.hideLoading();
            wx.showToast({
              title: '已打回',
              icon: 'success'
            });
            setTimeout(() => wx.navigateBack(), 1500);
          }
        } else {
          wx.hideLoading();
          wx.showToast({
            title: res.data?.message || '操作失败',
            icon: 'none'
          });
        }
      },
      fail: err => {
        wx.hideLoading();
        wx.showToast({ title: '网络错误', icon: 'none' });
      }
    });
  },
  handlerGobackClick() {
    wx.navigateBack();
  },
  
  handlerGohomeClick() {
    wx.reLaunch({
      url: '/pages/index/index'  // 替换成你的首页路径
    });
  },
  
  updateStuffQuantity() {
    const token = wx.getStorageSync(TOKEN_KEY);
    wx.request({
      url: `${API_BASE}/stuff-borrow/auto-update-quantity/${this.data.borrowId}`,
      method: 'POST',
      header: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      success: res => {
        wx.hideLoading();
        if (res.statusCode === 200 && res.data && res.data.code === 200) {
          const updateData = res.data.data;
          let successMessage = '审核通过';
          if (updateData.successful_updates > 0) {
            successMessage += `，已更新${updateData.successful_updates}个物资的余量`;
          }
          if (updateData.failed_count > 0) {
            successMessage += `，${updateData.failed_count}个物资更新失败`;
          }

          wx.showToast({
            title: successMessage,
            icon: updateData.failed_count > 0 ? 'none' : 'success',
            duration: 2000
          });

          if (updateData.updated_stuff && updateData.updated_stuff.length > 0) {
            setTimeout(() => {
              let detailMessage = '物资余量更新详情:\n';
              updateData.updated_stuff.forEach(item => {
                detailMessage += `${item.stuff_name}: ${item.old_remain} → ${item.new_remain}\n`;
              });
              wx.showModal({
                title: '更新详情',
                content: detailMessage,
                showCancel: false,
                success: () => {
                  wx.navigateBack();
                }
              });
            }, 2000);
          } else {
            setTimeout(() => wx.navigateBack(), 2000);
          }

        } else {
          wx.showModal({
            title: '提示',
            content: '审核通过，但物资余量更新失败。请手动检查物资库存。',
            showCancel: false,
            success: () => {
              wx.navigateBack();
            }
          });
        }
      },
      fail: err => {
        wx.hideLoading();
        wx.showModal({
          title: '提示',
          content: '审核通过，但物资余量更新失败。请手动检查物资库存。',
          showCancel: false,
          success: () => {
            wx.navigateBack();
          }
        });
      }
    });
  }
});
