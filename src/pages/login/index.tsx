import React, { useCallback, useEffect } from "react";
import { View, Text, Button, Image, Input } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useEnv, useNavigationBar, useModal, useToast } from "taro-hooks";
// import logo from "./hook.png";

import "./index.less";
import { checkAuth, encodeAuth } from "../../utils";


const Login = () => {

  const handleInput = (event) => {
    const value = event.detail.value;
    if (checkAuth(value)) {
      Taro.setStorageSync("__auth_key__", encodeAuth(value))
      return Taro.redirectTo({ url: "/pages/index/index" });
    }
  }
  return (
    <View className="wrapper">
      <View className="title">请输入密钥</View>
      <Input className="input" onInput={handleInput} password />

    </View>
  );
};

export default Login;
