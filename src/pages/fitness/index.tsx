import React, {
  CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { View, Text, Button, Image, } from "@tarojs/components";
import Taro, { useDidShow, usePullDownRefresh } from "@tarojs/taro";
import { useEnv, useNavigationBar, useModal, useToast } from "taro-hooks";
// import logo from "./hook.png";
import Calendar from "custom-calendar-taro";
import dayjs from "dayjs";
import { ExtraInfo } from "custom-calendar-taro/src/components/Calendar/type";

import "./index.less";
import {
  addFitnessRecord,
  FitnessRecord,
  getFitnessRecord
} from "../../services/fitness";
import { FitnessRecordItem } from "./components/FitnessRecordItem";
import GlobalData from "../../globalData";

const calendarStyles: Record<string, CSSProperties> = {
  headStyle: {
    background: "#F6D7A780",
    borderRadius: "10px 10px 0 0",
    // border: "2px solid #f6f6f680",
    boxShadow: "0 0 5px RGBA(0,0,0,0.2)",
    borderBottom: "0",
    width: "90vw",
    margin: "0 5vw"
  },
  bodyStyle: {
    background: "#f6f6f6",
    borderRadius: "0 0 10px 10px",
    // border: "2px solid #f6f6f680",
    boxShadow: "0 0 5px RGBA(0,0,0,0.2)",
    width: "90vw",
    margin: "0 5vw"
  }
};

const Index = () => {
  const [selectDate, setSelectDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [extraInfo, setExtraInfo] = useState<ExtraInfo[]>([]);
  const dateFitnessRecordMapRef = useRef<Record<string, FitnessRecord[]>>({});

  const marks = useMemo(
    () => [
      { value: dayjs().format("YYYY-MM-DD"), color: "#87AAAA", markSize: "9px" }
    ],
    []
  );

  useDidShow(() => {
    doGetFitnessRecord();
    GlobalData.fitnessRecord = undefined;
  });

  usePullDownRefresh(() => {
    doGetFitnessRecord();
  })

  const handleAdd = () => {
    Taro.navigateTo({
      url: `/pages/fitnessEditor/index?type=add&date=${selectDate}`
    })
  }

  const doGetFitnessRecord = async () => {
    const res = await getFitnessRecord().catch(e =>
      console.log("getFitnessRecord e", e)
    );
    if (res?.data?.length > 0) {
      GlobalData.fitnessRecords = res.data;

      let newExtraInfo: ExtraInfo[] = [];
      const dateFitnessRecordMap: Record<string, FitnessRecord[]> = {};

      res.data.forEach((r: FitnessRecord) => {
        const dateStr = dayjs(r.date).format("YYYY-MM-DD");
        newExtraInfo.push({
          value: dateStr,
          text: "· " + r.name
        });
        if (!dateFitnessRecordMap[dateStr]) {
          dateFitnessRecordMap[dateStr] = [r];
        } else {
          dateFitnessRecordMap[dateStr].push(r);
        }
      });
      dateFitnessRecordMapRef.current = dateFitnessRecordMap;

      setExtraInfo(newExtraInfo);
    }
  };

  return (
    <View className="wrapper">
      <Calendar
        {...calendarStyles}
        customStyleGenerator={() => ({
          extraInfoStyle: {
            backgroundColor: "#F6D7A7",
            color: "#fff",
            borderRadius: 3,
            textAlign: "left",
            fontSize: 12
          }
        })}
        marks={marks}
        extraInfo={extraInfo}
        selectedDateColor="#C8E3D4"
        onDayClick={item => setSelectDate(item.value)}
      // onDayLongPress={item => console.log(item)}
      />
      <View className="list">
        {dateFitnessRecordMapRef.current?.[selectDate]?.map(r => (
          <FitnessRecordItem data={r} key={r._id} />
        ))}
      </View>
      <View className="add-button" onClick={handleAdd}>+</View>
    </View>
  );
};

export default Index;
