import Taro from "@tarojs/taro";

const FitnessRecordCollectionName = "fitness_record";

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

const commonDbOpt = async (func: (db: Taro.DB.Database) => Promise<any>) => {
  Taro.showLoading({
    title: "loading"
  });
  const db = Taro.cloud.database();

  let error;
  const res = await func(db).catch(e => {
    error = e;
  });
  Taro.hideLoading();
  if (res) {
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

export const getFitnessRecord = () =>
  commonDbOpt(db =>
    db
      .collection(FitnessRecordCollectionName)
      .orderBy("date", "asc")
      .get()
  );

export const addFitnessRecord = (record: FitnessRecord) =>
  commonDbOpt(db =>
    db
      .collection(FitnessRecordCollectionName)
      .add({ data: { ...record, _createDate: new Date().getTime() } })
  );

export const deleteFitnessRecord = (record: FitnessRecord) =>
  commonDbOpt(
    db =>
      // new Promise((resolve, reject) => {
      db
        .collection(FitnessRecordCollectionName)
        .doc(record._id!)
        .remove({})
    // })
  );

export const updateFitnessRecord = (record: FitnessRecord) =>
  commonDbOpt(
    db =>
      // new Promise((resolve, reject) => {
      db
        .collection(FitnessRecordCollectionName)
        .doc(record._id!)
        .update({
          data: {
            name: record.name,
            date: record.date,
            actions: record.actions
          }
        })
    // })
  );
