/**
 * Copyright 2025 KCoderVA
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * GitHub API Client - Handles GitHub repository analysis
 * This module provides functionality to interact with the GitHub API
 * and extract commit history and repository information.
 */

class GitHubAPI {
    constructor() {
        this.baseURL = 'https://api.github.com';
        this.rateLimitRemaining = null;
        this.rateLimitReset = null;
    }

    /**
     * Fetches repository information from GitHub
     * @param {string} owner - Repository owner
     * @param {string} repo - Repository name
     * @returns {Promise<Object>} Repository information
     */
    async fetchRepository(owner, repo) {
        try {
            console.log(`Fetching repository: ${owner}/${repo}`);
            
            const response = await fetch(`${this.baseURL}/repos/${owner}/${repo}`);
            
            if (!response.ok) {
                await this.handleAPIError(response, 'fetch repository information');
            }

            this.updateRateLimit(response.headers);
            const repoData = await response.json();
            
            return {
                name: repoData.name,
                fullName: repoData.full_name,
                description: repoData.description,
                url: repoData.html_url,
                defaultBranch: repoData.default_branch,
                createdAt: repoData.created_at,
                updatedAt: repoData.updated_at,
                language: repoData.language,
                size: repoData.size,
                stars: repoData.stargazers_count,
                forks: repoData.forks_count
            };
        } catch (error) {
            console.error('Error fetching repository:', error);
            throw new Error(`Failed to fetch repository: ${error.message}`);
        }
    }

    /**
     * Gets commits from a GitHub repository
     * @param {string} owner - Repository owner
     * @param {string} repo - Repository name
     * @param {Object} options - Options for commit fetching
     * @returns {Promise<Array>} Array of commit objects
     */
    async getCommits(owner, repo, options = {}) {
        try {
            console.log(`Fetching commits for: ${owner}/${repo}`);
            
            const params = new URLSearchParams({
                per_page: options.perPage || 100,
                page: options.page || 1
            });

            if (options.since) {
                params.append('since', options.since);
            }
            if (options.until) {
                params.append('until', options.until);
            }
            if (options.author) {
                params.append('author', options.author);
            }

            const response = await fetch(`${this.baseURL}/repos/${owner}/${repo}/commits?${params}`);
            
            if (!response.ok) {
                await this.handleAPIError(response, 'fetch commits');
            }

            this.updateRateLimit(response.headers);
            const commits = await response.json();
            
            // Process commits to match our standard format
            return commits.map(commit => ({
                sha: commit.sha,
                message: commit.commit.message,
                author: {
                    name: commit.commit.author.name,
                    email: commit.commit.author.email,
                    avatar: commit.author?.avatar_url
                },
                date: commit.commit.author.date,
                url: commit.html_url,
                stats: null // Will be filled by separate API call if needed
            }));
        } catch (error) {
            console.error('Error fetching commits:', error);
            throw new Error(`Failed to fetch commits: ${error.message}`);
        }
    }

    /**
     * Gets detailed commit information including file changes
     * @param {string} owner - Repository owner
     * @param {string} repo - Repository name
     * @param {string} sha - Commit SHA
     * @returns {Promise<Object>} Detailed commit information
     */
    async getCommitDetails(owner, repo, sha) {
        try {
            const response = await fetch(`${this.baseURL}/repos/${owner}/${repo}/commits/${sha}`);
            
            if (!response.ok) {
                await this.handleAPIError(response, 'fetch commit details');
            }

            this.updateRateLimit(response.headers);
            const commit = await response.json();
            
            return {
                sha: commit.sha,
                message: commit.commit.message,
                author: {
                    name: commit.commit.author.name,
                    email: commit.commit.author.email,
                    avatar: commit.author?.avatar_url
                },
                date: commit.commit.author.date,
                url: commit.html_url,
                stats: {
                    additions: commit.stats?.additions || 0,
                    deletions: commit.stats?.deletions || 0,
                    total: commit.stats?.total || 0,
                    files: commit.files?.map(file => ({
                        filename: file.filename,
                        status: file.status,
                        additions: file.additions,
                        deletions: file.deletions,
                        changes: file.changes
                    })) || []
                }
            };
        } catch (error) {
            console.error('Error fetching commit details:', error);
            throw new Error(`Failed to fetch commit details: ${error.message}`);
        }
    }

    /**
     * Gets all commits with detailed information (paginated)
     * @param {string} owner - Repository owner
     * @param {string} repo - Repository name
     * @param {Object} options - Options for fetching
     * @returns {Promise<Array>} Array of detailed commit objects
     */
    async getAllCommitsWithDetails(owner, repo, options = {}) {
        const allCommits = [];
        let page = 1;
        const perPage = options.perPage || 30; // Smaller per page for detailed calls
        const maxPages = options.maxPages || 10; // Limit to prevent excessive API calls

        try {
            while (page <= maxPages) {
                console.log(`Fetching commits page ${page}...`);
                
                const commits = await this.getCommits(owner, repo, {
                    ...options,
                    page,
                    perPage
                });

                if (commits.length === 0) {
                    break; // No more commits
                }

                // Get detailed information for each commit
                for (const commit of commits) {
                    try {
                        const detailedCommit = await this.getCommitDetails(owner, repo, commit.sha);
                        allCommits.push(detailedCommit);
                        
                        // Add small delay to avoid hitting rate limits
                        await this.delay(100);
                    } catch (error) {
                        console.warn(`Failed to get details for commit ${commit.sha}:`, error);
                        allCommits.push(commit); // Add basic commit info
                    }
                }

                if (commits.length < perPage) {
                    break; // Last page
                }

                page++;
            }

            return allCommits;
        } catch (error) {
            console.error('Error fetching all commits with details:', error);
            throw error;
        }
    }

    /**
     * Checks current rate limit status
     * @returns {Promise<Object>} Rate limit information
     */
    async getRateLimit() {
        try {
            const response = await fetch(`${this.baseURL}/rate_limit`);
            const data = await response.json();
            
            this.rateLimitRemaining = data.rate.remaining;
            this.rateLimitReset = new Date(data.rate.reset * 1000);
            
            return {
                remaining: data.rate.remaining,
                limit: data.rate.limit,
                reset: this.rateLimitReset,
                resetFormatted: this.rateLimitReset.toLocaleString()
            };
        } catch (error) {
            console.error('Error checking rate limit:', error);
            return null;
        }
    }

    /**
     * Handles GitHub API errors with detailed information
     * @private
     * @param {Response} response - Failed response object
     * @param {string} operation - Operation that failed
     */
    async handleAPIError(response, operation) {
        this.updateRateLimit(response.headers);
        
        let errorMessage = `GitHub API error: ${response.status}`;
        let detailedMessage = '';

        // Try to get detailed error from response body
        try {
            const errorData = await response.json();
            if (errorData.message) {
                detailedMessage = errorData.message;
            }
        } catch (e) {
            // If response body isn't JSON, use status text
            detailedMessage = response.statusText;
        }

        switch (response.status) {
            case 403:
                if (this.rateLimitRemaining === 0) {
                    const resetTime = this.rateLimitReset ? this.rateLimitReset.toLocaleTimeString() : 'unknown';
                    errorMessage = `GitHub API rate limit exceeded. Rate limit resets at ${resetTime}.`;
                    detailedMessage = `You've reached the GitHub API rate limit (60 requests per hour for unauthenticated requests). Please wait until ${resetTime} before trying again, or try with a smaller repository.`;
                } else {
                    errorMessage = `Access forbidden (403). ${detailedMessage}`;
                    detailedMessage = `The repository may be private, or you may need authentication to access it. GitHub allows 60 unauthenticated requests per hour.`;
                }
                break;
            case 404:
                errorMessage = `Repository not found (404)`;
                detailedMessage = `The repository doesn't exist or is private. Please check the repository URL and ensure it's a public repository.`;
                break;
            case 401:
                errorMessage = `Authentication required (401)`;
                detailedMessage = `This repository requires authentication. The analyzer currently only supports public repositories.`;
                break;
            default:
                errorMessage = `GitHub API error: ${response.status} ${response.statusText}`;
                detailedMessage = detailedMessage || `Failed to ${operation}`;
        }

        // Log detailed information for debugging
        console.error(`GitHub API Error (${operation}):`, {
            status: response.status,
            statusText: response.statusText,
            rateLimitRemaining: this.rateLimitRemaining,
            rateLimitReset: this.rateLimitReset,
            detailedMessage: detailedMessage
        });

        throw new Error(`${errorMessage}\n\n${detailedMessage}`);
    }

    /**
     * Updates rate limit information from response headers
     * @private
     * @param {Headers} headers - Response headers
     */
    updateRateLimit(headers) {
        const remaining = headers.get('x-ratelimit-remaining');
        const reset = headers.get('x-ratelimit-reset');
        
        if (remaining) {
            this.rateLimitRemaining = parseInt(remaining);
        }
        if (reset) {
            this.rateLimitReset = new Date(parseInt(reset) * 1000);
        }
    }

    /**
     * Parses GitHub repository URL to extract owner and repo
     * @param {string} url - GitHub repository URL
     * @returns {Object} Object containing owner and repo
     */
    parseRepoURL(url) {
        // Handle various GitHub URL formats
        const patterns = [
            /github\.com\/([^\/]+)\/([^\/]+?)(?:\.git)?(?:\/|$)/,
            /^([^\/]+)\/([^\/]+)$/
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) {
                return {
                    owner: match[1],
                    repo: match[2].replace(/\.git$/, '')
                };
            }
        }

        throw new Error('Invalid GitHub repository URL');
    }

    /**
     * Simple delay utility
     * @private
     * @param {number} ms - Milliseconds to delay
     * @returns {Promise} Promise that resolves after delay
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Gets current rate limit status
     * @returns {Object} Current rate limit information
     */
    getCurrentRateLimit() {
        return {
            remaining: this.rateLimitRemaining,
            reset: this.rateLimitReset,
            resetFormatted: this.rateLimitReset?.toLocaleString()
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GitHubAPI;
} else {
    window.GitHubAPI = GitHubAPI;
}
