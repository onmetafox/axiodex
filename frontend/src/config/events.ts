// date format: d MMM yyyy, H:mm, time should be specifed based on UTC time

export type EventData = {
  id: string;
  title: string;
  isActive?: boolean;
  validTill: string;
  bodyText: string | string[];
  buttons: {
    text: string;
    link: string;
    newTab: boolean;
  }[];
};

export const homeEventsData: EventData[] = [
  // {
  //   id: "avax-norush-contest",
  //   title: "GMXRUSH Trading Contest",
  //   isActive: true,
  //   validTill: "23 Nov 2022, 12:00",
  //   bodyText: [
  //     "The #GMXRUSH Trading Contest is active on #Avalanche from November 16 12:00 UTC to November 23 12:00 UTC.",
  //     "Showcase your trading abilities transparently on-chain, and win big prizes.",
  //   ],
  //   buttons: [
  //     {
  //       text: "Learn More",
  //       link: "https://medium.com/@axn.finanace/sign-up-for-the-gmxrush-avalanche-trading-contest-win-100-000-usd-in-prizes-546b1ab2e416",
  //       newTab: true,
  //     },
  //   ],
  // },
  // {
  //   id: "app-gmx-io-launch",
  //   title: "Frontend Updates",
  //   isActive: true,
  //   validTill: "10 Jul 2022, 12:00",
  //   bodyText:
  //     "Updates have been applied to the AXN frontend to inform users of the separation between axn.finanace and app.axn.finanace",
  //   buttons: [
  //     {
  //       text: "Read More",
  //       link: "https://medium.com/@axn.finanace/gmx-frontend-updates-8d13f2346e1e",
  //       newTab: true,
  //     },
  //   ],
  // },
  // {
  //   id: "arbitrum-nitro-upgrade",
  //   title: "Arbitrum Nitro Upgrade",
  //   isActive: true,
  //   validTill: "31 Aug 2022, 20:00",
  //   bodyText: "The Arbitrum Nitro upgrade has been completed.",
  //   buttons: [
  //     {
  //       text: "Read More",
  //       link: "https://medium.com/@axn.finanace/arbitrum-nitro-5f88c03a46fe",
  //       newTab: true,
  //     },
  //   ],
  // },
  // {
  //   id: "usdc-depeg",
  //   title: "USDC has currently lost its peg to USD",
  //   isActive: true,
  //   validTill: "18 Dec 2023, 12:00",
  //   bodyText:
  //     "There is a high spread for USDC on AXN, reflecting its current market-wide trading price. These spreads may impact your leverage short positions using USDC as collateral, swaps into and out of USDC, and any other transactions involving USDC, including minting/burning TLP.",
  //   buttons: [],
  // },
];

export const appEventsData: EventData[] = [
  // {
  //   id: "avax-norush-contest",
  //   title: "GMXRUSH Trading Contest",
  //   isActive: true,
  //   validTill: "23 Nov 2022, 12:00",
  //   bodyText: [
  //     "The #GMXRUSH Trading Contest is active on #Avalanche from November 16 12:00 UTC to November 23 12:00 UTC.",
  //     "Showcase your trading abilities transparently on-chain, and win big prizes.",
  //   ],
  //   buttons: [
  //     {
  //       text: "Learn More",
  //       link: "https://medium.com/@axn.finanace/sign-up-for-the-gmxrush-avalanche-trading-contest-win-100-000-usd-in-prizes-546b1ab2e416",
  //       newTab: true,
  //     },
  //   ],
  // },
  // {
  //   id: "removal-of-min-profit-rule",
  //   title: "Trading improvements",
  //   isActive: true,
  //   validTill: "1 Apr 2022, 12:00",
  //   bodyText: "The 1.5% minimum profit rule has been removed",
  //   buttons: [
  //     {
  //       text: "Read more",
  //       link: "https://gmxio.gitbook.io/gmx/roadmap#30-march-2022",
  //       newTab: true,
  //     },
  //     {
  //       text: "Trade Now",
  //       link: "https://axn.finanace/trade",
  //     },
  //   ],
  // },
  // {
  //   id: "shorting-of-link-uni-re-enabled",
  //   title: "Shorting of LINK and UNI",
  //   isActive: true,
  //   validTill: "20 Apr 2022, 12:00",
  //   bodyText: "Shorting has been re-enabled for LINK and UNI.",
  //   buttons: [
  //     {
  //       text: "Trade Now",
  //       link: "https://axn.finanace/trade",
  //     },
  //   ],
  // },
  // {
  //   id: "speed-up-page-loading",
  //   title: "Speed Up Page Loading",
  //   isActive: true,
  //   validTill: "4 May 2022, 12:00",
  //   bodyText: "If you experience data loading issues, please use a free RPC URL from Alchemy.",
  //   buttons: [
  //     {
  //       text: "Learn More",
  //       link: "https://gmxio.gitbook.io/gmx/trading#backup-rpc-urls",
  //       newTab: true,
  //     },
  //   ],
  // },
  // {
  //   id: "referral-program-launch",
  //   title: "Referral Program Launch",
  //   isActive: true,
  //   validTill: "4 May 2022, 12:00",
  //   bodyText: "The AXN referral program is now live! Get fee discounts and refer traders to earn rewards.",
  //   buttons: [
  //     {
  //       text: "Read More",
  //       link: "https://axn.finanace/referrals",
  //     },
  //     {
  //       text: "Join Now",
  //       link: "https://axn.finanace/referrals",
  //     },
  //   ],
  // },
  // {
  //   id: "gmx-arbitrum-odyssey",
  //   title: "AXN Arbitrum Odyssey",
  //   isActive: true,
  //   validTill: "3 Jul 2022, 12:00",
  //   bodyText:
  //     "The AXN Arbitrum Odyssey is taking place this week, all participants will receive prizes. Read on to find out more.",
  //   buttons: [
  //     {
  //       text: "Read More",
  //       link: "https://medium.com/@axn.finanace/gmx-arbitrum-odyssey-fc12cba2d10d",
  //     },
  //   ],
  // },
  // {
  //   id: "fix-arbitrum-transaction-issues",
  //   title: "Fix Arbitrum Transactions",
  //   isActive: true,
  //   validTill: "30 Jun 2022, 12:00",
  //   bodyText:
  //     "If you experience transaction errors on Arbitrum or data loading issues, please use a free RPC URL from Alchemy.",
  //   buttons: [
  //     {
  //       text: "Learn More",
  //       link: "https://gmxio.gitbook.io/gmx/trading#backup-rpc-urls",
  //       newTab: true,
  //     },
  //   ],
  // },
  // {
  //   id: "gmx-arbitrum-odyssey-paused",
  //   title: "AXN Arbitrum Odyssey Paused",
  //   isActive: true,
  //   validTill: "3 Jul 2022, 12:00",
  //   bodyText: "The AXN Arbitrum Odyssey has been paused. Please read the linked post for more information.",
  //   buttons: [
  //     {
  //       text: "Read More",
  //       link: "https://twitter.com/GMX_IO/status/1542163585111150592",
  //       newTab: true,
  //     },
  //   ],
  // },
  // {
  //   id: "app-gmx-io",
  //   title: "Frontend Updates",
  //   isActive: true,
  //   validTill: "6 Jul 2022, 12:00",
  //   bodyText:
  //     "On 6 Jul 2022, updates will be applied to the AXN frontend to inform users of the separation between axn.finanace and app.axn.finanace",
  //   buttons: [
  //     {
  //       text: "Read More",
  //       link: "https://medium.com/@axn.finanace/gmx-frontend-updates-8d13f2346e1e",
  //       newTab: true,
  //     },
  //   ],
  // },
  // {
  //   id: "degraded-alchemy-performance",
  //   title: "Alchemy RPC",
  //   isActive: true,
  //   validTill: "3 Jul 2022, 12:00",
  //   bodyText:
  //     "There are ongoing syncing issues on Alchemy for Arbitrum at the moment, please check their status page and use the public Arbitrum RPC in the meantime",
  //   buttons: [
  //     {
  //       text: "Check Status",
  //       link: "https://status.alchemy.com/",
  //       newTab: true,
  //     },
  //     {
  //       text: "Public RPC URL",
  //       link: "https://metamask.zendesk.com/hc/en-us/articles/4415758358299-Network-profile-Arbitrum",
  //       newTab: true,
  //     },
  //   ],
  // },
  // {
  //   id: "app-gmx-io-settings",
  //   title: "Frontend Updates",
  //   isActive: true,
  //   validTill: "10 Jul 2022, 12:00",
  //   bodyText:
  //     "You are currently using app.axn.finanace. Customized settings have been reset, you may need to adjust your settings by clicking on the menu in the top right after connecting your wallet.",
  //   buttons: [
  //     {
  //       text: "Read More",
  //       link: "https://medium.com/@axn.finanace/gmx-frontend-updates-8d13f2346e1e",
  //       newTab: true,
  //     },
  //   ],
  // },
  // {
  //   id: "use-alchemy-rpc-url",
  //   title: "Use Alchemy RPC URL",
  //   isActive: true,
  //   validTill: "10 Jul 2022, 12:00",
  //   bodyText:
  //     "If you experience data loading or transaction issues on Arbitrum, please use a free RPC URL from Alchemy.",
  //   buttons: [
  //     {
  //       text: "Learn More",
  //       link: "https://gmxio.gitbook.io/gmx/trading#backup-rpc-urls",
  //       newTab: true,
  //     },
  //   ],
  // },
  // {
  //   id: "arbitrum-nitro-upgrade",
  //   title: "Arbitrum Nitro Upgrade",
  //   isActive: true,
  //   validTill: "31 Aug 2022, 20:00",
  //   bodyText: "The Arbitrum Nitro upgrade has been completed.",
  //   buttons: [
  //     {
  //       text: "Read More",
  //       link: "https://medium.com/@axn.finanace/arbitrum-nitro-5f88c03a46fe",
  //       newTab: true,
  //     },
  //   ],
  // },
  // {
  //   id: "position-router-updates",
  //   title: "Position Router Updates",
  //   isActive: true,
  //   validTill: "19 Oct 2022, 20:00",
  //   bodyText: "Position routers have been updated, existing users may have to re-enable leverage.",
  //   buttons: [
  //     {
  //       text: "Read More",
  //       link: "https://medium.com/@axn.finanace/gmx-deployment-updates-a6a470df445f",
  //       newTab: true,
  //     },
  //   ],
  // },
  // {
  //   id: "glp-manager-updates",
  //   title: "ALP Manager Updates",
  //   isActive: true,
  //   validTill: "18 Dec 2022, 12:00",
  //   bodyText:
  //     "The ALP Manager address has been updated based on the linked post, existing users will need to approve the new ALP Manager to buy ALP tokens.",
  //   buttons: [
  //     {
  //       text: "Read More",
  //       link: "https://medium.com/@axn.finanace/gmx-deployment-updates-nov-2022-16572314874d",
  //       newTab: true,
  //     },
  //   ],
  // },
  // {
  //   id: "usdc-depeg",
  //   title: "USDC has currently lost its peg to USD",
  //   isActive: true,
  //   validTill: "18 Dec 2023, 12:00",
  //   bodyText:
  //     "There is a high spread for USDC on AXN, reflecting its current market-wide trading price. These spreads may impact your leverage short positions using USDC as collateral, swaps into and out of USDC, and any other transactions involving USDC, including minting/burning TLP.",
  //   buttons: [],
  // },
  {
    id: "testnet notification",
    title: "Notice",
    isActive: true,
    validTill: "18 Dec 2023, 12:00",
    bodyText:
      "This is a beta preview based on Goerli Testnet of Basechain. All data is based on contracts deployed on testnet and therefore does not reflect current live market values",
    buttons: [],
  },
];
