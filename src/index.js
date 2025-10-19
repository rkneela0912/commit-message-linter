const core = require('@actions/core');
const github = require('@actions/github');

/**
 * Validate a single commit message against the pattern
 */
function validateCommitMessage(message, pattern) {
  const regex = new RegExp(pattern);
  return regex.test(message);
}

/**
 * Get commits from a pull request
 */
async function getPRCommits(octokit, owner, repo, pullNumber) {
  const commits = [];
  let page = 1;
  
  while (true) {
    const { data } = await octokit.rest.pulls.listCommits({
      owner,
      repo,
      pull_number: pullNumber,
      per_page: 100,
      page
    });
    
    if (data.length === 0) break;
    
    commits.push(...data);
    
    if (data.length < 100) break;
    page++;
  }
  
  return commits;
}

/**
 * Post a comment on the PR with validation results
 */
async function postComment(octokit, owner, repo, pullNumber, invalidMessages, errorMessage) {
  const comment = `${errorMessage}\n\n### Invalid Commit Messages:\n\n${invalidMessages.map(msg => `- \`${msg}\``).join('\n')}`;
  
  try {
    await octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: pullNumber,
      body: comment
    });
  } catch (error) {
    core.warning(`Failed to post comment: ${error.message}`);
  }
}

async function run() {
  try {
    const token = core.getInput('github_token', { required: true });
    const pattern = core.getInput('pattern');
    const errorMessage = core.getInput('error_message');
    const failOnError = core.getInput('fail_on_error') === 'true';
    
    const context = github.context;
    
    if (!context.payload.pull_request) {
      core.info('Not a pull request event, skipping');
      return;
    }
    
    const { owner, repo } = context.repo;
    const pullNumber = context.payload.pull_request.number;
    const octokit = github.getOctokit(token);
    
    core.info(`Validating commits in PR #${pullNumber}...`);
    
    const commits = await getPRCommits(octokit, owner, repo, pullNumber);
    const invalidMessages = [];
    
    for (const commit of commits) {
      const message = commit.commit.message.split('\n')[0]; // First line only
      
      if (!validateCommitMessage(message, pattern)) {
        invalidMessages.push(message);
        core.error(`Invalid commit message: ${message}`);
      } else {
        core.info(`✓ Valid: ${message}`);
      }
    }
    
    const isValid = invalidMessages.length === 0;
    
    core.setOutput('valid', isValid.toString());
    core.setOutput('invalid_count', invalidMessages.length.toString());
    
    if (!isValid) {
      await postComment(octokit, owner, repo, pullNumber, invalidMessages, errorMessage);
      
      if (failOnError) {
        core.setFailed(`Found ${invalidMessages.length} invalid commit message(s)`);
      } else {
        core.warning(`Found ${invalidMessages.length} invalid commit message(s)`);
      }
    } else {
      core.info('✅ All commit messages are valid!');
    }
    
  } catch (error) {
    core.setFailed(`Action failed: ${error.message}`);
  }
}

run();

