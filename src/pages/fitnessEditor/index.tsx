import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, Button, Image, Form, Input, Picker } from "@tarojs/components";
import Taro from "@tarojs/taro";
import {
  useEnv,
  useNavigationBar,
  useModal,
  useToast,
  useRouter
} from "taro-hooks";

import "./index.less";
import dayjs from "dayjs";
import GlobalData from "../../globalData";
import { addFitnessRecord, deleteFitnessRecord, FitnessRecord, FitnessRecordAction, updateFitnessRecord } from "../../services/fitness";

interface FormData {
  time: string;
  name: string;
  actions: FitnessRecordAction[];
}

const transformRecord2FormData = (record?: FitnessRecord, isTemp?: boolean): Partial<FormData> => {
  if (record) {
    return {
      ...isTemp ? {} : { time: dayjs(record.date).format('HH:mm') },
      name: record.name,
      actions: record.actions
    }
  }
  return {
    ...isTemp ? {} : { time: dayjs().format('HH:mm') },
    name: '',
    actions: []
  }
}

const FitnessEditor = () => {
  const { date, type } = useRouter()[0].params;

  useEffect(() => {
    Taro.setNavigationBarTitle({ title: type === "add" ? "新增" : "编辑" });
  }, []);

  const tempRange = useMemo(() => {
    return GlobalData.fitnessRecords.reverse().map(r => ({
      rangeKey: r.name + '（' + dayjs(r.date).format("YYYY-MM-DD HH:mm") + "）",
      ...r,
    }));
  }, [])

  const [formData, setFormData] = useState(() => transformRecord2FormData(GlobalData.fitnessRecord))

  const handleChange = (key: string) => (event) => {
    setFormData({
      ...formData,
      [key]: event.detail.value
    })
  }

  const handleTemp = (event) => {
    const tempIdx = event.detail.value;
    setFormData({
      ...formData,
      ...transformRecord2FormData(tempRange[tempIdx] as unknown as FitnessRecord, true)
    })
  }

  const handleAddAction = () => {
    formData.actions?.unshift({
      name: '', types: [], weight: '', times: '', groups: ''
    } as any)
    setFormData({
      ...formData,
    })
  }

  const handleActionDel = (idx: number) => {
    formData.actions?.splice(idx, 1)
    setFormData({
      ...formData,
    })
  }

  const handleActionMove = (idx: number, type: number) => {
    const newIdx = idx + type
    if (!formData.actions || (newIdx < 0) || (newIdx >= formData.actions.length)) {
      return;
    }
    const item = formData.actions[idx]
    formData.actions[idx] = formData.actions[newIdx]
    formData.actions[newIdx] = item
    setFormData({
      ...formData,
    })
  }

  const handleChangeAction = (index: number, key: string) => (event) => {
    const action = (formData.actions!)[index]!;
    action[key] = event.detail.value;

    setFormData({
      ...formData,
    })
  }

  const handleChangeActionType = (index: number) => (event) => {
    const action = (formData.actions!)[index]!;
    action.types = [event.detail.value];

    setFormData({
      ...formData,
    })
  }

  const handleSubmit = () => {
    if (!formData.name || !formData.time || !formData.actions?.length) {
      return Taro.showToast({
        icon: "none",
        title: "有表单项未输入"
      });
    }

    let newFitnessRecord: Partial<FitnessRecord> = {}
    if (GlobalData.fitnessRecord) {
      newFitnessRecord = { ...GlobalData.fitnessRecord }
    }
    newFitnessRecord.date = dayjs(date + ' ' + formData.time, "YYYY-MM-DD HH:mm").valueOf()
    newFitnessRecord.name = formData.name!
    newFitnessRecord.actions = formData.actions!

    if (type === 'add') {
      addFitnessRecord(newFitnessRecord as FitnessRecord).then(() => Taro.navigateBack());
    } else {
      updateFitnessRecord(newFitnessRecord as FitnessRecord).then(() => Taro.navigateBack());
    }
  }

  const handleDelete = () => {
    if (GlobalData.fitnessRecord?._id) {
      deleteFitnessRecord(GlobalData.fitnessRecord).then(() => Taro.navigateBack())
    }
  }


  console.log("formData", formData)

  return (
    <View className="wrapper">
      <View className="form">
        <View className="row">
          <View className="row-title">时间</View>
          <View className="date">{date}</View>

          <Picker mode="time" value={formData.time} onChange={handleChange('time')}>
            <View className="picker">
              {formData.time}
            </View>
          </Picker>
        </View>

        <View className="row">
          <View className="row-title">模版</View>
          <Picker mode="selector" range={tempRange} rangeKey="rangeKey" onChange={handleTemp}>
            <View className="picker">点击选择模版</View>
          </Picker>
        </View>

        <View className="row">
          <View className="row-title">名称</View>
          <Input className="input " type="text" value={formData.name} onInput={handleChange('name')} />
        </View>

        <View className="row">
          <View className="row-title">动作</View>
          <View className="actions-add" onClick={handleAddAction}>+</View>
        </View>

        {formData.actions?.map((a, idx) =>
          <View className="action">
            <View className="row action-row">
              <View className="row-title">名称</View>
              <Input className="input " type="text" value={a.name} onInput={handleChangeAction(idx, 'name')} />
            </View>
            <View className="row action-row">
              <View className="row-title">类型</View>
              <Input className="input " type="text" value={a.types?.[0]} onInput={handleChangeActionType(idx)} />
            </View>
            <View className="row action-row">
              <View className="row-title">数量</View>
              <Input className="input input-short" type="number" value={String(a.weight || '')} onInput={handleChangeAction(idx, 'weight')} />
              <View className="margin-text">{`KG`}</View>
              <View className="margin-text" />
              <Input className="input input-short" type="number" value={String(a.times || '')} onInput={handleChangeAction(idx, 'times')} />
              <View className="margin-text">{'次'}</View>
              <View className="margin-text">{`X`}</View>
              <Input className="input input-short" type="number" value={String(a.groups || '')} onInput={handleChangeAction(idx, 'groups')} />
              <View className="margin-text">{'组'}</View>
            </View>

            <View className="action-opt">
              <View className="action-opt-item" onClick={() => handleActionMove(idx, -1)}>↑</View>
              <View className="action-opt-item action-opt-item-del" onClick={() => handleActionDel(idx)}>X</View>
              <View className="action-opt-item" onClick={() => handleActionMove(idx, 1)}>↓</View>
            </View>
          </View>
        )}
        <View className="row submit-row">
          <View className="submit" onClick={handleSubmit}>提交</View>
          {type === "update" && <View className="delete" onClick={handleDelete}>删除</View>}
        </View>
      </View>
    </View>
  );
};

export default FitnessEditor;
