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
        <div className="container">
            <div className="col-lg-12 col-md-12 col-sm-12">
                <div className="menu-button">
                    <Button href="/earn"><Trans>Total rewards</Trans></Button>
                    <Button href="/axes"><Trans>AXN and esAXN</Trans></Button>
                    <Button href="/alp"><Trans>ALP</Trans></Button>
                    <Button href="/vault"><Trans>Vault</Trans></Button>
                    <Button href="/begin_account_transfer"><Trans>Transfer account</Trans></Button>
                </div>
            </div>
            <div className="container">
                {children}
            </div>
        </div>
        <div className="row">
            <Footer></Footer>
        </div>

    </>

  )
}
