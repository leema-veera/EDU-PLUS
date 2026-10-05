function cellValue(value) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
}

export default function AdminTable({ title, rows, loading, error, columns }) {
  return (
    <section className="admin-panel">
      <header className="admin-panel-header">
        <div>
          <h2>{title}</h2>
          {!loading && !error && <span className="admin-row-count">{rows.length} records</span>}
        </div>
      </header>
      {loading ? (
        <p className="dashboard-muted" role="status">Loading {title.toLowerCase()}…</p>
      ) : error ? (
        <p className="dashboard-error" role="alert">{error}</p>
      ) : rows.length === 0 ? (
        <p className="dashboard-muted">No records available.</p>
      ) : (
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                {columns.map(([key, label]) => <th key={key} scope="col">{label}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.id ?? `${title}-${index}`}>
                  {columns.map(([key]) => (
                    <td key={key}>{cellValue(row[key])}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
