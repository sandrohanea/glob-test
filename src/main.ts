import * as core from '@actions/core'
import * as glob from '@actions/glob'
import fs from 'fs'
import path from 'path'

/**
 * The main function for the action.
 *
 * @returns Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const fileName: string = core.getInput('fileName')
    const filePath: string = core.getInput('filePath')

    // Normalize and ensure the directory exists
    const targetDir = filePath && filePath.trim().length > 0 ? filePath : '.'
    await fs.promises.mkdir(targetDir, { recursive: true })

    // Compute the full path for the file to be created
    const targetFile = path.join(targetDir, fileName)

    // Debug logs are only output if the `ACTIONS_STEP_DEBUG` secret is true
    core.info(`Creating file at ${targetFile} ...`)
    await fs.promises.writeFile(targetFile, `test content`)

    // List files using fs in the specified directory
    const filesByFs = await fs.promises.readdir(targetDir)
    core.info(`Files in ${targetDir} (fs): ${filesByFs}`)

    // Create a globber for the specified directory
    const normalizedGlobDir =
      targetDir.replace(/\\/g, '/').replace(/\/+$/, '') || '.'
    const pattern = normalizedGlobDir === '.' ? '*' : `${normalizedGlobDir}/*`
    const globber = await glob.create(pattern)
    const filesInCurrentDirectoryGlob = await globber.glob()

    core.debug(
      `Files in ${normalizedGlobDir} (glob): ${filesInCurrentDirectoryGlob}`
    )
    // Set outputs for other workflow steps to use
    core.setOutput('filesInCurrentDirectoryGlob', filesInCurrentDirectoryGlob)
    core.setOutput('filesByFs', filesByFs)
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
