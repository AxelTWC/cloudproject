"use client";

import { useEffect, useState } from "react";

interface FileType {
  id: number;
  filename: string;
  url: string;
  version: number;
  createdAt: string;
  tags?: { id: number; name: string }[];
}

export default function Dashboard() {
  const [files, setFiles] = useState<FileType[]>([]);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [newTags, setNewTags] = useState<{ [key: number]: string }>({});

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
      setNewTags((prev) => ({ ...prev, [fileId]: "" }));
      fetchFiles();
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
            className="border p-3 rounded flex flex-col md:flex-row md:justify-between md:items-center"
          >
            <div className="flex flex-col">
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

              {/* 显示标签 */}
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

              {/* 添加新标签 */}
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  placeholder="Add tag"
                  value={newTags[file.id] || ""}
                  onChange={(e) =>
                    setNewTags((prev) => ({ ...prev, [file.id]: e.target.value }))
                  }
                  className="border px-2 py-1 rounded"
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
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
