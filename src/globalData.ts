import { FitnessRecord } from "./services/fitness";
import Taro from "@tarojs/taro";

export const IsRightNotLeftKey = "stopwatchData_isRightNotLeft";
export const TopKey = "stopwatchData_top";

type GlobalDataType = {
  fitnessRecords: FitnessRecord[];
  fitnessRecord?: FitnessRecord;
  reGetFitnessRecords: boolean;

  stopwatchData: {
    isRightNotLeft: boolean;
    top: number;
    timestamp?: number;
  };
};

const GlobalData: GlobalDataType = {
  fitnessRecords: [],
  fitnessRecord: undefined,
  reGetFitnessRecords: true,

  stopwatchData: {
    isRightNotLeft: Taro.getStorageSync(IsRightNotLeftKey) ?? true,
    top: Taro.getStorageSync(TopKey) || 50,
    timestamp: undefined
  }
};

export default GlobalData;
