import React, { ReactNode, useEffect, useState } from "react";

import "./SideBar.css";

import rewardIcon from "img/ic_reward.svg";
import axnIcon from "img/ic_axn.svg";
import mlpIcon from "img/ic_mlp.svg";
import vestIcon from "img/ic_vest.svg";
import vaultIcon from "img/ic_vault.svg";
import transIcon from "img/ic_transfer.svg";
import { Trans, t } from "@lingui/macro";
import Footer from "components/Footer/Footer";
import Button from "components/Button/Button";


export default function SideBar({children}) {

  return (
    <>
        <div className="row">
            <div className="col-lg-3 col-md-12 col-sm-12">
                <div className="menu-button">
                    <Button imgSrc={rewardIcon} href="/overview"><Trans>Total rewards</Trans></Button>
                    <Button imgSrc={axnIcon} href="/axes"><Trans>AXN and esAXN</Trans></Button>
                    <Button imgSrc={mlpIcon} href="/alp"><Trans>ALP</Trans></Button>
                    <Button imgSrc={vestIcon} href="/vest"><Trans>Vest</Trans></Button>
                    <Button imgSrc={vaultIcon} href="/vault"><Trans>Vault</Trans></Button>
                    <Button imgSrc={transIcon} href="/begin_account_transfer"><Trans>Transfer account</Trans></Button>

                </div>
            </div>
            <div className="col-lg-9 col-md-12 col-sm-12">
                {children}
            </div>
        </div>
        <div className="row">
            <Footer></Footer>
        </div>
        
    </>
    
  )
}
