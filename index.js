import { default as axios } from 'axios';
import simpleGit from 'simple-git';
import { promises as fs } from 'fs';
import { join, extname } from 'path';
import { sendEmailWithAttachment } from './nodemailer.js';
const git = simpleGit();
const logFile = 'broken-links.txt';

const repos = [
  'pre-work-full-stack',
  'intro-full-stack',
  'javascript-full-stack',
  'react-full-stack',
  'c-sharp-full-stack',
  'career-services-full-stack',
  'shared-full-stack',
  'DEI-full-stack',
  'capstone',
  'workshops',
  'code-reviews'
]

const logToFile = async (message) => {
  await fs.appendFile(logFile, message + '\n', 'utf8');
}

const traverseDir = async (dir) => {
  const files = await fs.readdir(dir);
  for (const file of files) {
    const fullPath = join(dir, file);
    const stat = await fs.stat(fullPath);
    if (stat.isDirectory()) {
      await traverseDir(fullPath);
    } else if (stat.isFile() && extname(file) === '.md') {
      const content = await fs.readFile(fullPath, 'utf8');

      const urlMatches = content.match(/\(http[^\)]+\)\)?/g);
      const urls = urlMatches?.map(url => url.slice(1, -1))

      const imgTagRegex = /<img[^>]+src=["'](https:\/\/learnhowtoprogram\.s3\.us-west-2\.amazonaws\.com\/[^\)'"]+)["']/g;
      let imgTagMatches = [];
      let match;
      while ((match = imgTagRegex.exec(content)) !== null) {
        imgTagMatches.push(match[1]);
      }

      const allUrls = [...(urls || []), ...imgTagMatches];

      if (allUrls.length > 0) {
        for (let url of allUrls) {
          url = url.includes(")") && !url.includes("(") ? url.slice(0, -1) : url;
          try {
            await axios.get(url, { timeout: 10000 });
          } catch (error) {
            if (error?.response?.status !== 403) {
              const abridgedPath = fullPath.replace(/^[^\/]*\/[^\/]*\//, '');
              logToFile(`${abridgedPath}:  ${url} - ${error}`);
            }
          }
        }
      }

    }
  }
};

await fs.rm('tmp', { recursive: true, force: true });
await fs.rm(logFile, { force: true });

for (const repo of repos) {
  logToFile(`\n${repo.toUpperCase()}...`);
  const repoPath = join('tmp', repo);
  const url = process.env.NODE_ENV === 'production' ? `git@github.com:epicodus-curriculum/${repo}.git` : `https://github.com/epicodus-curriculum/${repo}`
  await git.clone(url, repoPath);
  await traverseDir(repoPath);
  logToFile('');
}

await sendEmailWithAttachment(logFile);
fs.rm('tmp', { recursive: true, force: true });
fs.rm(logFile, { force: true });
