//index.js
const app = getApp()

Page({
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    logged: false,
    openid: '',
    dataArray: [
      {
        title: '选餐厅',
        url: '/pages/selectRestaurant/selectRestaurant',
      }
    ]
  },

  onLoad: function() {
    if (!wx.cloud) {
      return
    }

    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo
              })
            }
          })
        }else{
          // this.getUserInfo();
        }
      },
      fail: ()=>{
        // this.getUserInfo();
      }
    });

    this.getOpenid();
  },

  onGetUserInfo: function(e) {
    if (!this.data.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
    }
  },

  getOpenid: function() {
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid)
        app.globalData.openid = res.result.openid
        this.setData({ openid: res.result.openid})
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
      }
    })
  },


})
