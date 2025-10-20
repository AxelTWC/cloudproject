"use client";

import { useEffect, useState } from "react";

interface TagType {
  id: number;
  name: string;
}

interface CommentType {
  id: number;
  text: string;
}

interface FileType {
  id: number;
  filename: string;
  url: string;
  version: number;
  createdAt: string;
  tags?: TagType[];
  comments?: CommentType[];
}

export default function Dashboard() {
  const [files, setFiles] = useState<FileType[]>([]);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [newTags, setNewTags] = useState<{ [key: number]: string }>({});
  const [newComments, setNewComments] = useState<{ [key: number]: string }>({});

  // TODO: 当前登录用户ID，后续可替换成登录状态
  const userId = "1";

  const fetchFiles = async () => {
    const res = await fetch("/api/files");
    const data = await res.json();
    setFiles(data);
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleUpload = async () => {
    if (!fileToUpload) return;

    const formData = new FormData();
    formData.append("file", fileToUpload);
    formData.append("userId", userId);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (res.ok) {
      setMessage("Upload successful!");
      setFileToUpload(null);
      fetchFiles();
    } else {
      setMessage(data.error || "Upload failed");
    }
  };

  const handleAddTag = async (fileId: number) => {
    const tagName = newTags[fileId];
    if (!tagName) return;

    const res = await fetch("/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileId, name: tagName }),
    });

    if (res.ok) {
      setFiles((prevFiles) =>
        prevFiles.map((f) =>
          f.id === fileId
            ? { ...f, tags: [...(f.tags || []), { id: Date.now(), name: tagName }] }
            : f
        )
      );
      setNewTags((prev) => ({ ...prev, [fileId]: "" }));
    }
  };

  const handleAddComment = async (fileId: number) => {
    const text = newComments[fileId];
    if (!text) return;

    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileId, text }),
    });

    if (res.ok) {
      const createdComment = await res.json();
      setFiles((prevFiles) =>
        prevFiles.map((f) =>
          f.id === fileId
            ? { ...f, comments: [...(f.comments || []), createdComment] }
            : f
        )
      );
      setNewComments((prev) => ({ ...prev, [fileId]: "" }));
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      {/* 上传表单 */}
      <div className="mb-6">
        <input
          type="file"
          onChange={(e) => setFileToUpload(e.target.files?.[0] ?? null)}
        />
        <button
          className="ml-2 px-4 py-2 bg-blue-600 text-white rounded"
          onClick={handleUpload}
        >
          Upload
        </button>
        {message && <p className="mt-2">{message}</p>}
      </div>

      <h2 className="text-xl font-semibold mb-2">Your Files</h2>
      <ul className="space-y-4">
        {files.map((file) => (
          <li
            key={file.id}
            className="border p-3 rounded flex flex-col md:flex-row md:justify-between md:items-start"
          >
            <div className="flex flex-col flex-1">
              <a
                href={`/api/download/${file.url.split("/").pop()}`}
                target="_blank"
                className="text-blue-500 underline font-medium"
              >
                {file.filename} {file.version && `(v${file.version})`}
              </a>
              <span className="text-gray-500 text-sm">
                Uploaded: {new Date(file.createdAt).toLocaleString()}
              </span>

              {/* 标签 */}
              <div className="mt-1 flex flex-wrap gap-2">
                {file.tags?.map((tag) => (
                  <span
                    key={tag.id}
                    className="bg-gray-200 text-gray-800 px-2 py-1 rounded text-sm"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>

              {/* 添加标签 */}
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  placeholder="Add tag"
                  value={newTags[file.id] || ""}
                  onChange={(e) =>
                    setNewTags((prev) => ({ ...prev, [file.id]: e.target.value }))
                  }
                  className="border px-2 py-1 rounded flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddTag(file.id);
                  }}
                />
                <button
                  className="px-3 py-1 bg-green-500 text-white rounded"
                  onClick={() => handleAddTag(file.id)}
                >
                  Add
                </button>
              </div>

              {/* 评论 */}
              <div className="mt-2 space-y-1">
                {file.comments?.map((c) => (
                  <div key={c.id} className="text-gray-700 text-sm border-l-2 pl-2">
                    {c.text}
                  </div>
                ))}
              </div>

              {/* 添加评论 */}
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  placeholder="Add comment"
                  value={newComments[file.id] || ""}
                  onChange={(e) =>
                    setNewComments((prev) => ({ ...prev, [file.id]: e.target.value }))
                  }
                  className="border px-2 py-1 rounded flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddComment(file.id);
                  }}
                />
                <button
                  className="px-3 py-1 bg-indigo-500 text-white rounded"
                  onClick={() => handleAddComment(file.id)}
                >
                  Add
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
