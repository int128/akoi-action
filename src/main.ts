import * as core from '@actions/core'
import { run } from './run'

const main = async (): Promise<void> => {
  try {
    const outputs = await run({
      config: core.getInput('config', { required: true }),
      version: core.getInput('version', { required: true }),
    })
    core.setOutput('directory', outputs.directory)
  } catch (error) {
    core.setFailed(error.message)
  }
}

main()
