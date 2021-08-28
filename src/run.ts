import * as cache from '@actions/cache'
import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as io from '@actions/io'
import * as tc from '@actions/tool-cache'
import * as os from 'os'
import { digest } from './digest'

type Inputs = {
  config: string
  version: string
  baseDirectory: string
}

type Outputs = {
  directory: string
}

export const run = async (inputs: Inputs): Promise<Outputs> => {
  const configDigest = await digest(inputs.config)
  const cacheKeyPrefix = `akoi-cache-v1-`
  const cacheKey = `${cacheKeyPrefix}${configDigest}`
  core.info(`Cache key is ${cacheKey}`)

  const directory = `${inputs.baseDirectory}/${configDigest}`
  core.addPath(directory)
  core.info(`Install packages to ${directory}`)

  core.startGroup(`Restore cache`)
  const cacheHit = await cache.restoreCache([directory], cacheKey, [cacheKeyPrefix])
  if (cacheHit === undefined) {
    core.info(`No cache found`)
  }
  core.endGroup()

  if (cacheHit === undefined) {
    core.startGroup(`Install akoi`)
    await downloadAkoi(directory, inputs.version)
    core.endGroup()
  }

  core.startGroup(`Run akoi`)
  await io.cp(inputs.config, `${directory}/.akoi.yml`)
  await exec.exec('akoi', ['install'], { cwd: directory })
  core.endGroup()

  if (cacheHit === undefined) {
    core.startGroup(`Save cache`)
    try {
      await cache.saveCache([directory], cacheKey)
    } catch (error) {
      core.info(`Could not save cache: ${JSON.stringify(error)}`)
    }
    core.endGroup()
  }

  return { directory }
}

const downloadAkoi = async (directory: string, version: string): Promise<void> => {
  const platform = os.platform()
  const tv = version.substring(1)
  const url = `https://github.com/suzuki-shunsuke/akoi/releases/download/${version}/akoi_${tv}_${platform}_amd64`
  core.info(`Downloading ${url}`)
  const downloaded = await tc.downloadTool(url)
  await exec.exec('chmod', ['+x', downloaded])

  core.info(`Move to ${directory}/akoi`)
  await io.mkdirP(directory)
  await io.mv(downloaded, `${directory}/akoi`)
}
