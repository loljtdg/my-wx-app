// miniprogram/pages/selectRestaurant.js
const app = getApp()

const GetRestaurantNum = 20;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    restaurantList: [],
    getting: false,
    restaurant: '',
    allSelected: true,
    modalShow: false,
    listType: 0, //0-私有列表 1-公共列表
  },
  restaurantTableName: '',
  privateRestaurantTableName: '',
  publicRestaurantTableName: 'restaurant',
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.privateRestaurantTableName = app.globalData.openid ? ('restaurant_private_' + app.globalData.openid) : '';
    this.restaurantTableName = this.privateRestaurantTableName;
    this.getRestaurantList();
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.getRestaurantList();
  },

  // 获取数据
  getRestaurantList: function () {
    const db = wx.cloud.database();

    wx.showLoading({
      title: '加载中',
    })

    // 查询所有的Restaurant
    db.collection(this.restaurantTableName).get({
      success: res => {
        this.setData({
          restaurantList: res.data,
          allSelected: true
        })
        console.log('[restaurant] 查询成功: ', res.data)
        wx.hideLoading();
      },
      fail: err => {
        this.setData({
          restaurantList: []
        })
        // wx.showToast({
        //   icon: 'none',
        //   title: '查询失败'
        // })
        console.error('[restaurant] 查询失败：', err)
        wx.hideLoading();
        this.createRestaurantList()
      }
    })
  },

  // 创建列表
  createRestaurantList: async function () {
    wx.showLoading({
      title: '加载中',
    })

    wx.cloud.callFunction({
      name: 'createCollection',
      data: { collection: this.restaurantTableName },
      success: res => {
        console.log('[restaurant] 创建成功: ', res.data)
        wx.hideLoading();
        this.getRestaurantList()
      },
      fail: err => {
        console.error('[restaurant] 创建失败：', err)
        wx.hideLoading();
      }
    })
  },

  // 切换列表类型
  listTypeChange: function (e) {
    const listType = e.detail.value ? 1 : 0;
    this.setData({ listType });
    this.restaurantTableName = listType ? this.publicRestaurantTableName : this.privateRestaurantTableName;
    this.getRestaurantList();
  },

  // 添加数据
  addRestaurant: function (name) {
    const _this = this;
    const db = wx.cloud.database()
    wx.showLoading({
      title: '加载中',
    })
    db.collection(this.restaurantTableName).add({
      data: {
        name: name
      },
      success: res => {
        wx.showToast({
          title: '新增成功',
        })
        wx.hideLoading();
        _this.getRestaurantList();
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '新增失败'
        })
        console.error('[restaurant] 新增失败：', err)
        wx.hideLoading();
      }
    })
  },

  // 删除数据
  delRestaurant: function (e) {
    if (e.target.dataset && e.target.dataset.id) {
      const _this = this;
      const id = e.target.dataset.id;
      const db = wx.cloud.database();
      wx.showLoading({
        title: '加载中',
      })
      db.collection(this.restaurantTableName).doc(id).remove({
        success: res => {
          wx.showToast({
            title: '删除成功',
          })
          wx.hideLoading();
          _this.getRestaurantList();
        },
        fail: err => {
          wx.showToast({
            icon: 'none',
            title: '删除失败',
          })
          console.error('[restaurant] 删除失败', err)
          wx.hideLoading();
        }
      });
    }
  },

  // 选择回调
  onSelectRestaurant: function (e) {
    const restaurantList = this.data.restaurantList.map((item) => ({ ...item, unSelected: e.detail.value.includes(item._id) ? false : true }));
    this.setData({ restaurantList: restaurantList });
  },

  // 全选回调
  onSelectRestaurantAll: function (e) {
    if (e.detail.value.length) {
      const restaurantList = this.data.restaurantList.map((item) => ({ ...item, unSelected: false }));
      this.setData({ restaurantList: restaurantList })
    } else {
      const restaurantList = this.data.restaurantList.map((item) => ({ ...item, unSelected: true }));
      this.setData({ restaurantList: restaurantList })
    }
  },

  // 摇餐厅
  onGetRestaurant: function () {
    let { restaurantList } = this.data;
    restaurantList = restaurantList.filter(item => !item.unSelected);
    if (!restaurantList || !restaurantList.length) {
      wx.showToast({
        icon: 'none',
        title: '请选择餐厅'
      })
      return;
    }
    if (this.data.getting) {
      wx.showToast({
        icon: 'none',
        title: '正在进行中'
      })
      return;
    }
    let num = 0;
    let timeout = 100;
    const timeFunc = () => setTimeout(() => {
      num++;
      timeout = 100 + num * num / 4;
      const getIndex = Math.floor(Math.random() * restaurantList.length);
      this.setData({ restaurant: restaurantList[getIndex].name });

      if (num > GetRestaurantNum) {
        this.setData({ getting: false });
        return;
      }
      timeFunc();
    }, timeout);
    this.setData({ getting: true });
    timeFunc();
  },

  // 点击添加数据
  onAddRestaurant: function () {
    this.setData({ modalShow: true });
  },
  onCloseModal: function () {
    this.setData({ modalShow: false });
  },
  onformSubmit: function (e) {
    console.log('form发生了submit事件，携带数据为：', e.detail.value)
    if (!e.detail.value || !e.detail.value.name) {
      wx.showToast({
        icon: 'none',
        title: '请输入餐厅名称'
      })
      return;
    }
    this.addRestaurant(e.detail.value.name);
    this.setData({ modalShow: false });
  }
})