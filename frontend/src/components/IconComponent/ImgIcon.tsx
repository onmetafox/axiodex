import cx from "classnames";

import { Trans, t } from "@lingui/macro";
import "./ImgIcon.css";

export default function ImgIcon(props) {
  const { icon, alt, title, value ,className } = props;
  let classNames = cx("icon-container", className);
  return (
    <div className={classNames}>
      {
        icon && (
          <div className="icon">
            <img src={icon} alt={alt} />
          </div>
        )
      }

      <div className="detail">
        <div className="title">
          {title}
        </div>
        <div className="value">
          {value}
        </div>
      </div>
    </div>
  );
}
