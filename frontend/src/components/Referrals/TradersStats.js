import { useRef, useState } from "react";
import { Trans, t } from "@lingui/macro";
import { BiEditAlt } from "react-icons/bi";
import Card from "../Common/Card";
import Modal from "../Modal/Modal";
import Tooltip from "../Tooltip/Tooltip";
import { shortenAddress } from "lib/legacy";
import EmptyMessage from "./EmptyMessage";
import InfoCard from "./InfoCard";
import { getTierIdDisplay, getUSDValue, tierDiscountInfo } from "./referralsHelper";
import { ReferralCodeForm } from "./JoinReferralCode";
import { getExplorerUrl } from "config/chains";
import { formatAmount } from "lib/numbers";
import { getNativeToken, getToken } from "config/tokens";
import { formatDate } from "lib/dates";
import ExternalLink from "components/ExternalLink/ExternalLink";
import usePagination from "./usePagination";
import Pagination from "components/Pagination/Pagination";

function TradersStats({ referralsData, traderTier, chainId, userReferralCodeString, setPendingTxns, pendingTxns }) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const editModalRef = useRef(null);
  const { getCurrentData, currentPage, setCurrentPage, pageCount } = usePagination(
    referralsData?.discountDistributions
  );

  const currentDiscountDistributions = getCurrentData();

  const open = () => setIsEditModalOpen(true);
  const close = () => setIsEditModalOpen(false);
  return (
    <div className="rebate-container">
      <div className="referral-stats">
        <InfoCard
          label={t`Total Trading Volume`}
          tooltipText={t`Volume traded by this account with an active referral code.`}
          data={getUSDValue(referralsData?.referralTotalStats?.volume)}
        />
        <InfoCard
          label={t`Total Rebates`}
          tooltipText={t`Rebates earned by this account as a trader.`}
          data={getUSDValue(referralsData?.referralTotalStats?.discountUsd, 4)}
        />
        <InfoCard
          label={t`Active Referral Code`}
          data={
            <div className="active-referral-code">
              <div className="edit">
                <span>{userReferralCodeString}</span>
                <BiEditAlt onClick={open} />
              </div>
              {traderTier && (
                <div className="tier">
                  <Tooltip
                    handle={t`Tier ${getTierIdDisplay(traderTier)} (${tierDiscountInfo[traderTier]}% discount)`}
                    position="right-bottom"
                    renderContent={() => (
                      <p className="text-white">
                        <Trans>
                          You will receive a {tierDiscountInfo[traderTier]}% discount on your opening and closing fees,
                          this discount will be airdropped to your account every Wednesday
                        </Trans>
                      </p>
                    )}
                  />
                </div>
              )}
            </div>
          }
        />
        <Modal
          className="Connect-wallet-modal"
          isVisible={isEditModalOpen}
          setIsVisible={close}
          label={t`Edit Referral Code`}
          onAfterOpen={() => editModalRef.current?.focus()}
        >
          <div className="edit-referral-modal">
            <ReferralCodeForm
              userReferralCodeString={userReferralCodeString}
              setPendingTxns={setPendingTxns}
              pendingTxns={pendingTxns}
              type="edit"
              callAfterSuccess={() => setIsEditModalOpen(false)}
            />
          </div>
        </Modal>
      </div>
      {currentDiscountDistributions.length > 0 ? (
        <div className="reward-history">
          <Card title={t`Rebates Distribution History`} tooltipText={t`Rebates are airdropped weekly.`}>
            <div className="table-wrapper">
              <table className="referral-table">
                <thead>
                  <tr>
                    <th className="table-head" scope="col">
                      <Trans>Date</Trans>
                    </th>
                    <th className="table-head" scope="col">
                      <Trans>Amount</Trans>
                    </th>
                    <th className="table-head" scope="col">
                      <Trans>Transaction</Trans>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentDiscountDistributions.map((rebate, index) => {
                    let tokenInfo;
                    try {
                      tokenInfo = getToken(rebate.token);
                    } catch {
                      tokenInfo = getNativeToken();
                    }
                    const explorerURL = getExplorerUrl(chainId);
                    return (
                      <tr key={index}>
                        <td data-label="Date">{formatDate(rebate.timestamp)}</td>
                        <td data-label="Amount">
                          {formatAmount(rebate.amount, tokenInfo.decimals, 6, true)} {tokenInfo.symbol}
                        </td>
                        <td data-label="Transaction">
                          <ExternalLink href={explorerURL + `tx/${rebate.transactionHash}`}>
                            {shortenAddress(rebate.transactionHash, 20)}
                          </ExternalLink>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
          <Pagination page={currentPage} pageCount={pageCount} onPageChange={(page) => setCurrentPage(page)} />
        </div>
      ) : (
        <EmptyMessage
          message={t`No rebates distribution history yet.`}
          tooltipText={t`Rebates are airdropped weekly.`}
        />
      )}
    </div>
  );
}

export default TradersStats;
