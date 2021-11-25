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

export const getFitnessRecord = async () => {
  const MAX_LIMIT = 20
  // 先取出集合记录总数
  const countResult = await commonDbOpt(db =>
    db
      .collection(FitnessRecordCollectionName)
      .count()
  );
  const total = countResult.total
  // 计算需分几次取
  const batchTimes = Math.ceil(total / MAX_LIMIT)
  // 承载所有读操作的 promise 的数组
  const tasks: Promise<any>[] = []
  for (let i = 0; i < batchTimes; i++) {
    const promise = commonDbOpt(db =>
      db
        .collection(FitnessRecordCollectionName)
        .orderBy("date", "asc")
        .skip(i * MAX_LIMIT)
        .limit(MAX_LIMIT)
        .get()
    );
    tasks.push(promise)
  }
  return (await Promise.all(tasks)).reduce((acc, cur) => {
    return {
      data: acc.data.concat(cur.data),
      errMsg: acc.errMsg,
    }
  })
}

export const addFitnessRecord = (record: FitnessRecord) =>
  commonDbOpt(db =>
    db.collection(FitnessRecordCollectionName).add({
      data: {
        ...record,
        _createTime: new Date().getTime(),
        _updateTime: new Date().getTime()
      }
    })
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
            actions: record.actions,
            _updateTime: new Date().getTime()
          }
        })
    // })
  );
