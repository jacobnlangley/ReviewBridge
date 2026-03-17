#!/usr/bin/env node

const port = process.env.PORT || 3000;
const { execSync } = require("child_process");

function killPort(p) {
  try {
    if (process.platform === "win32") {
      execSync(
        `for /f "tokens=5" %a in ('netstat -ano ^| findstr :${p}') do taskkill /F /PID %a`,
        { stdio: "ignore" },
      );
    } else {
      execSync(`lsof -ti :${p} | xargs kill -9`, { stdio: "ignore" });
    }
    console.log(`[dev] freed port ${p}`);
  } catch {
    // Port likely not in use.
  }
}

killPort(port);
