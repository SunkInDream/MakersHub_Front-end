// pages/activity_list/activity_list.js
Page({
  data: {
    events: [],          // 初始化空数组
    items: [],           // 初始化为空数组
    posters: [],         // 初始化为空数组
    sortText: '默认',    // 排序文本
    currentSort: 'default',  // 当前排序方式
    isFolded: true       // 下拉菜单状态
  },

  onLoad: function (options) {
    // 页面加载时直接使用模拟数据初始化
    this.loadMockData();
  },

  // 加载模拟数据函数
  loadMockData: function() {
    // 创建示例活动数据
    const mockItems = [
      {
        event_id: 1001,
        poster: '/images/activity_list/mock_poster1.jpg',
        event_name: '春季户外拓展活动',
        start_time: '2023/04/15 14:00',
        end_time: '2023/04/15 18:00',
        registration_deadline: '2023/04/10 23:59'
      },
      {
        event_id: 1002,
        poster: '/images/activity_list/mock_poster2.jpg',
        event_name: '设计思维工作坊',
        start_time: '2023/04/20 10:30',
        end_time: '2023/04/20 16:00',
        registration_deadline: '2023/04/17 23:59'
      },
      {
        event_id: 1003,
        poster: '/images/activity_list/mock_poster3.jpg',
        event_name: '公益环保志愿活动',
        start_time: '2023/04/25 09:00',
        end_time: '2023/04/25 12:00',
        registration_deadline: '2023/04/22 23:59'
      },
      {
        event_id: 1004,
        poster: '/images/activity_list/mock_poster4.jpg',
        event_name: '创新创业大赛',
        start_time: '2023/05-05 13:00',
        end_time: '2023-05-05 17:00',
        registration_deadline: '2023-04-30 23:59'
      },
      {
        event_id: 1005,
        poster: '/images/activity_list/mock_poster5.jpg',
        event_name: 'AI主题沙龙',
        start_time: '2023/05/10 14:00',
        end_time: '2023/05/10 16:00',
        registration_deadline: '2023/05/08 23:59'
      }
    ];

    // 提取轮播图数据 (前4项)
    const posters = mockItems.slice(0, 4).map((item, index) => ({
      id: index + 1,
      image: item.poster
    }));

    // 设置页面数据
    this.setData({
      events: mockItems,
      items: mockItems,
      posters: posters
    });
  },

  // 轮播图数据不满足4项时的自动填充
  ensureFourPosters: function() {
    const { posters, events } = this.data;
    if (posters.length >= 4) return;
    
    const needed = 4 - posters.length;
    const additionalPosters = events.slice(0, needed).map((item, index) => ({
      id: posters.length + index + 1,
      image: item.poster
    }));
    
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
        sortedItems.sort((a, b) => 
          new Date(a.start_time) - new Date(b.start_time)
        );
        break;
      case 'desc':
        sortedItems.sort((a, b) => 
          new Date(b.start_time) - new Date(a.start_time)
        );
        break;
      case 'default':
        // 保持原始添加顺序
        sortedItems = [...this.data.events]; 
        break;
    }
    
    this.setData({ items: sortedItems });
  },

  navigateToDetail(e) {
    const event_id = e.currentTarget.dataset.eventId;
    console.log('导航到活动详情，ID:', event_id);
    wx.navigateTo({
      url: `/pages/activitydetail/activitydetail?event_id=${event_id}`
    });
  }
});
