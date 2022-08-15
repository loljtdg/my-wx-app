import { FitnessRecord } from "./services/fitness";

type GlobalDataType = {
  fitnessRecords: FitnessRecord[];
  fitnessRecord?: FitnessRecord;
  reGetFitnessRecords: boolean;
};

const GlobalData: GlobalDataType = {
  fitnessRecords: [],
  reGetFitnessRecords: true
};

export default GlobalData;
