// scripts/check-runtime.js
const fs = require("fs");
const path = require("path");
const glob = require("glob");

const targetDir = path.resolve("src/app/api");
const routeFiles = glob.sync(`${targetDir}/**/route.ts`);

const nodejsModules = [
  "firebase-admin",
  "google-auth-library"
];

console.log("\x1b[33m[검사 시작] route.ts 파일에서 Node.js 전용 모듈 사용 여부 확인...\x1b[0m");

const failedFiles = [];

for (const filePath of routeFiles) {
  const content = fs.readFileSync(filePath, "utf8");

  const usesNodeModules = nodejsModules.some(module => content.includes(module));
  const declaresRuntime = content.includes('export const runtime = "nodejs"');

  if (usesNodeModules && !declaresRuntime) {
    failedFiles.push(filePath.replace(process.cwd(), "."));
  }
}

if (failedFiles.length > 0) {
  console.log("\n❌ 누락된 runtime 설정:");
  failedFiles.forEach(f => console.log(`- ${f}`));
} else {
  console.log("\n✅ 모든 route.ts 파일이 적절히 설정되어 있습니다.");
}
