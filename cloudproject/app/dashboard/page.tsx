"use client";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    fetch("/api/files")
      .then(res => res.json())
      .then(data => setFiles(data));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Your Files</h1>
      <ul>
        {files.map((file: any) => (
          <li key={file.id}>
            <a href={file.url} target="_blank" className="text-blue-500 underline">
              {file.filename}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
