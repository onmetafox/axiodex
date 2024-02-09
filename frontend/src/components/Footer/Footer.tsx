import React from "react";
import cx from "classnames";
import "./Footer.css";
import logoImg from "img/logo.svg";
import { NavLink } from "react-router-dom";
import { isHomeSite, getAppBaseUrl, shouldShowRedirectModal } from "lib/legacy";
import { getFooterLinks, SOCIAL_LINKS } from "./constants";
import ExternalLink from "components/ExternalLink/ExternalLink";
import { getContract } from "config/contracts";

type Props = { showRedirectModal?: (to: string) => void; redirectPopupTimestamp?: () => void };

export default function Footer({ showRedirectModal, redirectPopupTimestamp }: Props) {
  // const isHome = isHomeSite();
  const isHome = true;
  return (
    <div className="Footer">
      <div className={cx("Footer-wrapper", { home: isHome })}>
        {/* <div className="Footer-logo">
          <img src={logoImg} alt="MetaMask" />
        </div> */}
        <div className="Footer-social-link-block">
          {SOCIAL_LINKS.map((platform) => {
            return (
              <ExternalLink key={platform.name} className="App-social-link" href={platform.link}>
                <img src={platform.icon} alt={platform.name} />
              </ExternalLink>
            );
          })}
        </div>
        <div>
          <ExternalLink className="scan-link" href="https://etherscan.io/address/0xec7acba6fedb7ebfbc0f44f8f0bc6fc39543e28a">
            0xec7acba6fedb7ebfbc0f44f8f0bc6fc39543e28a
          </ExternalLink>
          <p className="contact-link">
            marketing@axiodex.io
          </p>
        </div>
        {/* <div className="Footer-links">
          {getFooterLinks(isHome).map(({ external, text, link, isAppLink }) => {
            if (external) {
              return (
                <ExternalLink key={i18n._(text)} href={link} className="Footer-link">
                  {i18n._(text)}
                </ExternalLink>
              );
            }
            if (isAppLink) {
              if (shouldShowRedirectModal(redirectPopupTimestamp)) {
                return (
                  <div
                    key={i18n._(text)}
                    className="Footer-link a"
                    onClick={() => showRedirectModal && showRedirectModal(link)}
                  >
                    {i18n._(text)}
                  </div>
                );
              } else {
                const baseUrl = getAppBaseUrl();
                return (
                  <a key={i18n._(text)} href={baseUrl + link} className="Footer-link">
                    {i18n._(text)}
                  </a>
                );
              }
            }
            return (
              <NavLink key={link} to={link} className="Footer-link" activeClassName="active">
                {i18n._(text)}
              </NavLink>
            );
          })}
        </div> */}
      </div>
    </div>
  );
}
