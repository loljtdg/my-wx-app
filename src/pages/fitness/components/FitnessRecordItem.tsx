import { View } from "@tarojs/components";
import dayjs from "dayjs";
import React from "react";
import { FitnessRecord } from "src/services/fitness";
import { toWeightString } from "../../../utils";
import Taro from "@tarojs/taro";
import GlobalData from "../../../globalData";

interface Props {
  data: FitnessRecord
}

export const FitnessRecordItem = ({ data }: Props) => {

  const handleUpdate = () => {
    GlobalData.fitnessRecord = data;
    Taro.navigateTo({
      url: `/pages/fitnessEditor/index?type=update&date=${dayjs(data.date).format("YYYY-MM-DD")}`
    });
  }

  return (
    <View className="item" onClick={handleUpdate}>
      <View className="item-title">{data.name}<View className="item-title-time">{dayjs(data.date).format("HH:mm")}</View></View>
      {data.actions.map(action =>
      (action && <View className="item-action" key={action.name}>
        <View className="item-action-name">
          {`- ${action.name}`}
          {action.types?.map(t => <View className="item-action-name-type">{t}</View>)}
        </View>
        <View className="item-action-texts">
          <View className="item-action-texts-text" style={{ minWidth: Taro.pxTransform(120), marginRight: Taro.pxTransform(5) }}>{toWeightString(action.weight)}</View>
          <View className="item-action-texts-text" style={{ minWidth: Taro.pxTransform(42) }}>{action.times}</View>
          <View className="item-action-texts-text" style={{ marginLeft: Taro.pxTransform(5) }}>{` X `}</View>
          <View className="item-action-texts-text" style={{ minWidth: Taro.pxTransform(21) }}>{action.groups}</View>
        </View>
      </View>)
      )}
    </View>
  );
}
