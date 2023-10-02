import { default as axios } from 'axios';
import simpleGit from 'simple-git';
import { promises as fs } from 'fs';
import { join, extname } from 'path';
const git = simpleGit();

const curriculumDir = '/Users/epicodus/curriculum';
const repos = [
  'code-reviews',
  'pre-work-full-stack',
  'intro-full-stack',
  'javascript-full-stack',
  'react-full-stack',
  'c-sharp-full-stack',
  'career-services-full-stack',
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
      const urls = content.match(/https:\/\/(?:new\.|www\.)?learnhowtoprogram\.com\/[^\s'"\)]+/g);
      if (urls) {
        for (const url of urls) {
          // console.log(`${fullPath}:  ${url}`); // log *all* links to lhtp
          try {
            await axios.get(url);
          } catch (error) {
            console.log(`${fullPath}:  ${url}`);
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
