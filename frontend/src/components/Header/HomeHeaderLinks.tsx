import { FiX } from "react-icons/fi";
import logoImg from "img/logo_AXN.svg";
import { t } from "@lingui/macro";

import "./Header.css";
import { Link } from "react-router-dom";
import ExternalLink from "components/ExternalLink/ExternalLink";
import { HeaderLink } from "./HeaderLink";

type Props = {
  small?: boolean;
  clickCloseIcon?: () => void;
  redirectPopupTimestamp: number;
  showRedirectModal: (to: string) => void;
};

type HomeLink = { label: string; link: string; isHomeLink?: boolean | false };

const HOME_MENUS: HomeLink[] = [
  {
    label: t`Home`,
    isHomeLink: true,
    link: "/trade",
  },
  {
    label: t`About`,
    link: "https://github.com/Axnfinance",
  },
  // {
  //   label: t`Governance`,
  //   link: "https://gov.axn.finanace/",
  // },
  // {
  //   label: t`Voting`,
  //   link: "https://snapshot.org/#/gmx.eth",
  // },
  {
    label: t`Our Mission`,
    link: "https://docs.axnfinance.com/",
  },
  {
    label: t`Feature`,
    link: "https://docs.axnfinance.com/",
  },
];

export function HomeHeaderLinks({ small, clickCloseIcon, redirectPopupTimestamp, showRedirectModal }: Props) {
  return (
    <div className="App-header-links">
      {small && (
        <div className="App-header-links-header">
          <Link className="App-header-link-main" to="/">
           <img src={logoImg} alt="AXN Logo" />
          </Link>
          <div
            className="App-header-menu-icon-block mobile-cross-menu"
            onClick={() => clickCloseIcon && clickCloseIcon()}
          >
            <FiX className="App-header-menu-icon" />
          </div>
        </div>
      )}
      {HOME_MENUS.map(({ link, label, isHomeLink = false }) => {
        return (
          <div key={label} className="App-header-link-container">
            {isHomeLink ? (
              <HeaderLink
                to={link}
                redirectPopupTimestamp={redirectPopupTimestamp}
                showRedirectModal={showRedirectModal}
              >
                {label}
              </HeaderLink>
            ) : (
              <ExternalLink href={link}>{label}</ExternalLink>
            )}
          </div>
        );
      })}
    </div>
  );
}
