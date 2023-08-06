import { DEFAULT_CHAIN_ID, getConstant } from "config/chains";

import StakeV1 from "./StakeV1";
import StakeV2 from "./StakeV2";

export default function Stake(props) {
  const isV2 = getConstant(DEFAULT_CHAIN_ID, "v2");
  return isV2 ? <StakeV2 {...props} /> : <StakeV1 {...props} />;
}
