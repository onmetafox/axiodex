import React from "react";
import { t } from "@lingui/macro";
import "./ItemCard.css";

function ItemCard(props) {
  const { imgPath, name, power, pageKind, tokenId, onSelectAction, isActing } = props;

  const getPrimaryText = () => {
    if (pageKind === "stake") {
        if (isActing) {
            return t`Staking...`;
        }
        return t`Stake`;
    }
    if (pageKind === "approve") {
        if (isActing) {
            return t`Approving...`;
        }
        return t`Approve`;
    }
    if (pageKind === "unStake") {
        if (isActing) {
            return t`Unstaking...`;
        }
        return t`UnStake`;
    }
  };

  const onSelect = async () => {
    onSelectAction(tokenId);
  };

  return (
    <div className="sc-card-product">
        <div className="card-media">
            <img src={imgPath} alt="" />
        </div>
        <div className="card-title"  >
          {name}
        </div>
        <div className="meta-info">
            <span>Power: </span>
            <span className="pricing">
                {power}
            </span>
        </div>
        { pageKind !== "list" && (
            <div className="card-bottom text-center">
                <button className="sc-button default-btn" onClick={onSelect} disabled={isActing}>
                    <span>{getPrimaryText()}</span>
                </button>
            </div>
        )}
    </div> 
  );
}

export default ItemCard;
