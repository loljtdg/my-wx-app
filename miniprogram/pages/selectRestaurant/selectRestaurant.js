// miniprogram/pages/selectRestaurant.js

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
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
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
    const db = wx.cloud.database()
    // 查询所有的Restaurant
    db.collection('restaurant').get({
      success: res => {
        this.setData({
          restaurantList: res.data,
          allSelected: true
        })
        console.log('[restaurant] 查询成功: ', res.data)
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '查询失败'
        })
        console.error('[restaurant] 查询失败：', err)
      }
    })
  },

  // 添加数据
  addRestaurant: function (name) {
    const _this = this;
    const db = wx.cloud.database()
    db.collection('restaurant').add({
      data: {
        name: name
      },
      success: res => {
        wx.showToast({
          title: '新增成功',
        })
        _this.getRestaurantList();
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '新增失败'
        })
        console.error('[restaurant] 新增失败：', err)
      }
    })
  },

  // 删除数据
  delRestaurant: function (e) {
    if (e.target.dataset && e.target.dataset.id) {
      const _this = this;
      const id = e.target.dataset.id;
      const db = wx.cloud.database();
      db.collection('restaurant').doc(id).remove({
        success: res => {
          wx.showToast({
            title: '删除成功',
          })
          _this.getRestaurantList();
        },
        fail: err => {
          wx.showToast({
            icon: 'none',
            title: '删除失败',
          })
          console.error('[restaurant] 删除失败', err)
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