import { useCallback, useEffect, useState } from "react";
import {
  deleteResourceFile,
  listResourceFiles,
  uploadResource,
} from "../services/resourceService";
import {
  deleteQuestionPaper,
  listQuestionPapers,
  uploadQuestionPaper,
} from "../services/questionPaperService";
import { requireAdminUser } from "../services/adminService";

const STORAGE_ACTIONS = {
  "learning-materials": {
    list: listResourceFiles,
    upload: uploadResource,
    remove: deleteResourceFile,
  },
  "question-papers": {
    list: listQuestionPapers,
    upload: uploadQuestionPaper,
    remove: deleteQuestionPaper,
  },
};

export default function AdminStorageManager({ bucket, title }) {
  const [files, setFiles] = useState([]);
  const [folder, setFolder] = useState("");
  const [path, setPath] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const actions = STORAGE_ACTIONS[bucket];

  const refresh = useCallback(async () => {
    try {
      const entries = await actions.list(folder);
      setFiles(entries);
      setError("");
    } catch (requestError) {
      setError(requestError.message || `Unable to list ${title.toLowerCase()}.`);
    } finally {
      setLoading(false);
    }
  }, [actions, folder, title]);

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

  async function handleUpload(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    if (!file || !path.trim()) {
      setError("Select a file and provide its storage path.");
      return;
    }

    setBusy(true);
    try {
      await requireAdminUser();
      await actions.upload(file, path.trim());
      setNotice("File uploaded.");
      setFile(null);
      event.currentTarget.reset();
      await refresh();
    } catch (requestError) {
      setError(requestError.message || "Unable to upload the file.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(filePath) {
    if (!window.confirm(`Delete ${filePath}? This cannot be undone.`)) {
      return;
    }
    setError("");
    setNotice("");
    setBusy(true);
    try {
      await requireAdminUser();
      await actions.remove(filePath);
      setNotice("File deleted.");
      await refresh();
    } catch (requestError) {
      setError(requestError.message || "Unable to delete the file.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="admin-panel">
      <header className="admin-panel-header">
        <div>
          <h2>{title}</h2>
          <span className="admin-row-count">{loading ? "Loading…" : `${files.length} files`}</span>
        </div>
      </header>
      {error && <p className="dashboard-error" role="alert">{error}</p>}
      {notice && <p className="admin-notice" role="status">{notice}</p>}

      <form className="admin-storage-form" onSubmit={handleUpload}>
        <label>
          Storage folder
          <input
            value={folder}
            onChange={(event) => {
              setLoading(true);
              setFolder(event.target.value);
            }}
            placeholder="Optional folder path"
          />
        </label>
        <label>
          File path
          <input value={path} onChange={(event) => setPath(event.target.value)} placeholder="e.g. course/file.pdf" required />
        </label>
        <label>
          Choose file
          <input type="file" onChange={(event) => setFile(event.target.files?.[0] ?? null)} required />
        </label>
        <button type="submit" disabled={busy}>{busy ? "Working…" : "Upload file"}</button>
      </form>

      {loading ? (
        <p className="dashboard-muted" role="status">Loading files…</p>
      ) : files.length === 0 ? (
        <p className="dashboard-muted">No files in this folder.</p>
      ) : (
        <ul className="admin-file-list">
          {files.map((entry) => {
            const filePath = folder ? `${folder.replace(/\/$/, "")}/${entry.name}` : entry.name;
            return (
              <li key={filePath}>
                <span>{filePath}</span>
                <button
                  type="button"
                  className="admin-danger-button"
                  onClick={() => handleDelete(filePath)}
                  disabled={busy || !entry.name}
                >
                  Delete
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
