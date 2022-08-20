import Taro from "@tarojs/taro";

const trueA = 1965;

export const encodeAuth = (str?: string) => {
  let res = 0;
  if (str?.length) {
    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i);
      res += code * (i + 5) + i;
    }
  }
  return res;
};

export const checkAuth = (value?: string) => {
  let authKey: number;
  if (value) {
    authKey = encodeAuth(value);
  } else {
    authKey = Taro.getStorageSync("__auth_key__");
  }
  if (authKey === trueA) {
    return true;
  }

  return false;
};

export const toWeightString = (weight?: string | number) => {
  if (weight) {
    return Number(weight).toString() === String(weight)
      ? weight + "KG"
      : weight;
  }
  return "";
};
