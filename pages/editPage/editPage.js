// /pages/editPage/editPage
const token = wx.getStorageSync('auth_token');
const API_BASE = 'http://146.56.227.73:8000'

Page({
  // 页面的数据对象，用于存储页面需要展示和使用的数据
  data: {
      // 默认的真实姓名，显示为 '猫猫××'
      real_name: '猫猫××',
      // 默认的联系方式，显示为 '1234567890'
      phone_num: '1234567890',
      // 用于存储用户头像的 URL
      avatar: '',//选择的图片路径
      // 真实姓名选中状态
      isNameFocused: false,
      // 联系方式选中状态
      isPhoneFocused: false,
      // 个人签名选中状态
      isMottoFocused: false,
  },

  // 页面加载时触发的生命周期函数
  // 直接接收从个人主页返回过来的real_name和phone_num和avatar显示
  onLoad: function (options) {
    console.log('接收端:' + options.real_name);
		console.log('接收端:' + options.phone_num);
    console.log('接收端:' + options.avatar);
    this.setData({
      real_name: options.read_name,
      phone_num: options.phone_num,
      avatar: options.avatar,
    })
  },

  onNameFocused : function() {
    this.setData({
      isNameFocused: true
    });
  },

  onNameBlur : function() {
    this.setData({
      isNameFocused: false
    });
  },

  onPhoneFocused : function() {
    this.setData({
      isPhoneFocused: true
    });
  },

  onPhoneBlur : function() {
    this.setData({
      isPhoneFocused: false
    });
  },

  onMottoFocused : function() {
    this.setData({
      isMottoFocused: true
    });
  },

  onMottoBlur : function() {
    this.setData({
      isMottoFocused: false
    });
  },

  // 向后端请求用户头像 URL 的方法
  fetchAvatar: function () {
      // 调用微信小程序的 wx.request 方法向后端发送请求
      wx.request({
          // 后端接口的地址，需要替换为实际的接口地址
          url: config.profile_url,
          // 请求方法为 GET
          method: 'GET',
          // 请求成功时的回调函数
          success: (res) => {
              // 判断响应数据是否存在，并且是否包含 avatarUrl 字段
              if (res.data && res.data.avatarUrl) {
                  // 使用 setData 方法更新页面数据中的 avatarUrl
                  this.setData({
                      avatarUrl: res.data.avatarUrl,
                  });
              } else {
                  // 如果获取失败，显示提示信息
                  wx.showToast({
                      title: '获取头像失败',
                      icon: 'none',
                  });
              }
          },
          // 请求失败时的回调函数
          fail: () => {
              // 显示请求失败的提示信息
              wx.showToast({
                  title: '请求失败，请稍后再试',
                  icon: 'none',
              });
          }
      });
  },

  // 更新用户个人信息
  editAvatar: function () {
      // 调用微信小程序的 wx.chooseImage 方法，让用户选择图片
      wx.chooseMedia({
          // 允许选择的图片数量为 1 张
          count: 1,
          // 可以选择原图或压缩图
          mediaType: ['image'],
          // 图片来源可以是相册或拍照
          sourceType: ['album', 'camera'],
          // 用户选择图片成功时的回调函数
          success: (res) => {
              var tempFilePaths = res.tempFiles[0].tempFilePath;
              console.log("tempFilePaths:" + tempFilePaths);
              this.setData({
                avatar: tempFilePaths,
              });
              if(this.data.photoPath!=undefined) {
                console.log("wx.uploadFile")
                wx.uploadFile({
                  filePath: this.data.photoPath,
                  name: 'file',
                  url: API_BASE + '/users/profile-photo',
                  header: {
                    'Content-Type': "multipart/form-data",
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  success: (res) =>{
                    console.log(res.data)
                    var result=res.data.profile_photo;
                      if(res.statusCode!=200) {
                        wx.showToast({
                          title: '更改头像失败！',
                          duration:2000
                        })
                      }
                      else {
                        var date=new Date();
                        this.setData({
                          avatar: result+"?t="+date,//如果不加后缀的话第一次上传过图片之后再次上传的图片不显示，虽然图片链接已经改变，显示的仍是第一次的图片
                        });
                        wx.showToast({ 
                          title: '更改头像成功！',
                          duration:2000
                        })
                      }
                    },
                    complete: (res) =>{
                      console.log(res);
                    }
                })
              }
          },
          // 用户选择图片失败时的回调函数
          fail: () => {
              // 显示选择图片失败的提示信息
              wx.showToast({
                  title: '选择失败，请重试',
                  icon: 'none',
              });
          }
      });
  },

  // 更新真实姓名的方法，接收一个事件对象 e
  updateRealName: function (e) {
      // 使用 setData 方法更新页面数据中的 realName，值为输入框的当前值
      this.setData({
          realName: e.detail.value
      });
  },

  // 更新联系方式的方法，接收一个事件对象 e
  updateContact: function (e) {
      // 使用 setData 方法更新页面数据中的 contact，值为输入框的当前值
      this.setData({
          contact: e.detail.value
      });
  },


//   // 保存用户更改的方法
//   saveChanges: function () {
//     const { realName, contact, signature } = this.data;
//     wx.request({
//         url: 'https://your-api-endpoint.com/save-profile', // 替换为实际的保存接口地址
//         method: 'POST',
//         data: {
//             realName,
//             contact,
//             signature
//         },
//         success: (res) => {
//             if (res.data && res.data.success) {
//                 wx.showToast({
//                     title: '保存成功',
//                     icon: 'success',
//                     duration: 2000
//                 });
//                 setTimeout(() => {
//                     wx.navigateBack({
//                         delta: 1
//                     });
//                 }, 2000);
//             } else {
//                 wx.showToast({
//                     title: '保存失败，请稍后再试',
//                     icon: 'none'
//                 });
//             }
//         },
//         fail: (err) => {
//             console.error('保存用户信息失败:', err);
//             wx.showToast({
//                 title: '保存失败，请稍后再试',
//                 icon: 'none'
//             });
//         }
//     });
// },

  // 返回上一页面的方法
  handlerGobackClick() {
      // 调用微信小程序的 wx.navigateBack 方法返回上一页面
      wx.navigateBack({
          delta: 1  // 返回上一页
      });
  },
});
