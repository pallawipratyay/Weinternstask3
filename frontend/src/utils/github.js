// GitHub API Utilities for Version Control

const GITHUB_API_BASE = 'https://api.github.com';

// Get user information
export async function getGitHubUser(token) {
  if (!token || token.trim() === '') {
    throw new Error('GitHub token is required');
  }

  // Remove 'Bearer' prefix if present
  const cleanToken = token.replace(/^(Bearer|token)\s+/i, '').trim();

  const response = await fetch(`${GITHUB_API_BASE}/user`, {
    headers: {
      Authorization: `Bearer ${cleanToken}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Invalid or expired GitHub token. Please generate a new token.');
    }
    throw new Error(`Failed to authenticate with GitHub (Status: ${response.status})`);
  }
  
  return await response.json();
}

// List user repositories
export async function getUserRepos(token) {
  if (!token || token.trim() === '') {
    throw new Error('GitHub token is required');
  }

  // Remove 'Bearer' prefix if present
  const cleanToken = token.replace(/^(Bearer|token)\s+/i, '').trim();

  const response = await fetch(`${GITHUB_API_BASE}/user/repos?sort=updated&per_page=100`, {
    headers: {
      Authorization: `Bearer ${cleanToken}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Invalid or expired GitHub token. Please generate a new token.');
    }
    throw new Error(`Failed to fetch repositories (Status: ${response.status})`);
  }
  
  return await response.json();
}

// Create a new repository
export async function createRepository(token, name, description = '', isPrivate = false) {
  if (!token || token.trim() === '') {
    throw new Error('GitHub token is required');
  }

  if (!name || name.trim() === '') {
    throw new Error('Repository name is required');
  }

  // Remove 'Bearer' prefix if present
  const cleanToken = token.replace(/^(Bearer|token)\s+/i, '').trim();

  const response = await fetch(`${GITHUB_API_BASE}/user/repos`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${cleanToken}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: name.trim(),
      description: description.trim() || undefined,
      private: isPrivate,
      auto_init: true,
    }),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to create repository' }));
    if (response.status === 422) {
      throw new Error(error.message || 'Repository name is invalid or already exists');
    }
    if (response.status === 401) {
      throw new Error('Invalid or expired GitHub token. Please generate a new token.');
    }
    throw new Error(error.message || `Failed to create repository (Status: ${response.status})`);
  }
  
  return await response.json();
}

// Get file content from repository
export async function getFileContent(token, owner, repo, path, branch = 'main') {
  if (!token || token.trim() === '') {
    throw new Error('GitHub token is required');
  }

  // Remove 'Bearer' prefix if present
  const cleanToken = token.replace(/^(Bearer|token)\s+/i, '').trim();
  const encodedPath = encodeURIComponent(path);
  
  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${encodedPath}?ref=${branch}`,
    {
      headers: {
        Authorization: `Bearer ${cleanToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    }
  );
  
  if (!response.ok) {
    if (response.status === 404) {
      return null; // File doesn't exist
    }
    if (response.status === 401) {
      throw new Error('Invalid or expired GitHub token. Please generate a new token.');
    }
    throw new Error(`Failed to fetch file content (Status: ${response.status})`);
  }
  
  const data = await response.json();
  // Decode base64 content
  return atob(data.content.replace(/\s/g, ''));
}

// Create or update file in repository
export async function commitToGitHub(
  token,
  owner,
  repo,
  path,
  content,
  message,
  sha
) {
  try {
    const encodedPath = encodeURIComponent(path);
    const encodedContent = btoa(unescape(encodeURIComponent(content)));

    const body = {
      message,
      content: encodedContent,
    };

    // Only include sha if file exists (for updates)
    if (sha) {
      body.sha = sha;
    }

    const res = await fetch(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${encodedPath}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      const errorMsg = data.message || `Failed to commit file (Status: ${res.status})`;
      throw new Error(errorMsg);
    }

    return data;
  } catch (err) {
    if (err.message) {
      throw err;
    }
    throw new Error("Error committing to GitHub: " + err.toString());
  }
}


// Get repository tree (list files)
export async function getRepositoryTree(token, owner, repo, branch = 'main') {
  // First get the branch SHA
  const branchResponse = await fetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/ref/heads/${branch}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    }
  );
  
  if (!branchResponse.ok) {
    throw new Error('Failed to fetch branch information');
  }
  
  const branchData = await branchResponse.json();
  const commitSha = branchData.object.sha;
  
  // Get the commit
  const commitResponse = await fetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/commits/${commitSha}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    }
  );
  
  if (!commitResponse.ok) {
    throw new Error('Failed to fetch commit information');
  }
  
  const commitData = await commitResponse.json();
  const treeSha = commitData.tree.sha;
  
  // Get the tree
  const treeResponse = await fetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/trees/${treeSha}?recursive=1`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    }
  );
  
  if (!treeResponse.ok) {
    throw new Error('Failed to fetch repository tree');
  }
  
  return await treeResponse.json();
}

// Get commit history
export async function getCommitHistory(token, owner, repo, path = '', perPage = 10) {
  if (!token || token.trim() === '') {
    return [];
  }

  // Remove 'Bearer' prefix if present
  const cleanToken = token.replace(/^(Bearer|token)\s+/i, '').trim();
  
  const url = path
    ? `${GITHUB_API_BASE}/repos/${owner}/${repo}/commits?path=${encodeURIComponent(path)}&per_page=${perPage}`
    : `${GITHUB_API_BASE}/repos/${owner}/${repo}/commits?per_page=${perPage}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${cleanToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });
    
    // 404 means file doesn't exist or no commits - this is normal for new files
    if (response.status === 404) {
      return [];
    }
    
    if (!response.ok) {
      // For other errors, log but don't throw - just return empty array
      console.debug(`Commit history API error: ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    // Silently handle errors - commit history is not critical
    console.debug('Error fetching commit history:', error);
    return [];
  }
}

// Delete file from repository
export async function deleteFile(token, owner, repo, path, message, sha, branch = 'main') {
  const encodedPath = encodeURIComponent(path);
  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${encodedPath}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/vnd.github.v3+json',
      },
      body: JSON.stringify({
        message,
        sha,
        branch,
      }),
    }
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete file');
  }
  
  return await response.json();
}

// Check if file exists and get its SHA
export async function getFileSha(token, owner, repo, path, branch = 'main') {
  try {
    if (!token || token.trim() === '') {
      return null;
    }

    // Remove 'Bearer' prefix if present
    const cleanToken = token.replace(/^(Bearer|token)\s+/i, '').trim();
    const encodedPath = encodeURIComponent(path);
    
    const response = await fetch(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${encodedPath}?ref=${branch}`,
      {
        headers: {
          Authorization: `Bearer ${cleanToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );
    
    if (response.status === 404) {
      return null; // File doesn't exist
    }
    
    if (!response.ok) {
      return null; // Return null on error, will create new file
    }
    
    const data = await response.json();
    return data.sha;
  } catch (error) {
    return null; // Return null on error, will create new file
  }
}
