import pulse from "img/ic_pls_40.svg";
import base from "img/base-logo.svg"

import gmxIcon from "img/ic_gmx_40.svg";
import ethIcon from "img/ic_eth_40.svg";
import glpIcon from "img/ic_glp_40.svg";
import alpIcon from "img/ic_alp.svg";
import axnIcon from "img/ic_axn_40.svg";
import tlpIcon from "img/ic_tlp_40.svg";
import dropIcon from "img/ic_menu_dots.svg";
import { LOCALNET } from "./chains";

const ICONS = {
  common: {
    network: base,
    icon: pulse,
    gmx: gmxIcon,
    alp: alpIcon,
    glp: glpIcon,
    axn: axnIcon,
    tlp: tlpIcon,
    drop: dropIcon
  },
  [LOCALNET]: {
    network: ethIcon
  }
};

export function getIcon(chainId: number | "common", label: string) {
  if (chainId in ICONS) {
    if (label in ICONS[chainId]) {
      return ICONS[chainId][label];
    }
  }
  return ICONS["common"][label]
}
export function getIcons(chainId: number | "common") {
  if (!chainId) return;
  if (chainId in ICONS) {
    return ICONS[chainId];
  }
  return ICONS["common"]
}
