import { ITouchEvent, View } from "@tarojs/components";
import Taro, { useDidShow } from "@tarojs/taro";
import React, { useEffect, useRef } from "react";
import { useState } from "react";
import GlobalData, { IsRightNotLeftKey, TopKey } from "../../globalData";
import "./index.less";

const useStateWithData = <D, T = any>(data: T, key: keyof T) => {
  const [s, setS] = useState<D>(data[key] as any);

  const setSD = (newD: typeof s) => {
    data[key] = newD as any;
    setS(newD);
  };

  useDidShow(() => {
    setS(data[key] as any);
  });

  return [s, setSD] as const;
};

const timeNum2Str = (timeNum: number) => {
  const seconds = Math.round(timeNum / 1000);
  const second = Math.round(seconds % 60);
  const minutes = Math.round((seconds - second) / 60);
  const minute = Math.round(minutes % 60);
  const hour = Math.round((minutes - minute) / 60);

  let str = "";
  if (hour > 0) {
    str += " " + hour + "时";
  }
  if (minutes > 0) {
    str += " " + (minute > 9 ? minute : "0" + minute) + "分";
  }
  str += " " + (second > 9 ? second : "0" + second) + "秒";
  return str;
};

const ACTIVE_TIME = 5000;

export const Stopwatch = () => {
  const [isRightNotLeft, setIsRightNotLeft] = useStateWithData<
    typeof GlobalData.stopwatchData.isRightNotLeft
  >(GlobalData.stopwatchData, "isRightNotLeft");
  const [top, setTop] = useStateWithData<typeof GlobalData.stopwatchData.top>(
    GlobalData.stopwatchData,
    "top"
  );
  const [timestamp, setTimestamp] = useStateWithData<
    typeof GlobalData.stopwatchData.timestamp
  >(GlobalData.stopwatchData, "timestamp");

  const timerRef = useRef<number>();
  const [active, setActive] = useState(Boolean(timestamp));
  const [count, setCount] = useState(
    timestamp ? new Date().getTime() - timestamp : 0
  );
  const touchRef = useRef<{ top: number; pageY: number }>();

  useEffect(() => {
    if (timestamp) {
      setActive(true);
    }
  }, [timestamp]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!GlobalData.stopwatchData.timestamp) {
        setActive(false);
      }
    }, ACTIVE_TIME);

    return () => clearTimeout(timer);
  }, [timestamp, active]);

  useDidShow(() => {
    setTimeout(() => {
      if (GlobalData.stopwatchData.timestamp) {
        clearInterval(timerRef.current);
        timerRef.current = (setInterval(() => {
          setCount(
            new Date().getTime() - (GlobalData.stopwatchData.timestamp || 0)
          );
        }, 500) as unknown) as number;
      }
    }, 100);
  });

  const handleStartOrStop = () => {
    if (timestamp) {
      clearInterval(timerRef.current);
      setCount(new Date().getTime() - (timestamp || 0));
      setTimestamp(undefined);
    } else {
      clearInterval(timerRef.current);
      setTimestamp(new Date().getTime());
      setCount(0);
      timerRef.current = (setInterval(() => {
        setCount(
          new Date().getTime() - (GlobalData.stopwatchData.timestamp || 0)
        );
      }, 500) as unknown) as number;
    }
  };

  const handleTouchStart = (event: ITouchEvent) => {
    // console.log("handleTouchStart", event);
    touchRef.current = {
      top: top,
      pageY: event.changedTouches[0].pageY
    };
  };

  const handleTouchMove = (event: ITouchEvent) => {
    // console.log("handleTouchMove", event);
    const clientWidth = document?.body?.clientWidth || 375;
    if (event.changedTouches[0].pageX > clientWidth * (1 - 0.4)) {
      setIsRightNotLeft(true);
    } else if (event.changedTouches[0].pageX < clientWidth * 0.4) {
      setIsRightNotLeft(false);
    }

    const t =
      event.changedTouches[0].pageY -
      (touchRef.current?.pageY || 0) +
      (touchRef.current?.top || 0);
    setTop(t);
  };

  const handleTouchEnd = (event: ITouchEvent) => {
    console.log("handleTouchEnd", event);
    Taro.setStorage({
      key: IsRightNotLeftKey,
      data: isRightNotLeft
    });
    Taro.setStorage({
      key: TopKey,
      data: top
    });
  };

  return (
    <View
      className={
        "stopwatch " + (isRightNotLeft ? "stopwatch-right" : "stopwatch-left")
      }
      style={{
        top: top
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      {active ? (
        <View className="stopwatch-box" onClick={handleStartOrStop}>
          <View className="stopwatch-box-time">{timeNum2Str(count)}</View>
          <View className="stopwatch-box-button">
            {timestamp ? "停止" : "开始"}
          </View>
        </View>
      ) : (
        <View className="stopwatch-placeholder" onClick={() => setActive(true)}>
          秒表
        </View>
      )}
    </View>
  );
};
