import cx from "classnames";

import { Trans, t } from "@lingui/macro";
import "./ImgIcon2.css";

export default function ImgIcon2(props) {
  const { icon, alt, title, value ,className } = props;
  let classNames = cx("icon2-container", className);
  return (
    <div className={classNames}>
      {
        icon && (
          <div className="icon">
            <img src={icon} alt={alt} style={{width:'100%'}} />
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
