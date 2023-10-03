import cx from "classnames";
import { Trans, t } from "@lingui/macro";
import "./PageRow.css";
export default function PageRow(props) {
  const { title, value, direction, className, subValue} = props;
  const classNames = cx("row page-row", className);
  return (
    <div className={classNames}>
      {(()=> {
        if(direction == "align-right"){
          return (
            <>
              <div className="col-6 title"><Trans>{title}</Trans></div>
              <div className="col-6 value align-right">{value} <span>{subValue}</span></div>
            </>
          )
        }else if(direction == "vertical"){
          return (
            <>
              <div className="title"><Trans>{title}</Trans></div>
              <div className="value"><Trans>{value} <span>{subValue}</span></Trans></div>
            </>
          )
        }else{
          return (
            <>
              <div className="col-6 title"><Trans>{title}</Trans></div>
              <div className="col-6 value"><Trans>{value} <span>{subValue}</span></Trans></div>
            </>
          )
        }
      })()}
    </div>
  );
}
