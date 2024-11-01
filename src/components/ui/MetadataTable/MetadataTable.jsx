import "./MetadataTable.css";

export function MetadataTable({ rows = [] }) {
  return (
    <div className="metadata-table">
      <div className="metadata-table-container">
        <table className="metadata">
          <tbody>
            {rows.map((row) => (
              <tr>
                <td>
                  <strong>{row.label}</strong>
                </td>
                <td>
                  {row.values.map((value) => (
                    <p className={`${value.style ? value.style : ""}`}>{value.text}</p>
                  ))}
                </td>
              </tr>
            ))}
            {/* <tr>e
              <td>Condition</td>
              <td>{item.info.condition}</td>
            </tr>
            <tr>
              <td>Shipping</td>
              <td>{item.info.shipping}</td>
            </tr>
            <tr>
              <td>Negotiable</td>
              <td>{item.info.negotiable}</td>
            </tr>
            <tr>
              <td>Trades</td>
              <td>
                <p>{item.info.trades}</p>
                {item.info.accepted_trades ? (
                  <p>
                    <i>"{item.info.accepted_trades}"</i>
                  </p>
                ) : (
                  false
                )}
              </td>
            </tr> */}
          </tbody>
        </table>
      </div>
    </div>
  );
}
