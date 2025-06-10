// pages/editPage/editPage.js

const API_BASE = 'http://146.56.227.73:8000'
const token = wx.getStorageSync('auth_token')

Page({
  data: {
    real_name: '',
    phone_num: '',
    avatar: '',
    signature: '',
    photoPath: '',
    isNameFocused: false,
    isPhoneFocused: false,
    isMottoFocused: false
  },

  onLoad(options) {
    // 先尝试从后台获取最新用户信息
    wx.request({
      url: `${API_BASE}/users/profile`,
      method: 'GET',
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      success: res => {
        if (res.statusCode === 200 && res.data.data) {
          const info = res.data.data
          this.setData({
            real_name: info.real_name || '',
            phone_num: info.phone_num || '',
            avatar: info.profile_photo || '',
            signature: info.motto || ''
          })
        } else {
          // 后台没数据时，退回到传参
          this._initFromOptions(options)
        }
      },
      fail: () => {
        // 请求失败时，也退回到传参
        this._initFromOptions(options)
      }
    })
  },

  // 从 navigateTo 传过来的 options 初始化
  _initFromOptions(options) {
    this.setData({
      real_name: options.real_name || '',
      phone_num: options.phone_num || '',
      avatar: options.avatar || '',
      signature: options.motto || ''
    })
  },

  onNameFocused() { this.setData({ isNameFocused: true }) },
  onNameBlur()    { this.setData({ isNameFocused: false }) },
  onPhoneFocused(){ this.setData({ isPhoneFocused: true }) },
  onPhoneBlur()   { this.setData({ isPhoneFocused: false }) },
  onMottoFocused(){ this.setData({ isMottoFocused: true }) },
  onMottoBlur()   { this.setData({ isMottoFocused: false }) },

  updateRealName(e) {
    this.setData({ real_name: e.detail.value })
  },
  updateContact(e) {
    this.setData({ phone_num: e.detail.value })
  },
  updateSignature(e) {
    this.setData({ signature: e.detail.value })
  },

  editAvatar() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album','camera'],
      success: res => {
        const path = res.tempFiles[0].tempFilePath
        this.setData({ avatar: path, photoPath: path })
        wx.uploadFile({
          filePath: path,
          name: 'file',
          url: `${API_BASE}/users/profile-photo`,
          header: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          },
          success: upRes => {
            const data = JSON.parse(upRes.data)
            if (upRes.statusCode === 200 && data.profile_photo) {
              const date = Date.now()
              this.setData({ avatar: `${data.profile_photo}?t=${date}` })
              wx.showToast({ title: '上传成功' })
            } else {
              wx.showToast({ title: '上传失败', icon: 'none' })
            }
          }
        })
      }
    })
  },

  saveChanges() {
    const { real_name, phone_num, avatar, signature } = this.data
    const updatedData = {
      real_name, phone_num,
      profile_photo: avatar,
      motto: signature
    }
    wx.setStorageSync('updatedUserInfo', updatedData)
    wx.request({
      url: `${API_BASE}/users/profile`,
      method: 'PUT',
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      data: updatedData,
      complete: () => {
        wx.showToast({ title: '保存完成' })
        wx.navigateBack({ delta: 1 })
      }
    })
  },

  handlerGobackClick() {
    wx.navigateBack({ delta: 1 })
  }
})
