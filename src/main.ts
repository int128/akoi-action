import * as core from '@actions/core'
import { run } from './run'

const main = async (): Promise<void> => {
  const outputs = await run({
    config: core.getInput('config', { required: true }),
    version: core.getInput('version', { required: true }),
    baseDirectory: core.getInput('base-directory', { required: true }),
  })
  core.setOutput('directory', outputs.directory)
}

main().catch((e) => core.setFailed(e instanceof Error ? e : String(e)))
