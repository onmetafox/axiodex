import cx from "classnames";
import "./PageRow.css";
export default function PageRow(props) {
  const { title, value, direction, className, subValue} = props;
  const classNames = cx("row page-row", className);
  return (
    <div className={classNames}>
      {(()=> {
        if(direction === "align-right"){
          return (
            <>
              <div className="col-6 title"><div>{title}</div></div>
              <div className="col-6 value align-right">{value} <span>{subValue}</span></div>
            </>
          )
        }else if(direction === "vertical"){
          return (
            <>
              <div className="title"><div>{title}</div></div>
              <div className="value"><div>{value} <span>{subValue}</span></div></div>
            </>
          )
        }else{
          return (
            <>
              <div className="col-6 title"><div>{title}</div></div>
              <div className="col-6 value"><div>{value} <span>{subValue}</span></div></div>
            </>
          )
        }
      })()}
    </div>
  );
}
