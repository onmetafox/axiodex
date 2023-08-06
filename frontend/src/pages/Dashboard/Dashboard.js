import React from "react";

import DashboardV2 from "./DashboardV2";
import DashboardV1 from "./DashboardV1";
import DashboardV3 from "./DashboardV3";
export default function Dashboard(props) {
  return <DashboardV3 />;
}

export function Dashboard1(props) {
  return <DashboardV1 />;
}

export function Dashboard2(props) {
  return <DashboardV2 />;
}

export function Dashboard3(props) {
  return <DashboardV3 />;
}
