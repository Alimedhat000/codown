import { useParams } from "react-router";
import { useEffect, useState } from "react";
import { api } from "@/api/axios";
import { Link } from "react-router";

export default function DocumentPage() {
  const { id } = useParams();
  const [doc, setDoc] = useState<{ title: string; content: string } | null>(
    null
  );

  const [editedDoc, setEditedDoc] = useState<{
    title: string;
    content: string;
  }>({
    title: "",
    content: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get(`/document/${id}`).then((res) => {
      setDoc(res.data);
      setEditedDoc(res.data);
      setLoading(false);
    });
  }, [id]);

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.put(`/document/${id}`, editedDoc);
      setDoc(editedDoc);
    } catch (err) {
      console.error("Failed to save document:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <Link to="/dashboard/docs">← Back to Dashboard</Link>
      {doc ? null : null}
      <div style={{ marginTop: "1rem" }}>
        <input
          type="text"
          value={editedDoc.title}
          onChange={(e) =>
            setEditedDoc({ ...editedDoc, title: e.target.value })
          }
          style={{ fontSize: "1.5rem", width: "100%", marginBottom: "1rem" }}
        />
        <textarea
          value={editedDoc.content}
          onChange={(e) =>
            setEditedDoc({ ...editedDoc, content: e.target.value })
          }
          rows={15}
          style={{ width: "100%", fontFamily: "monospace", fontSize: "1rem" }}
        />

        <button
          onClick={handleSave}
          disabled={saving}
          style={{ marginTop: "1rem" }}
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </>
  );
}
