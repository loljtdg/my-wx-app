import Taro from "@tarojs/taro";
import { db } from "../db";

const FitnessRecordCollectionName = "fitness_record";

export function generateId() {
  let str = new Date().valueOf().toString(16);
  const randomNum = 32 - str.length;
  for (let i = 0; i < randomNum; i++) {
    str += Math.floor(Math.random() * 16).toString(16);
  }

  return str;
}

export interface FitnessRecordAction {
  name: string;
  types: string[];
  weight: number;
  times: number;
  groups: number;
}

export interface FitnessRecord {
  _id?: string;
  _createTime?: number; // 13位时间戳
  _updateTime?: number; // 13位时间戳
  name: string;
  date: number; // 13位时间戳
  actions: FitnessRecordAction[];
}

const commonDbOpt = async (func: () => Promise<any>) => {
  Taro.showLoading({
    title: "loading"
  });

  let error;
  const res = await func().catch(e => {
    error = e;
  });
  Taro.hideLoading();
  if (!error) {
    Taro.showToast({
      icon: "none",
      title: "成功"
    });
    return res;
  } else {
    Taro.showToast({
      icon: "none",
      title: "失败"
    });
    throw new Error(error);
  }
};

export const getFitnessRecord = async () => {
  if (!db.getCollection(FitnessRecordCollectionName)) {
    db.addCollection(FitnessRecordCollectionName);
  }
  return db
    .getCollection<FitnessRecord>(FitnessRecordCollectionName)
    .chain()
    .data();
};

export const addFitnessRecord = (record: FitnessRecord) =>
  commonDbOpt(async () => {
    return db.getCollection<FitnessRecord>(FitnessRecordCollectionName).insert({
      ...record,
      _createTime: new Date().getTime(),
      _updateTime: new Date().getTime(),
      _id: generateId()
    });
  });

export const deleteFitnessRecord = (record: FitnessRecord) =>
  commonDbOpt(async () => {
    return db
      .getCollection<FitnessRecord>(FitnessRecordCollectionName)
      .findAndRemove({
        _id: record._id
      });
  });

export const updateFitnessRecord = (record: FitnessRecord) =>
  commonDbOpt(async () => {
    return db
      .getCollection<FitnessRecord>(FitnessRecordCollectionName)
      .findAndUpdate(
        {
          _id: record._id
        },
        oldRecord => {
          oldRecord._updateTime = new Date().getTime();
          oldRecord.name = record.name;
          oldRecord.date = record.date;
          oldRecord.actions = record.actions;
        }
      );
  });
