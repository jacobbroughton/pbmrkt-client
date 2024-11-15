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
                  {row.values.map((value, i) => (
                    <p>{i == 1 ? <i>{value}</i> : value}</p>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
