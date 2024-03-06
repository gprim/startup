import { spawn } from "node:child_process";
import { promises as fs } from "node:fs";
import { join } from "node:path";

//directory containing contents to be bundled into a zip file
const OUTPUT_LOCATION = join(__dirname, "output");

(async () => {
  // Step 1: Build the project
  await new Promise<void>((resolve, reject) => {
    const childProcess = spawn("npm", ["run", "build"], { stdio: "inherit" });

    childProcess.on("error", (error) => reject(error));
    childProcess.on("exit", (code) => {
      if (code !== 0) {
        reject(new Error(`Non-zero exit code: ${code}`));
      } else {
        resolve();
      }
    });
  });

  // Step 2: Create the output directory
  await fs.mkdir(OUTPUT_LOCATION, { recursive: true });

  // Step 3: Copy the build artifacts to the output directory
  await fs.copyFile("package.json", join(OUTPUT_LOCATION, "package.json"));
  await fs.copyFile(".env", join(OUTPUT_LOCATION, ".env"));
  await fs.cp("build", OUTPUT_LOCATION, { recursive: true });
  await fs.cp("public", join(OUTPUT_LOCATION, "public"), { recursive: true });
})();
