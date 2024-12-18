//
// Copyright © 2024 Hardcore Engineering Inc.
//
// Licensed under the Eclipse Public License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License. You may
// obtain a copy of the License at https://www.eclipse.org/legal/epl-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//
// See the License for the specific language governing permissions and
// limitations under the License.
//

import { type BaseWorkspaceInfo, type Data, type Version } from '@hcengineering/core'
import { getMetadata, PlatformError, unknownError } from '@hcengineering/platform'

import plugin from './plugin'

export async function listAccountWorkspaces (token: string): Promise<BaseWorkspaceInfo[]> {
  const accountsUrl = getMetadata(plugin.metadata.Endpoint)
  if (accountsUrl == null) {
    throw new PlatformError(unknownError('No account endpoint specified'))
  }
  const workspaces = await (
    await fetch(accountsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        method: 'listWorkspaces',
        params: [token]
      })
    })
  ).json()

  return (workspaces.result as BaseWorkspaceInfo[]) ?? []
}

export async function getTransactorEndpoint (
  token: string,
  kind: 'internal' | 'external' = 'internal',
  timeout: number = -1
): Promise<string> {
  const accountsUrl = getMetadata(plugin.metadata.Endpoint)
  if (accountsUrl == null) {
    throw new PlatformError(unknownError('No account endpoint specified'))
  }

  const st = Date.now()
  while (true) {
    try {
      const workspaceInfo: { result: BaseWorkspaceInfo } = await (
        await fetch(accountsUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token
          },
          body: JSON.stringify({
            method: 'selectWorkspace',
            params: ['', kind]
          })
        })
      ).json()
      return workspaceInfo.result.endpoint
    } catch (err: any) {
      if (timeout > 0 && st + timeout < Date.now()) {
        // Timeout happened
        throw err
      }
      if (err?.cause?.code === 'ECONNRESET' || err?.cause?.code === 'ECONNREFUSED') {
        await new Promise<void>((resolve) => setTimeout(resolve, 1000))
      } else {
        throw err
      }
    }
  }
}

export async function getPendingWorkspace (
  token: string,
  region: string,
  version: Data<Version>,
  operation: 'create' | 'upgrade' | 'all'
): Promise<BaseWorkspaceInfo | undefined> {
  const accountsUrl = getMetadata(plugin.metadata.Endpoint)
  if (accountsUrl == null) {
    throw new PlatformError(unknownError('No account endpoint specified'))
  }

  const workspaces = await (
    await fetch(accountsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        method: 'getPendingWorkspace',
        params: [token, region, version, operation]
      })
    })
  ).json()

  return workspaces.result as BaseWorkspaceInfo
}

export async function updateWorkspaceInfo (
  token: string,
  workspaceId: string,
  event: 'ping' | 'create-started' | 'upgrade-started' | 'progress' | 'create-done' | 'upgrade-done',
  version: Data<Version>,
  progress: number,
  message?: string
): Promise<void> {
  const accountsUrl = getMetadata(plugin.metadata.Endpoint)
  if (accountsUrl == null) {
    throw new PlatformError(unknownError('No account endpoint specified'))
  }
  await (
    await fetch(accountsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        method: 'updateWorkspaceInfo',
        params: [token, workspaceId, event, version, progress, message]
      })
    })
  ).json()
}

export async function workerHandshake (
  token: string,
  region: string,
  version: Data<Version>,
  operation: 'create' | 'upgrade' | 'all'
): Promise<void> {
  const accountsUrl = getMetadata(plugin.metadata.Endpoint)
  if (accountsUrl == null) {
    throw new PlatformError(unknownError('No account endpoint specified'))
  }

  await fetch(accountsUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      method: 'workerHandshake',
      params: [token, region, version, operation]
    })
  })
}