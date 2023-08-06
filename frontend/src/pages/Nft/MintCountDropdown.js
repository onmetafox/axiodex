import { Menu } from "@headlessui/react";
import "./MintCountDropdown.css";
import { NETWORK_METADATA } from "config/chains";
import { useChainId } from "lib/chains";
import dropdownIc from "img/dropdown-ic.svg";

function MintCountDropdown(props) {
  const { selectedCount, onSelectCount, price } = props;
  const { chainId } = useChainId();

  const counts = [1, 2, 3, 4, 5];

  const onSelect = async (count) => {
    onSelectCount(count);
  };

  var value = selectedCount;

  const UNIT = NETWORK_METADATA[chainId].nativeCurrency.name

  return (
    <Menu>
      <Menu.Button as="div" className="nft-dropdown-arrow center-both">
        <button className="PositionDropdown-dots-icon btn-dropdown"> 
          <div className="content-dropdown">{value}
            <span>&nbsp;({price} {UNIT})</span>
          </div>
          <img src={dropdownIc} className="icon-down" alt="icon" />
        </button>
      </Menu.Button>
      <div className="PositionDropdown-extra-options">
        <Menu.Items as="div" className="menu-items">
            {counts.map((count, index) => (
              <Menu.Item key={index}>
                <div
                  className="menu-item"
                  onClick={() => {
                    onSelect(count);
                  }}
                >
                  <p>
                    {count}
                  </p>
                </div>
              </Menu.Item>
            ))}
          </Menu.Items>
      </div>
    </Menu>
  );
}

export default MintCountDropdown;
