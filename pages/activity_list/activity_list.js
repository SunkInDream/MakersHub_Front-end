// pages/activity_list/activity_list.js
const API_BASE = "http://146.56.227.73:8000";

Page({
  data: {
    events: [],          // 初始化空数组
    sortText: '默认',    // 排序文本
    currentSort: 'default',  // 当前排序方式
    isFolded: true,      // 下拉菜单状态
    posters: []          // 轮播图数据
  },

  onLoad: function (options) {
    this.fetchEvents();
  },

  // 从后端获取活动列表
  fetchEvents: function() {
    wx.showLoading({
      title: '加载中...',
    });

    wx.request({
      url: `${API_BASE}/events/view`,
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200 && res.data && res.data.data && res.data.data.events) {
          const events = res.data.data.events.map(event => ({
            ...event,
            // 格式化日期显示
            start_time: this.formatDate(event.start_time)
          }));

          // 提取轮播图数据 (使用所有活动或最多4个)
          const posterCount = Math.min(events.length, 4);
          const posters = events.slice(0, posterCount).map((item, index) => ({
            id: index + 1,
            image: item.poster
          }));

          this.setData({
            events: events,
            items: events,
            posters: posters
          });

          console.log("成功获取活动列表:", events);
        } else {
          console.error("获取活动列表失败:", res);
          wx.showToast({
            title: '获取活动列表失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error("请求失败:", err);
        wx.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
      },
      complete: () => {
        wx.hideLoading();
      }
    });
  },

  // 格式化ISO日期为易读格式
  formatDate: function(isoString) {
    if (!isoString) return '';
    
    const date = new Date(isoString);
    
    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      return isoString; // 返回原始字符串
    }
    
    // 格式化为 YYYY/MM/DD HH:MM
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${year}/${month}/${day} ${hours}:${minutes}`;
  },

  // 确保有足够的轮播图
  ensureFourPosters: function() {
    const { posters, events } = this.data;
    if (posters.length >= 4) return;
    
    const needed = 4 - posters.length;
    // 可能需要重复使用一些图片
    let additionalPosters = [];
    for (let i = 0; i < needed; i++) {
      const eventIndex = i % events.length;
      additionalPosters.push({
        id: posters.length + i + 1,
        image: events[eventIndex].poster
      });
    }
    
    this.setData({
      posters: [...posters, ...additionalPosters]
    });
  },

  handlerGobackClick() {
    const pages = getCurrentPages();
    if (pages.length >= 2) {
      wx.navigateBack({ delta: 1 });
    } else {
      wx.reLaunch({ url: '/pages/index/index' });
    }
  },

  handlerGohomeClick() {
    wx.reLaunch({ url: '/pages/index/index' });
  },

  toggleSortDropdown() {
    this.setData({ isFolded: !this.data.isFolded });
  },

  selectSort(e) {
    const value = e.currentTarget.dataset.value;
    let sortText = value === 'asc' ? '正序' : 
                  value === 'desc' ? '逆序' : '默认';

    this.setData({
      currentSort: value,
      sortText: sortText,
      isFolded: true
    });

    this.doSort(value);
  },

  doSort(mode) {
    let sortedItems = [...this.data.items];
    
    // 根据选择的排序方式处理数据
    switch (mode) {
      case 'asc':
        sortedItems.sort((a, b) => {
          // 将格式化后的日期字符串转换回日期对象再比较
          const dateA = this.parseFormattedDate(a.start_time);
          const dateB = this.parseFormattedDate(b.start_time);
          return dateA - dateB;
        });
        break;
      case 'desc':
        sortedItems.sort((a, b) => {
          const dateA = this.parseFormattedDate(a.start_time);
          const dateB = this.parseFormattedDate(b.start_time);
          return dateB - dateA;
        });
        break;
      case 'default':
        // 保持原始添加顺序
        sortedItems = [...this.data.events]; 
        break;
    }
    
    this.setData({ items: sortedItems });
  },

  // 将格式化后的日期字符串解析回日期对象
  parseFormattedDate(dateString) {
    if (!dateString) return new Date(0);
    
    const parts = dateString.split(' ');
    if (parts.length !== 2) return new Date(dateString);
    
    const dateParts = parts[0].split('/');
    const timeParts = parts[1].split(':');
    
    if (dateParts.length !== 3 || timeParts.length !== 2) return new Date(dateString);
    
    const year = parseInt(dateParts[0]);
    const month = parseInt(dateParts[1]) - 1;
    const day = parseInt(dateParts[2]);
    const hours = parseInt(timeParts[0]);
    const minutes = parseInt(timeParts[1]);
    
    return new Date(year, month, day, hours, minutes);
  },

  navigateToDetail(e) {
    const event_id = e.currentTarget.dataset.eventId;
    console.log('导航到活动详情，ID:', event_id);
    wx.navigateTo({
      url: `/pages/activitydetail/activitydetail?event_id=${event_id}`
    });
  },

  // 下拉刷新
  onPullDownRefresh: function() {
    this.fetchEvents();
    wx.stopPullDownRefresh();
  },

  // 为方便调试前端渲染的模拟数据导入函数
  // loadMockData: function() {
  //   // 创建示例活动数据
  //   const mockItems = [
  //     {
  //       event_id: 1001,
  //       poster: '/images/activity_list/mock_poster1.jpg',
  //       event_name: '春季户外拓展活动',
  //       start_time: '2023/04/15 14:00',
  //       end_time: '2023/04/15 18:00',
  //       registration_deadline: '2023/04/10 23:59'
  //     },
  //     {
  //       event_id: 1002,
  //       poster: '/images/activity_list/mock_poster2.jpg',
  //       event_name: '设计思维工作坊',
  //       start_time: '2023/04/20 10:30',
  //       end_time: '2023/04/20 16:00',
  //       registration_deadline: '2023/04/17 23:59'
  //     },
  //     {
  //       event_id: 1003,
  //       poster: '/images/activity_list/mock_poster3.jpg',
  //       event_name: '公益环保志愿活动',
  //       start_time: '2023/04/25 09:00',
  //       end_time: '2023/04/25 12:00',
  //       registration_deadline: '2023/04/22 23:59'
  //     },
  //     {
  //       event_id: 1004,
  //       poster: '/images/activity_list/mock_poster4.jpg',
  //       event_name: '创新创业大赛',
  //       start_time: '2023/05-05 13:00',
  //       end_time: '2023-05-05 17:00',
  //       registration_deadline: '2023-04-30 23:59'
  //     },
  //     {
  //       event_id: 1005,
  //       poster: '/images/activity_list/mock_poster5.jpg',
  //       event_name: 'AI主题沙龙',
  //       start_time: '2023/05/10 14:00',
  //       end_time: '2023/05/10 16:00',
  //       registration_deadline: '2023/05/08 23:59'
  //     }
  //   ];

  //   // 提取轮播图数据 (前4项)
  //   const posters = mockItems.slice(0, 4).map((item, index) => ({
  //     id: index + 1,
  //     image: item.poster
  //   }));

  //   // 设置页面数据
  //   this.setData({
  //     events: mockItems,
  //     items: mockItems,
  //     posters: posters
  //   });
  // },

  // // 轮播图数据不满足4项时的自动填充
  // ensureFourPosters: function() {
  //   const { posters, events } = this.data;
  //   if (posters.length >= 4) return;
    
  //   const needed = 4 - posters.length;
  //   const additionalPosters = events.slice(0, needed).map((item, index) => ({
  //     id: posters.length + index + 1,
  //     image: item.poster
  //   }));
    
  //   this.setData({
  //     posters: [...posters, ...additionalPosters]
  //   });
  // },
});

