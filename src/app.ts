import { Component } from "react";
import Taro from "@tarojs/taro";
import "./app.less";
import { checkAuth } from "./utils";

const doUpdate = () => {
  const updateManager = Taro.getUpdateManager();

  updateManager.onCheckForUpdate(function(res) {
    // 请求完新版本信息的回调
    console.log(res.hasUpdate);
  });

  updateManager.onUpdateReady(function() {
    Taro.showModal({
      title: "更新提示",
      content: "新版本已经准备好，是否重启应用？",
      success(res) {
        if (res.confirm) {
          // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
          updateManager.applyUpdate();
        }
      }
    });
  });

  updateManager.onUpdateFailed(function() {
    // 新版本下载失败
  });
};

class App extends Component {
  componentDidMount() {
    doUpdate();
    if (!checkAuth()) {
      Taro.redirectTo({ url: "/pages/login/index" });
    }
  }

  componentDidShow() {}

  componentDidHide() {}

  componentDidCatchError() {}

  onLaunch() {
    Taro.cloud.init();
  }

  // this.props.children 是将要会渲染的页面
  render() {
    return this.props.children;
  }
}

export default App;
