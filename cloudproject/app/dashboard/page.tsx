"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const [files, setFiles] = useState<FileType[]>([]);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [newTags, setNewTags] = useState<{ [key: number]: string }>({});
  const [newComments, setNewComments] = useState<{ [key: number]: string }>({});
  const [versionsByFile, setVersionsByFile] = useState<Record<string, FileType[]>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [restoring, setRestoring] = useState<Record<string, boolean>>({});

  // per-logical-filename selected file for uploading a new version
  const [uploadFiles, setUploadFiles] = useState<Record<string, File | null>>({});

  
  const fetchFiles = async () => {
    const res = await fetch("/api/files", { credentials: "include" });
    const data = await res.json();
    setFiles(data);
  };

  const fetchVersions = async (filename: string) => {
    try {
      setLoading(prev => ({ ...prev, [filename]: true }));
      const res = await fetch(`/api/files/versions?filename=${encodeURIComponent(filename)}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setVersionsByFile(prev => ({ ...prev, [filename]: data }));
        setExpanded(prev => ({ ...prev, [filename]: true }));
      } else {
        const err = await res.json();
        setMessage(err.error || 'Failed to load versions');
      }
    } catch (err) {
      console.error(err);
      setMessage('Failed to load versions');
    } finally {
      setLoading(prev => ({ ...prev, [filename]: false }));
    }
  };

  const handleRestore = async (filename: string, version: number) => {
    if (!confirm(`Restore version ${version} of ${filename}? This will update the current version to match this content.`)) return;
    
    try {
      setRestoring(prev => ({ ...prev, [filename]: true }));
      const res = await fetch('/api/files/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, version }),
        credentials: 'include',
      });
      if (res.ok) {
        setMessage('Version restored successfully');
        await fetchFiles();
        // refresh versions
        await fetchVersions(filename);
      } else {
        const err = await res.json();
        setMessage(err.error || 'Restore failed');
      }
    } catch (err) {
      console.error(err);
      setMessage('Restore failed');
    } finally {
      setRestoring(prev => ({ ...prev, [filename]: false }));
    }
  };

  const handleDeleteVersion = async (filename: string, version: number) => {
    if (!confirm(`Delete version ${version} of ${filename}? This cannot be undone.`)) return;
    try {
      const res = await fetch('/api/files/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, version }),
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // remove the version from local state
        setVersionsByFile(prev => {
          const list = (prev[filename] || []).filter(v => v.version !== version);
          return { ...prev, [filename]: list };
        });
        // refresh main file list to update latest pointers
        fetchFiles();
        setMessage('Version deleted successfully');
      } else {
        setMessage(data.error || 'Delete failed');
      }
    } catch (err) {
      console.error(err);
      setMessage('Delete failed');
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/logout', { method: 'POST', credentials: 'include' });
      if (res.ok) {
        // navigate to login page
        router.push('/login');
      } else {
        console.error('Logout failed');
      }
    } catch (err) {
      console.error('Logout error', err);
    }
  };

  const handleUpload = async () => {
    if (!fileToUpload) return;

    const formData = new FormData();
    formData.append("file", fileToUpload);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
      credentials: "include", 
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

  // Upload a new version for a specific logical filename
  const handleUploadFor = async (logicalFilename: string) => {
    const f = (uploadFiles && uploadFiles[logicalFilename]) ?? null;
    if (!f) {
      setMessage('No file selected for ' + logicalFilename);
      return;
    }

    const formData = new FormData();
    formData.append('file', f);
    formData.append('logicalFilename', logicalFilename);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    const data = await res.json();
    if (res.ok) {
      setMessage('Upload successful!');
      setUploadFiles((prev) => ({ ...prev, [logicalFilename]: null }));
      fetchFiles();
      fetchVersions(logicalFilename);
    } else {
      setMessage(data.error || 'Upload failed');
    }
  };

  const handleAddTag = async (fileId: number) => {
    const tagName = newTags[fileId];
    if (!tagName) return;

    const res = await fetch("/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileId, name: tagName }),
      credentials: "include", 
    });

    if (res.ok) {
      const createdTag = await res.json();
      // update top-level files list
      setFiles((prevFiles) =>
        prevFiles.map((f) =>
          f.id === fileId
            ? { ...f, tags: [...(f.tags || []), createdTag] }
            : f
        )
      );
      // also update versionsByFile if we have versions for this filename
      const fileObj = files.find(f => f.id === fileId);
      if (fileObj) {
        const logical = fileObj.filename;
        setVersionsByFile(prev => {
          const list = prev[logical];
          if (!list) return prev;
          const updated = list.map(v => v.id === fileId ? { ...v, tags: [...(v.tags || []), createdTag] } : v);
          return { ...prev, [logical]: updated };
        });
      }
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
      credentials: "include", 
    });

    if (res.ok) {
      const createdComment = await res.json();
      // update top-level files list
      setFiles((prevFiles) =>
        prevFiles.map((f) =>
          f.id === fileId
            ? { ...f, comments: [...(f.comments || []), createdComment] }
            : f
        )
      );
      // also update versionsByFile if present
      const fileObj = files.find(f => f.id === fileId);
      if (fileObj) {
        const logical = fileObj.filename;
        setVersionsByFile(prev => {
          const list = prev[logical];
          if (!list) return prev;
          const updated = list.map(v => v.id === fileId ? { ...v, comments: [...(v.comments || []), createdComment] } : v);
          return { ...prev, [logical]: updated };
        });
      }
      setNewComments((prev) => ({ ...prev, [fileId]: "" }));
    }
  };

  const handleDeleteTag = async (tagId: number) => {
    if (!confirm('Delete this tag?')) return;
    try {
      const res = await fetch('/api/tags', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: tagId }),
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // remove tag from files and versions cache
        setFiles(prev => prev.map(f => ({ ...f, tags: (f.tags || []).filter(t => t.id !== tagId) })));
        setVersionsByFile(prev => {
          const updated: Record<string, FileType[]> = {};
          for (const key of Object.keys(prev)) {
            updated[key] = prev[key].map(v => ({ ...v, tags: (v.tags || []).filter(t => t.id !== tagId) }));
          }
          return updated;
        });
        setMessage('Tag deleted');
      } else {
        setMessage(data.error || 'Delete failed');
      }
    } catch (err) {
      console.error(err);
      setMessage('Delete failed');
    }
  };

  const handleClearTags = async (fileId: number) => {
    if (!confirm('Clear all tags for this file/version?')) return;
    try {
      const res = await fetch('/api/tags', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId, all: true }),
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFiles(prev => prev.map(f => f.id === fileId ? { ...f, tags: [] } : f));
        setVersionsByFile(prev => {
          const updated = { ...prev };
          for (const key of Object.keys(updated)) {
            updated[key] = updated[key].map(v => v.id === fileId ? { ...v, tags: [] } : v);
          }
          return updated;
        });
        setMessage('Tags cleared');
      } else {
        setMessage(data.error || 'Clear failed');
      }
    } catch (err) {
      console.error(err);
      setMessage('Clear failed');
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('Delete this comment?')) return;
    try {
      const res = await fetch('/api/comments', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: commentId }),
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFiles(prev => prev.map(f => ({ ...f, comments: (f.comments || []).filter(c => c.id !== commentId) })));
        setVersionsByFile(prev => {
          const updated: Record<string, FileType[]> = {};
          for (const key of Object.keys(prev)) {
            updated[key] = prev[key].map(v => ({ ...v, comments: (v.comments || []).filter(c => c.id !== commentId) }));
          }
          return updated;
        });
        setMessage('Comment deleted');
      } else {
        setMessage(data.error || 'Delete failed');
      }
    } catch (err) {
      console.error(err);
      setMessage('Delete failed');
    }
  };

  const handleClearComments = async (fileId: number) => {
    if (!confirm('Clear all comments for this file/version?')) return;
    try {
      const res = await fetch('/api/comments', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId, all: true }),
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFiles(prev => prev.map(f => f.id === fileId ? { ...f, comments: [] } : f));
        setVersionsByFile(prev => {
          const updated = { ...prev };
          for (const key of Object.keys(updated)) {
            updated[key] = updated[key].map(v => v.id === fileId ? { ...v, comments: [] } : v);
          }
          return updated;
        });
        setMessage('Comments cleared');
      } else {
        setMessage(data.error || 'Clear failed');
      }
    } catch (err) {
      console.error(err);
      setMessage('Clear failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors duration-200 flex items-center gap-2"
              title="Log out"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Global upload form */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload New File</h2>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Choose a file</label>
            <input
              type="file"
              onChange={(e) => setFileToUpload(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          <button
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200 flex items-center gap-2 self-end"
            onClick={handleUpload}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            Upload
          </button>
        </div>
        {message && (
          <div className={`mt-4 p-3 rounded-md ${message.includes('successful') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {message}
          </div>
        )}
      </div>

      {/* Upload new version: Each file can be updated with a new version (in its own section) */}

      <h2 className="text-xl font-semibold mb-2">Your Files</h2>
      <ul className="space-y-4">
        {Object.values(files.reduce<Record<string, FileType[]>>((acc, f) => {
          (acc[f.filename] = acc[f.filename] || []).push(f);
          return acc;
        }, {})).map((group) => {
          const latest = group.reduce((a, b) => a.version > b.version ? a : b);
          const filename = latest.filename;
          return (
            <li key={filename} className="border p-3 rounded">
              <div className="space-y-4">
                {/* File header and metadata */}
                <div className="flex items-start justify-between">
                  <div>
                    <a href={`/api/download/${latest.url.split("/").pop()}`} target="_blank" className="text-blue-500 underline font-medium">
                      {latest.filename} (v{latest.version})
                    </a>
                    <div className="text-gray-500 text-sm">Uploaded: {new Date(latest.createdAt).toLocaleString()}</div>
                  </div>

                  <div className="flex gap-2 items-center">
                    <button 
                      onClick={() => {
                        if (expanded[filename]) {
                          setExpanded(prev => ({ ...prev, [filename]: false }));
                        } else {
                          fetchVersions(filename);
                        }
                      }} 
                      className="px-3 py-1 border rounded hover:bg-gray-50 relative"
                      disabled={loading[filename]}
                      title={expanded[filename] ? 'Hide version history' : 'Show version history and manage tags/comments'}
                    >
                      {loading[filename] ? (
                        <div className="flex items-center gap-2">
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Loading...
                        </div>
                      ) : (
                        expanded[filename] ? 'Hide versions' : 'View versions'
                      )}
                    </button>

                    {/* Upload new version controls */}
                    <div className="relative group">
                      <input
                        type="file"
                        onChange={(e) => setUploadFiles(prev => ({ ...prev, [filename]: e.target.files?.[0] ?? null }))}
                        className="text-sm"
                        title="Select a file to upload as a new version"
                      />
                      <button
                        onClick={() => handleUploadFor(filename)}
                        className="ml-2 px-3 py-1 bg-green-600 text-white rounded"
                      >
                        Upload new version
                      </button>
                    </div>
                  </div>
                </div>

                {/* versions list */}
                {expanded[filename] && (
                  <div className="border-t pt-3">
                    {(versionsByFile[filename] || group.sort((a,b)=>b.version-a.version)).map(v => (
                      <div key={v.id} className="py-2 border-b last:border-b-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <a className="text-blue-600 underline" href={`/api/download/${v.url.split("/").pop()}`} target="_blank">v{v.version}</a>
                            <span className="text-gray-500 text-sm ml-2">{new Date(v.createdAt).toLocaleString()}</span>

                            {/* version tags */}
                            <div className="mt-1">
                              {(v.tags || []).length > 0 ? (
                                <div className="flex flex-wrap gap-2 items-center">
                                  {(v.tags || []).map(t => (
                                    <div key={t.id} className="flex items-center gap-2 bg-gray-100 px-2 py-1 rounded text-xs">
                                      <span>{t.name}</span>
                                      <button onClick={() => handleDeleteTag(t.id)} className="text-xs text-red-600 px-1">×</button>
                                    </div>
                                  ))}
                                  <button onClick={() => handleClearTags(v.id)} className="ml-2 text-xs px-2 py-1 border rounded">Clear tags</button>
                                </div>
                              ) : (
                                <div className="text-xs text-gray-400">No tags</div>
                              )}
                            </div>

                            {/* version comments */}
                            <div className="mt-1">
                              {(v.comments || []).length > 0 ? (
                                <div className="space-y-1">
                                  {(v.comments || []).map(c => (
                                    <div key={c.id} className="flex items-center gap-2 text-xs text-gray-700">
                                      <span>• {c.text}</span>
                                      <button onClick={() => handleDeleteComment(c.id)} className="text-[10px] text-red-600">Delete</button>
                                    </div>
                                  ))}
                                  <button onClick={() => handleClearComments(v.id)} className="mt-1 text-xs px-2 py-1 border rounded">Clear comments</button>
                                </div>
                              ) : (
                                <div className="text-xs text-gray-400">No comments</div>
                              )}
                            </div>

                            {/* add tag/comment only within version view */}
                            <div className="mt-2 border-t pt-2 space-y-2">
                              <div className="flex items-center gap-2" title="Add tags to help organize and find this version">
                                <input
                                  type="text"
                                  value={newTags[v.id] || ""}
                                  onChange={(e) => setNewTags(prev => ({ ...prev, [v.id]: e.target.value }))}
                                  placeholder="Add a tag..."
                                  className="border p-1 text-sm rounded"
                                  onKeyDown={(e) => e.key === 'Enter' && handleAddTag(v.id)}
                                />
                                <button
                                  onClick={() => handleAddTag(v.id)}
                                  className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                                >
                                  Add Tag
                                </button>
                              </div>

                              <div className="flex items-center gap-2" title="Add notes or descriptions to this version">
                                <input
                                  type="text"
                                  value={newComments[v.id] || ""}
                                  onChange={(e) => setNewComments(prev => ({ ...prev, [v.id]: e.target.value }))}
                                  placeholder="Add a comment..."
                                  className="border p-1 text-sm rounded flex-1"
                                  onKeyDown={(e) => e.key === 'Enter' && handleAddComment(v.id)}
                                />
                                <button
                                  onClick={() => handleAddComment(v.id)}
                                  className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                                >
                                  Add Comment
                                </button>
                              </div>
                            </div>

                          </div>

                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleRestore(filename, v.version)} 
                              className={`px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1`}
                              disabled={restoring[filename]}
                              title="Restore this version (updates the latest version to match this content)"
                            >
                              {restoring[filename] ? (
                                <>
                                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                  </svg>
                                  Restoring...
                                </>
                              ) : 'Restore'}
                            </button>
                            <a 
                              href={`/api/download/${v.url.split("/").pop()}`} 
                              className="px-2 py-1 border rounded hover:bg-gray-50"
                              title="Download this version"
                            >
                              Download
                            </a>
                            <button 
                              onClick={() => handleDeleteVersion(filename, v.version)} 
                              className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                              title="Permanently delete this version"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  </div>
  );
}
