import React, { useCallback, useEffect } from "react";
import { View, Text, Button, Image } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useEnv, useNavigationBar, useModal, useToast } from "taro-hooks";
// import logo from "./hook.png";

import "./index.less";
import { checkAuth } from "../../utils";

const items = [
  {
    title: "健身",
    url: "/pages/fitness/index"
  }
];

const Index = () => {
  useEffect(() => {
    if (checkAuth()) {
      Taro.redirectTo({ url: "/pages/fitness/index" })
    }
  }, [])
  return (
    <View className="wrapper">
      <View className="box-container">
        {items.map(item => (
          <View
            className="box"
            key={item.title}
            onClick={() => Taro.navigateTo({ url: item.url })}
          >
            {item.title}
          </View>
        ))}
      </View>
    </View>
  );
};

export default Index;
