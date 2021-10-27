import { FitnessRecord } from "./services/fitness";

type GlobalDataType = {
  fitnessRecords: FitnessRecord[];
  fitnessRecord?: FitnessRecord;
};

const GlobalData: GlobalDataType = {
  fitnessRecords: []
};

export default GlobalData;
