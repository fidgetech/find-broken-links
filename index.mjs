import { default as axios } from 'axios';
import simpleGit from 'simple-git';
import { promises as fs } from 'fs';
import { join, extname } from 'path';
const git = simpleGit();

const curriculumDir = '/Users/epicodus/curriculum';
const repos = [
  'pre-work-full-stack',
  'intro-full-stack',
  'javascript-full-stack',
  'react-full-stack',
  'c-sharp-full-stack',
  'career-services-full-stack',
  'code-reviews',
  'shared-full-stack',
  'DEI-full-stack',
  'capstone',
  'workshops'
]

// await git.clone('https://github.com/epicodus-curriculum/pre-work-full-stack', 'pre-work-full-stack');

const traverseDir = async (dir) => {
  const files = await fs.readdir(dir);
  for (const file of files) {
    const fullPath = join(dir, file);
    const stat = await fs.stat(fullPath);
    if (stat.isDirectory()) {
      await traverseDir(fullPath);
    } else if (stat.isFile() && extname(file) === '.md') {
      const content = await fs.readFile(fullPath, 'utf8');
      const matches = content.match(/\(http[^\)]+\)\)?/g);
      const urls = matches?.map(url => url.slice(1, -1))
      if (urls) {
        for (let url of urls) {
          url = url.includes(")") && !url.includes("(") ? url.slice(0, -1) : url;
          try {
            await axios.get(url, { timeout: 10000 });
          } catch (error) {
            if (error?.response?.status !== 403) {
              console.log(`${fullPath}:  ${url} - ${error}`);
            }
          }
        }
      }
    }
  }
};

for (const repo of repos) {
  console.log(`\n${repo.toUpperCase()}...`);
  await traverseDir(join(curriculumDir, repo));
  console.log('');
}
