import React, {
  CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { View, Text, Button, Image } from "@tarojs/components";
import Taro, { useDidShow, usePullDownRefresh } from "@tarojs/taro";
import { useEnv, useNavigationBar, useModal, useToast } from "taro-hooks";
import dayjs from "dayjs";
// import logo from "./hook.png";
import Calendar from "../../components/Calendar";
import { ExtraInfo } from "../../components/Calendar/type";

import "./index.less";
import {
  addFitnessRecord,
  FitnessRecord,
  getFitnessRecord
} from "../../services/fitness";
import { FitnessRecordItem } from "./components/FitnessRecordItem";
import GlobalData from "../../globalData";
import { color } from "../../constant/color";
import { Stopwatch } from "../../components/Stopwatch";

const calendarStyles: Record<string, CSSProperties> = {
  headStyle: {
    // background: color.main3,
    borderRadius: "5px 5px 0 0",
    // border: "2px solid #f6f6f680",
    boxShadow: "0 0 5px RGBA(0,0,0,0.2)",
    borderBottom: "0",
    width: "90vw",
    margin: "0 5vw"
  },
  bodyStyle: {
    background: color.bg,
    borderRadius: "0 0 5px 5px",
    // border: "2px solid #f6f6f680",
    boxShadow: "0 0 5px RGBA(0,0,0,0.2)",
    width: "90vw",
    margin: "0 5vw"
  }
};

const Fitness = () => {
  const [selectDate, setSelectDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [extraInfo, setExtraInfo] = useState<ExtraInfo[]>([]);
  const dateFitnessRecordMapRef = useRef<Record<string, FitnessRecord[]>>({});

  const marks = useMemo(
    () => [
      {
        value: dayjs().format("YYYY-MM-DD"),
        color: color.main,
        markSize: "9px"
      }
    ],
    []
  );

  useDidShow(() => {
    if (GlobalData.reGetFitnessRecords) {
      GlobalData.reGetFitnessRecords = false;
      GlobalData.fitnessRecord = undefined;
      doGetFitnessRecord();
    }
  });

  usePullDownRefresh(() => {
    GlobalData.fitnessRecord = undefined;
    doGetFitnessRecord();
  });

  const handleAdd = () => {
    Taro.navigateTo({
      url: `/pages/fitnessEditor/index?type=add&date=${selectDate}`
    });
  };

  const doGetFitnessRecord = async () => {
    const res = await getFitnessRecord().catch(e =>
      console.log("getFitnessRecord e", e)
    );
    if (res?.data?.length > 0) {
      GlobalData.fitnessRecords = res.data;

      const dateFitnessRecordMap: Record<string, FitnessRecord[]> = {};

      res.data.forEach((r: FitnessRecord) => {
        const dateStr = dayjs(r.date).format("YYYY-MM-DD");

        if (!dateFitnessRecordMap[dateStr]) {
          dateFitnessRecordMap[dateStr] = [r];
        } else {
          dateFitnessRecordMap[dateStr].push(r);
        }
      });
      dateFitnessRecordMapRef.current = dateFitnessRecordMap;
      let newExtraInfo: ExtraInfo[] = Object.keys(dateFitnessRecordMap).map(
        key => {
          const valueList = dateFitnessRecordMap[key];
          return {
            value: key,
            text: valueList.map(v => v.name)
          };
        }
      );

      setExtraInfo(newExtraInfo);
    }
  };

  return (
    <View className="wrapper">
      <Calendar
        {...calendarStyles}
        customStyleGenerator={() => ({
          extraInfoStyle: {
            backgroundColor: color.main4,
            // border: '1px solid ' + color.main3,
            color: color.main2,
            borderRadius: 3,
            textAlign: "left",
            fontSize: 11,
            paddingLeft: 3
          }
        })}
        marks={marks}
        extraInfo={extraInfo}
        selectedDateColor={color.main}
        onDayClick={item => setSelectDate(item.value)}
        // onDayLongPress={item => console.log(item)}
      />
      <View className="list">
        {dateFitnessRecordMapRef.current?.[selectDate]?.map(r => (
          <FitnessRecordItem data={r} key={r._id} />
        ))}
      </View>
      <View className="add-button" onClick={handleAdd}>
        +
      </View>

      <Stopwatch />
    </View>
  );
};

export default Fitness;
