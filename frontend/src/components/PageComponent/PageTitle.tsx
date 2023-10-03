
import "./PageTitle.css";
import ExternalLink from "components/ExternalLink/ExternalLink";

export default function PageTitle(props) {
  const { title, descriptions, link, href } = props;
  return (
    <div className="Page-title-section component">
      <div className="Page-title">
        <div>{title}</div>
      </div>
      <div className="Page-description">
      <div className="row">
        <div className="col-lg-6 col-sm-12 col-md-12">
          {descriptions.map((des, index) => {
            return (
              <div key={index}> { des }</div>
            );
          })}
          {link && (
            <ExternalLink href={href}> {link}</ExternalLink>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
