import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFileSync, unlinkSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

const execAsync = promisify(exec);

const TEMP_DIR = join(process.cwd(), 'temp');

// Ensure temp directory exists
if (!existsSync(TEMP_DIR)) {
  mkdirSync(TEMP_DIR, { recursive: true });
}

export async function executePython(code) {
  const fileId = uuidv4();
  const fileName = `script_${fileId}.py`;
  const filePath = join(TEMP_DIR, fileName);

  try {
    // Write Python code to file
    writeFileSync(filePath, code);

    // Run Python code
    const runCommand = `python "${filePath}"`;
    const { stdout, stderr: runError } = await execAsync(runCommand, {
      cwd: TEMP_DIR,
      timeout: 5000, // 5 seconds timeout
    });

    if (runError && !runError.includes('Picked up')) {
      throw new Error(`Runtime Error:\n${runError}`);
    }

    return stdout || 'Code executed successfully (no output)';
  } catch (error) {
    // Extract meaningful error message
    if (error.stderr) {
      throw new Error(error.stderr.toString());
    }
    if (error.stdout) {
      throw new Error(error.stdout.toString());
    }
    throw new Error(error.message || 'Failed to execute Python code');
  } finally {
    // Cleanup: remove Python file
    try {
      if (existsSync(filePath)) {
        unlinkSync(filePath);
      }
    } catch (cleanupError) {
      console.error('Cleanup error:', cleanupError);
    }
  }
}

export async function executeJava(code) {
  const fileId = uuidv4();
  
  // Extract class name from code (look for "public class ClassName")
  const classMatch = code.match(/public\s+class\s+(\w+)/);
  const className = classMatch ? classMatch[1] : 'Main';
  
  // Use the extracted class name for the file
  const fileName = `${className}_${fileId}.java`;
  const filePath = join(TEMP_DIR, fileName);
  const classFile = join(TEMP_DIR, `${className}.class`);
  
  try {

    // Write Java code to file as-is (preserve original class name)
    writeFileSync(filePath, code);

    // Compile Java code
    const compileCommand = `javac "${filePath}"`;
    try {
      const { stderr: compileError } = await execAsync(compileCommand, {
        cwd: TEMP_DIR,
        timeout: 10000, // 10 seconds timeout
      });

      // Check for actual compilation errors (ignore warnings and notes)
      if (compileError && 
          !compileError.includes('Note:') && 
          !compileError.includes('warning:') &&
          !compileError.includes('Picked up')) {
        throw new Error(`Compilation Error:\n${compileError}`);
      }
    } catch (compileErr) {
      if (compileErr.stderr) {
        const errorMsg = compileErr.stderr.toString();
        if (!errorMsg.includes('Note:') && !errorMsg.includes('warning:')) {
          throw new Error(`Compilation Error:\n${errorMsg}`);
        }
      }
      if (compileErr.code !== 0 && compileErr.stderr) {
        throw compileErr;
      }
    }

    // Run Java code using the extracted class name
    const runCommand = `java -cp "${TEMP_DIR}" "${className}"`;
    const { stdout, stderr: runError } = await execAsync(runCommand, {
      cwd: TEMP_DIR,
      timeout: 5000, // 5 seconds timeout
    });

    // Filter out JVM warnings and info messages
    const filteredError = runError ? 
      runError.split('\n')
        .filter(line => 
          !line.includes('Picked up') && 
          !line.includes('JAVA_TOOL_OPTIONS') &&
          !line.includes('Using')
        ).join('\n') : '';

    if (filteredError && filteredError.trim()) {
      throw new Error(`Runtime Error:\n${filteredError}`);
    }

    return stdout || 'Code executed successfully (no output)';
  } catch (error) {
    // Extract meaningful error message
    if (error.stderr) {
      const errorMsg = error.stderr.toString();
      if (errorMsg.trim()) {
        throw new Error(errorMsg);
      }
    }
    if (error.stdout && error.code !== 0) {
      throw new Error(error.stdout.toString());
    }
    throw new Error(error.message || 'Failed to execute Java code');
  } finally {
    // Cleanup: remove Java file and class file
    try {
      if (existsSync(filePath)) {
        unlinkSync(filePath);
      }
      if (existsSync(classFile)) {
        unlinkSync(classFile);
      }
    } catch (cleanupError) {
      console.error('Cleanup error:', cleanupError);
    }
  }
}

