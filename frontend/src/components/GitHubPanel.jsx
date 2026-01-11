import { useState, useEffect } from "react";
import {
  getGitHubUser,
  getUserRepos,
  createRepository,
  getFileContent,
  commitToGitHub,
  getFileSha,
  getCommitHistory,
} from "../utils/github";

export default function GitHubPanel({
  isOpen,
  onClose,
  code,
  language,
  onCodeLoad,
}) {
  const [token, setToken] = useState(() => {
    // Check localStorage first (user-entered token)
    const storedToken = localStorage.getItem("github_token");
    if (storedToken) {
      return storedToken;
    }
    
    // Fallback to environment variable (development only)
    // In Vite, environment variables must be prefixed with VITE_
    const envToken = import.meta.env.VITE_GITHUB_TOKEN;
    if (envToken && import.meta.env.DEV) {
      // Only use env token in development mode
      console.warn("⚠️ Using GitHub token from environment variable. This should only be used for development!");
      return envToken;
    }
    
    return "";
  });
  const [user, setUser] = useState(null);
  const [repos, setRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState("");
  const [filePath, setFilePath] = useState("");
  const [commitMessage, setCommitMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [newRepoName, setNewRepoName] = useState("");
  const [newRepoDesc, setNewRepoDesc] = useState("");
  const [showCreateRepo, setShowCreateRepo] = useState(false);
  const [commits, setCommits] = useState([]);

  useEffect(() => {
    if (token && isOpen) {
      loadUserData();
    }
  }, [token, isOpen]);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      setError("");
      const userData = await getGitHubUser(token);
      setUser(userData);
      const reposData = await getUserRepos(token);
      setRepos(reposData);
    } catch (err) {
      setError(err.message);
      setToken("");
      localStorage.removeItem("github_token");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuth = async () => {
    try {
      setIsLoading(true);
      setError("");

      const userData = await getGitHubUser(token);

      // Token is valid
      setUser(userData);
      localStorage.setItem("github_token", token);

      // Load repos
      const reposData = await getUserRepos(token);
      setRepos(reposData);

    } catch (err) {
      setError("Invalid GitHub token");
      setToken("");
      localStorage.removeItem("github_token");
    } finally {
      setIsLoading(false);
    }
  };


  const handleCreateRepo = async () => {
    if (!newRepoName || !newRepoName.trim()) {
      setError("Repository name is required");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      setSuccess("");
      const newRepo = await createRepository(token, newRepoName.trim(), newRepoDesc.trim());
      setRepos([newRepo, ...repos]);
      setSelectedRepo(`${newRepo.owner.login}/${newRepo.name}`);
      setShowCreateRepo(false);
      setNewRepoName("");
      setNewRepoDesc("");
      setSuccess("Repository created successfully! You can now select it and save your code.");
      // Clear commits since this is a new repo with no files yet
      setCommits([]);
    } catch (err) {
      setError(err.message || "Failed to create repository");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedRepo || !filePath || !commitMessage) {
      setError("Please fill in all fields");
      return;
    }

    if (!filePath.trim()) {
      setError("File path cannot be empty");
      return;
    }

    if (!commitMessage.trim()) {
      setError("Commit message cannot be empty");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      setSuccess("");

      const [owner, repo] = selectedRepo.split("/");
      if (!owner || !repo) {
        setError("Invalid repository format");
        return;
      }

      const sha = await getFileSha(token, owner, repo, filePath);

      await commitToGitHub(
        token,
        owner,
        repo,
        filePath.trim(),
        code || "",
        commitMessage.trim(),
        sha
      );

      setSuccess("Code saved to GitHub successfully!");
      setCommitMessage("");
      
      // Reload commits after successful save
      await handleLoadCommits();
    } catch (err) {
      setError(err.message || "Failed to save code to GitHub");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoad = async () => {
    if (!selectedRepo || !filePath) {
      setError("Please select a repository and enter a file path");
      return;
    }

    if (!filePath.trim()) {
      setError("Please enter a valid file path");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      setSuccess("");

      const [owner, repo] = selectedRepo.split("/");
      if (!owner || !repo) {
        setError("Invalid repository format");
        return;
      }

      const content = await getFileContent(token, owner, repo, filePath.trim());

      if (content === null) {
        setError(`File "${filePath}" not found in repository. The file may not exist yet or the path is incorrect.`);
        return;
      }

      onCodeLoad(content);
      setSuccess("Code loaded from GitHub successfully!");
      
      // Reload commits after successful load
      await handleLoadCommits();
    } catch (err) {
      setError(err.message || "Failed to load file from GitHub");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadCommits = async () => {
    if (!selectedRepo || !filePath || !token) {
      setCommits([]);
      return;
    }

    try {
      const [owner, repo] = selectedRepo.split("/");
      if (!owner || !repo) {
        setCommits([]);
        return;
      }

      // Only load commits if file path is not empty
      const trimmedPath = filePath.trim();
      if (!trimmedPath) {
        setCommits([]);
        return;
      }

      const commitData = await getCommitHistory(token, owner, repo, trimmedPath, 10);
      setCommits(Array.isArray(commitData) ? commitData : []);
    } catch (err) {
      // Silently fail for commit history - it's not critical
      // Only log for debugging, don't show error to user
      console.debug("Could not load commit history:", err);
      setCommits([]);
    }
  };

  // Only load commits when file path is changed and it's not a placeholder
  useEffect(() => {
    // Don't auto-load commits immediately - wait a bit to avoid unnecessary API calls
    // Also don't load if file path is a placeholder or empty
    const trimmedPath = filePath?.trim();
    const isPlaceholder = trimmedPath === "path/to/file.ext" || !trimmedPath;
    
    if (selectedRepo && trimmedPath && token && !isPlaceholder) {
      // Debounce the commit loading to avoid too many API calls
      const timeoutId = setTimeout(() => {
        handleLoadCommits();
      }, 800);

      return () => clearTimeout(timeoutId);
    } else {
      // Clear commits if no valid file path
      setCommits([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRepo, filePath, token]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <svg className="w-8 h-8 text-gray-800" viewBox="0 0 24 24" fill="currentColor">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.483
      0-.237-.009-.868-.014-1.703-2.782.604-3.369-1.34-3.369-1.34-.455-1.157-1.11-1.466-1.11-1.466-.907-.62.069-.608.069-.608
      1.003.07 1.531 1.03 1.531 1.03.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.938
      0-1.09.39-1.984 1.029-2.681-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004
      1.705.115 2.504.337 1.909-1.296 2.748-1.026 2.748-1.026.546 1.378.203 2.397.1 2.65.64.697 1.028 1.59 1.028 2.682
      0 3.837-2.339 4.682-4.566 4.93.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.748
      0 .268.18.579.688.48A10.02 10.02 0 0 0 22 12c0-5.523-4.477-10-10-10z"
              />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900">GitHub Integration</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Authentication */}
          {!user ? (
            <div className="space-y-4">
              {import.meta.env.VITE_GITHUB_TOKEN && import.meta.env.DEV && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
                  ⚠️ <strong>Development Mode:</strong> Token loaded from environment variable (.env.local).
                  This token is only used in development and should never be committed to version control.
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GitHub Personal Access Token
                </label>
                <input
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder={import.meta.env.VITE_GITHUB_TOKEN && import.meta.env.DEV ? "Token loaded from environment" : "ghp_xxxxxxxxxxxxxxxxxxxx"}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="mt-2 text-sm text-gray-500">
                  Create a token at{" "}
                  <a
                    href="https://github.com/settings/tokens"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    github.com/settings/tokens
                  </a>
                  . Required scopes: repo
                </p>
                {!token && !(import.meta.env.VITE_GITHUB_TOKEN && import.meta.env.DEV) && (
                  <p className="mt-1 text-xs text-gray-400">
                    💡 Tip: For development, you can add your token to <code className="bg-gray-100 px-1 rounded">.env.local</code> as <code className="bg-gray-100 px-1 rounded">VITE_GITHUB_TOKEN=your_token</code>
                  </p>
                )}
              </div>
              <button
                onClick={handleAuth}
                disabled={!token || isLoading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                {isLoading ? "Authenticating..." : token ? "Authenticate" : "Enter Token to Continue"}
              </button>
            </div>
          ) : (
            <>
              {/* User Info */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <img
                  src={user.avatar_url}
                  alt={user.login}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <p className="font-semibold text-gray-900">{user.name || user.login}</p>
                  <p className="text-sm text-gray-500">@{user.login}</p>
                </div>
              </div>

              {/* Repository Selection */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">
                    Repository
                  </label>
                  <button
                    onClick={() => setShowCreateRepo(!showCreateRepo)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {showCreateRepo ? "Cancel" : "+ New Repository"}
                  </button>
                </div>

                {showCreateRepo ? (
                  <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                    <input
                      type="text"
                      value={newRepoName}
                      onChange={(e) => setNewRepoName(e.target.value)}
                      placeholder="Repository name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={newRepoDesc}
                      onChange={(e) => setNewRepoDesc(e.target.value)}
                      placeholder="Description (optional)"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleCreateRepo}
                      disabled={!newRepoName || isLoading}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                    >
                      Create Repository
                    </button>
                  </div>
                ) : (
                  <select
                    value={selectedRepo}
                    onChange={(e) => {
                      setSelectedRepo(e.target.value);
                      setError(""); // Clear error when repository changes
                      setCommits([]); // Clear commits when repository changes
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a repository</option>
                    {repos.map((repo) => (
                      <option key={repo.id} value={`${repo.owner.login}/${repo.name}`}>
                        {repo.name} {repo.private ? "(Private)" : "(Public)"}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* File Path */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  File Path (e.g., code/main.py)
                </label>
                <input
                  type="text"
                  value={filePath}
                  onChange={(e) => {
                    setFilePath(e.target.value);
                    setError(""); // Clear error when user starts typing
                  }}
                  placeholder="path/to/file.ext"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Enter the file path where you want to save your code (e.g., src/main.js, index.html)
                </p>
              </div>

              {/* Commit Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Commit Message
                </label>
                <input
                  type="text"
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  placeholder="Update code"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={!selectedRepo || !filePath || !commitMessage || isLoading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                >
                  {isLoading ? "Saving..." : "💾 Save to GitHub"}
                </button>
                <button
                  onClick={handleLoad}
                  disabled={!selectedRepo || !filePath || isLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                >
                  {isLoading ? "Loading..." : "📥 Load from GitHub"}
                </button>
              </div>

              {/* Commit History */}
              {commits.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Recent Commits for {filePath || 'this file'}</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {commits.map((commit) => (
                      <div
                        key={commit.sha}
                        className="p-2 bg-gray-50 rounded text-sm"
                      >
                        <p className="font-medium text-gray-900">{commit.commit.message}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(commit.commit.author.date).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Show message if file path exists but no commits found */}
              {selectedRepo && filePath && filePath.trim() && filePath.trim() !== "path/to/file.ext" && commits.length === 0 && !error && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
                  No commits found for this file. This is normal for new files that haven't been saved yet.
                </div>
              )}

              {/* Messages */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}
              {success && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                  {success}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

