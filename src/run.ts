import * as cache from '@actions/cache'
import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as io from '@actions/io'
import * as tc from '@actions/tool-cache'
import { createHash } from 'crypto'
import * as fs from 'fs'
import * as os from 'os'

type Inputs = {
  config: string
  version: string
}

type Outputs = {
  directory: string
}

export const run = async (inputs: Inputs): Promise<Outputs> => {
  const configDigest = await digest(inputs.config)
  const binDir = `.akoi/${configDigest}`
  core.info(`Digest of config is ${configDigest}`)
  core.info(`Install to ${binDir}`)

  core.startGroup(`Install akoi`)
  const akoiDir = await installAkoi(inputs.version)
  core.addPath(akoiDir)
  core.endGroup()

  core.startGroup(`Restore cache`)
  const cacheKey = `akoi-${configDigest}`
  const cacheHit = await cache.restoreCache([binDir], cacheKey)
  if (cacheKey === undefined) {
    core.info(`No cache found from key ${cacheKey}`)
  } else {
    core.info(`Found cache from key ${cacheHit}`)
  }
  core.endGroup()

  core.startGroup(`Run akoi`)
  await io.mkdirP(binDir)
  await io.cp(inputs.config, `${binDir}/.akoi.yml`)
  await exec.exec('akoi', ['install'], { cwd: binDir })
  core.endGroup()

  if (cacheHit === undefined) {
    core.startGroup(`Save cache`)
    core.info(`Saving cache to key ${cacheKey}`)
    await cache.saveCache([binDir], cacheKey)
    core.endGroup()
  }

  core.info(`Add ${binDir} to path`)
  core.addPath(binDir)
  return { directory: binDir }
}

const installAkoi = async (version: string): Promise<string> => {
  let cacheDir = tc.find('akoi', version)
  if (cacheDir !== '') {
    core.info(`Found cache at ${cacheDir}`)
    return cacheDir
  }

  const platform = os.platform()
  const tv = version.substring(1)
  const url = `https://github.com/suzuki-shunsuke/akoi/releases/download/${version}/akoi_${tv}_${platform}_amd64`
  core.info(`Downloading ${url}`)
  const t = await tc.downloadTool(url)
  cacheDir = await tc.cacheFile(t, 'akoi', 'akoi', version)
  core.info(`Saved cache to ${cacheDir}`)
  await exec.exec('chmod', ['+x', `${cacheDir}/akoi`])
  return cacheDir
}

const digest = async (name: string): Promise<string> =>
  new Promise((resolve, reject) => {
    try {
      const h = createHash('sha256')
      const f = fs.createReadStream(name)
      f.pipe(h)
      f.close()
      h.end(() => {
        resolve(h.digest('hex'))
      })
    } catch (error) {
      reject(error)
    }
  })
