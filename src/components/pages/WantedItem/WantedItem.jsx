import { useEffect, useState } from "react";
import "./WantedItem.css";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { supabase } from "../../../utils/supabase";

export function WantedItem() {
  const [item, setItem] = useState(null);
  const { wantedItemID } = useParams();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    async function getWantedItem() {
      try {
        const { data, error } = await supabase.rpc("get_wanted_item", {
          p_item_id: wantedItemID,
          p_user_id: user?.auth_id,
        });

        if (error) {
          console.error(error);
          throw error.message;
        }
        if (!data) throw "Wanted item not found";

        setItem(data[0]);
      } catch (error) {
        console.error(error);
      }
    }

    getWantedItem();
  }, []);

  return (
    <div>
      <div className="wanted-poster">
        <h1>Wanted</h1>
        {item?.budget && <p>${item?.budget} Reward</p>}
      </div>
      {item && (
        <div className="item-info-container">
          <h2>{item.title}</h2>
          <p>{item.description}</p>
        </div>
      )}
    </div>
  );
}
