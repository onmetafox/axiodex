import React, { ReactNode, useCallback, useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import { Trans, t } from "@lingui/macro";

import Tab from "components/Tab/Tab";
import PageRow from "components/PageComponent/PageRow";
import PageTitle from "components/PageComponent/PageTitle";
import ExternalLink from "components/ExternalLink/ExternalLink";
import Button from "components/Button/Button";

import { DEPOSIT, FIAT_OPTIONS, WITHDRAWAL } from "lib/legacy";

import "./Vault.css";
import logoIcon from "img/ic_logo.svg";
import hrefIcon from "img/ic_href.svg";

export default function Vault({ setPendingTxns, connectWallet }) {
  const [status, setStatus] = useState("AXN");
  const [tvl, setTvl] =useState("AXN-0.00");
  const [apy, setApy] = useState("AXN-0.00");
  const [daily,setDaily] = useState("AXN-0.00");
  const [strategy, setStrategy] = useState("AXN-content of strategy");
  const [axn, setAxn] = useState("AXN-content of axn");
  const [disclaimer, setDisclaimer] = useState("AXN-content of disclaimer");
  const [exchange, setExchange] = useState("deposit");
  const { active, library, account } = useWeb3React();

  const PAGE_TITLE = "Vault";
  const DESCRIPTION = ["Our cutting-edge auto-compound Yield Farming strategy, designed to empower investors to earn rewards effortlessly."];
  const FIAT_LABELS ={
    [DEPOSIT]: t`Deposit`,
    [WITHDRAWAL]: t`Withdrawal`
  }

  useEffect(()=>{
    setTvl(`${status}-0.00`);
    setApy(`${status}-0.00`);
    setDaily(`${status}-0.00`);
    setStrategy(`${status}-content of Strategy`);
    setAxn(`${status}-content of axn`);
    setDisclaimer(`${status}-content of disclaimer`);

  },[status])

  useEffect(()=>{

  }, [exchange])
  return (
    <>
      <div className="page-layout valut">
        <PageTitle title = {PAGE_TITLE} descriptions = {DESCRIPTION} />
        <div className="Page-content">
          <div className="row">
            <div className="col-lg-8 col-sm-12 col-md-12">
              <div className="logo-container ">
                <Button imgSrc={logoIcon} onClick={()=>setStatus("AXN")} className="Tab-option-icon"><Trans>AXN</Trans></Button>
                <Button imgSrc={logoIcon} onClick={()=>setStatus("ALP")} className="Tab-option-icon"><Trans>ALP</Trans></Button>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-6 col-sm-12 col-md-12">
              <div className="row padding-1r">
                <div className="Exchange-swap-section detail-container strategy-container border-0">
                  <PageRow title = "TVL" value = {tvl} direction="vertical"/>
                  <PageRow title = "APY" value = {apy} direction="vertical"/>
                  <PageRow title = "Daily" value = {daily} direction="vertical"/>
                </div>
              </div>
              <div className="row padding-1r">
                <div className="Exchange-swap-section strategy-container">
                  <div className="Exchange-swap-section-top">
                    <div className="strategy-title">Strategy</div>
                    <div className="align-right strategy-link Tab-option">
                      <ExternalLink href="https://gmxio.gitbook.io/gmx/trading#fees">
                        <Trans>Contract</Trans>
                        <img src={hrefIcon} alt="" className="Tab-option-icon" />
                      </ExternalLink>
                    </div>
                  </div>
                  <div className="Exchange-swap-section-bottom strategy-content">
                    <div> {strategy}
                    </div>
                  </div>
                </div>
              </div>
              <div className="row padding-1r">
                <div className="Exchange-swap-section strategy-container">
                  <div className="Exchange-swap-section-top">
                    <div className=" strategy-title Tab-option logo">
                      <img src={logoIcon} alt="" className="Tab-option-icon"/>
                      <span>AXN</span>
                    </div>
                    <div className=" align-right strategy-link Tab-option">
                      <ExternalLink href="https://gmxio.gitbook.io/gmx/trading#fees">
                        <Trans>Contract</Trans>
                        <img src={hrefIcon} alt="" className="Tab-option-icon" />
                      </ExternalLink>
                    </div>
                  </div>
                  <div className="Exchange-swap-section-bottom strategy-content">
                    {axn}
                  </div>
                </div>
              </div>
              <div className="row padding-1r">
                <div className="Exchange-swap-section strategy-container">
                  <div className="Exchange-swap-section-top">
                    <div className=" strategy-title">Disclaimer</div>
                  </div>
                  <div className="Exchange-swap-section-bottom strategy-content">
                    {disclaimer}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-5 col-sm-12 col-md-12">
              <div className="row padding-1r">
                <div className="detail-container">
                  <PageRow title = "Your deposit" value = "$0" direction="vertical"/>
                  <PageRow title = "Last harvest" value = "16 hours ago" direction="vertical"/>
                </div>
              </div>
              <div className="row padding-1r fiat-container border-0">
                <div className="row">
                  {/* <Tab
                    options={FIAT_OPTIONS}
                    optionLabels={FIAT_LABELS}
                  >
                  </Tab> */}
                  <div className="exchange-container ">
                    <Button onClick={()=>setExchange("deposit")} className="exchange-icon"><Trans>Deposit</Trans></Button>
                    <Button onClick={()=>setExchange("withdraw")} className="exchange-icon"><Trans>Withdraw</Trans></Button>
                  </div>
                </div>
                <div className="row">
                  <div className="fiat-detail">
                    <div className="Exchange-swap-section">
                      <div className="Exchange-swap-section-top">
                        <div className="">Amount</div>
                        <div className=" align-right strategy-link">
                          <Trans>Avail: NaN</Trans>
                        </div>
                      </div>
                      <div className="Exchange-swap-section-bottom">
                        <div className="Exchange-swap-input-container">
                          <input type="number" min="0" placeholder="0.0" className="Exchange-swap-input" value="" data-listener-added_0d485960="true"/>
                        </div>
                        <div>
                          <div className="TokenSelector">
                            <div className="TokenSelector-box">{status}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="strategy-link Tab-option">
                    {status === "AXN" &&
                      <ExternalLink href="https://gmxio.gitbook.io/gmx/trading#fees">
                        <Trans>Add liquidity-AXN</Trans>
                        <img src={hrefIcon} alt="" className="Tab-option-icon" />
                      </ExternalLink>
                    }
                    {status === "ALP" && 
                      <ExternalLink href="https://gmxio.gitbook.io/gmx/trading#fees">
                        <Trans>Add liquidity-ALP</Trans>
                        <img src={hrefIcon} alt="" className="Tab-option-icon" />
                      </ExternalLink>
                    }
                    {
                      exchange === "withdraw" && status == "AXN" && <>
                        <div>Est.receive: <strong>0 AXN</strong></div>
                      </>
                    }
                    {
                      exchange === "withdraw" && status == "ALP" && <>
                        <div>Est.receive: <strong>0 ALP</strong></div>
                      </>
                    }
                  </div>
                </div>
                {!active && (
                    <button className="App-button-option App-card-option" onClick={() => connectWallet()}>
                      <Trans>Connect Wallet</Trans>
                    </button>
                  )}
                {active && (
                    <button className="App-button-option App-card-option">
                      <Trans>Deposit</Trans>
                    </button>
                  )}

              </div>
              <div className="row padding-1r">
                <div className="fee detail-container">
                  <div className="strategy-container">
                    <PageRow title = "Deposit fee" value = "0%" direction="vertical" className="page-row-content-deverse"/>
                    <PageRow title = "Withdraw fee" value = "0%" direction="vertical" className="page-row-content-deverse"/>
                    <PageRow title = "Performance fee" value = "4%" direction="vertical" className="page-row-content-deverse"/>
                  </div>
                  <div className="row px-4">
                    <Trans>Performance fee is already subtracted from the displayed APY.</Trans>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>

  )
}
