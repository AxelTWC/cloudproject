export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="max-w-3xl w-full p-10 rounded-2xl shadow-xl backdrop-blur-md bg-white/80 border border-white/40">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">
            CloudShare
          </h1>
          <p className="mt-2 text-lg text-blue-700 font-medium">
            Private Team File Sharing, Reimagined
          </p>
        </div>

        {/* Description */}
        <p className="mt-6 text-gray-700 text-center leading-relaxed">
          CloudShare is a self-hosted collaboration and file-sharing platform that puts privacy and control first.
          Upload, manage, and version your files with your team — all while keeping your data in your hands.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
          <a
            href="/register"
            className="px-6 py-3 rounded-full text-white bg-gradient-to-r from-blue-600 to-blue-500 shadow hover:shadow-lg hover:scale-105 transform transition"
          >
            Get Started
          </a>
          <a
            href="/login"
            className="px-6 py-3 rounded-full border border-blue-500 text-blue-600 hover:bg-blue-50 hover:scale-105 transform transition"
          >
            Login
          </a>
        </div>

        {/* Feature Section */}
        <section className="mt-10">
          <h2 className="text-xl font-semibold text-gray-900 text-center">
            Key Features
          </h2>
          <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-700">
            <li className="p-3 bg-white/70 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition">
              🔒 Private, self-hosted storage and access control
            </li>
            <li className="p-3 bg-white/70 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition">
              🕓 File versioning and history
            </li>
            <li className="p-3 bg-white/70 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition">
              💬 Comments and tags for collaboration
            </li>
            <li className="p-3 bg-white/70 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition">
              👥 Role-based permissions: Owner, Collaborator, Viewer
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
