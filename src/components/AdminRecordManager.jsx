import { useCallback, useEffect, useState } from "react";
import {
  createAdminContent,
  deleteAdminContent,
  getAdminContent,
  updateAdminContent,
} from "../services/adminContentService";

export default function AdminRecordManager({ title, table }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [recordId, setRecordId] = useState("");
  const [json, setJson] = useState("{\n  \n}");

  const refresh = useCallback(async () => {
    try {
      const records = await getAdminContent(table);
      setRows(records);
      setError("");
    } catch (requestError) {
      setError(requestError.message || `Unable to load ${title.toLowerCase()}.`);
    } finally {
      setLoading(false);
    }
  }, [table, title]);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (active) {
        void refresh();
      }
    });

    return () => {
      active = false;
    };
  }, [refresh]);

  function beginEdit(row) {
    setRecordId(String(row.id ?? ""));
    setJson(JSON.stringify(row, null, 2));
    setError("");
    setNotice("");
  }

  function resetForm() {
    setRecordId("");
    setJson("{\n  \n}");
  }

  async function handleSave(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    let record;
    try {
      record = JSON.parse(json);
    } catch {
      setError("Enter valid JSON before saving.");
      return;
    }

    setBusy(true);
    try {
      if (recordId) {
        await updateAdminContent(table, recordId, record);
        setNotice("Record updated.");
      } else {
        await createAdminContent(table, record);
        setNotice("Record created.");
      }
      resetForm();
      await refresh();
    } catch (requestError) {
      setError(requestError.message || "Unable to save this record.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this record? This cannot be undone.")) {
      return;
    }
    setError("");
    setNotice("");
    setBusy(true);
    try {
      await deleteAdminContent(table, id);
      setNotice("Record deleted.");
      if (recordId === String(id)) {
        resetForm();
      }
      await refresh();
    } catch (requestError) {
      setError(requestError.message || "Unable to delete this record.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="admin-panel">
      <header className="admin-panel-header">
        <div>
          <h2>{title}</h2>
          <span className="admin-row-count">{loading ? "Loading…" : `${rows.length} records`}</span>
        </div>
        <button type="button" className="admin-secondary-button" onClick={refresh} disabled={loading || busy}>
          Refresh
        </button>
      </header>
      {error && <p className="dashboard-error" role="alert">{error}</p>}
      {notice && <p className="admin-notice" role="status">{notice}</p>}

      <div className="admin-record-layout">
        <div className="admin-record-list">
          {loading ? (
            <p className="dashboard-muted" role="status">Loading records…</p>
          ) : rows.length === 0 ? (
            <p className="dashboard-muted">No records available.</p>
          ) : (
            rows.map((row, index) => (
              <article className="admin-record-row" key={row.id ?? `${table}-${index}`}>
                <div className="admin-record-json">
                  <strong>{row.title || row.name || row.email || row.id || `Record ${index + 1}`}</strong>
                  <code>{JSON.stringify(row)}</code>
                </div>
                <div className="admin-record-actions">
                  <button type="button" className="admin-secondary-button" onClick={() => beginEdit(row)} disabled={busy}>
                    Edit
                  </button>
                  <button type="button" className="admin-danger-button" onClick={() => handleDelete(row.id)} disabled={busy || !row.id}>
                    Delete
                  </button>
                </div>
              </article>
            ))
          )}
        </div>

        <form className="admin-json-form" onSubmit={handleSave}>
          <h3>{recordId ? "Edit record" : "Create record"}</h3>
          <p className="dashboard-muted">
            Enter a JSON object using columns supported by the existing Supabase table.
          </p>
          {recordId && (
            <p className="admin-editing-id">Editing ID: <code>{recordId}</code></p>
          )}
          <label htmlFor={`${table}-record-json`}>Record data (JSON)</label>
          <textarea
            id={`${table}-record-json`}
            value={json}
            onChange={(event) => setJson(event.target.value)}
            rows={12}
            spellCheck="false"
            required
          />
          <div className="admin-form-actions">
            <button type="submit" disabled={busy}>
              {busy ? "Saving…" : recordId ? "Update record" : "Create record"}
            </button>
            {recordId && (
              <button type="button" className="admin-secondary-button" onClick={resetForm} disabled={busy}>
                Cancel edit
              </button>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
