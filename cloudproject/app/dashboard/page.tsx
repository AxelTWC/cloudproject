"use client";

import { useEffect, useState } from "react";

interface FileType {
  id: number;
  filename: string;
  url: string;
  version: number;
  createdAt: string;
}

export default function Dashboard() {
  const [files, setFiles] = useState<FileType[]>([]);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [message, setMessage] = useState("");
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

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

    
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
      <ul className="space-y-2">
        {files.map((file) => (
          <li key={file.id} className="border p-2 rounded flex justify-between items-center">
            <div>
              {/* <a 
                href={file.url}
                target="_blank"
                className="text-blue-500 underline mr-2"
              >
                {file.filename}
              </a> */}
              <a
                href={`/api/download/${file.url.split("/").pop()}`}
                target="_blank"
                className="text-blue-500 underline"
              >
                {file.filename} {file.version && `(v${file.version})`}
              </a>

              <span className="text-gray-500 text-sm">v{file.version}</span>
            </div>
            <span className="text-gray-400 text-sm">
              {new Date(file.createdAt).toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
