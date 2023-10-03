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
              <div className="col-6 title">{title}</div>
              <div className="col-6 value align-right">{value} <span>{subValue}</span></div>
            </>
          )
        }else if(direction === "vertical"){
          return (
            <>
              <div className="title">{title}</div>
              <div className="value">{value} <span>{subValue}</span></div>
            </>
          )
        }else{
          return (
            <>
              <div className="col-6 title"><div>{title}</div></div>
              <div className="col-6 value">{value} <span>{subValue}</span></div>
            </>
          )
        }
      })()}
    </div>
  );
}
