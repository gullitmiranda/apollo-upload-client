import { HTTPFetchNetworkInterface, printAST } from 'apollo-client'
import { extractFiles } from 'extract-files'

import objectToFormData from './utils/objectToFormData'

export class UploadHTTPFetchNetworkInterface extends HTTPFetchNetworkInterface {
  fetchFromRemoteEndpoint({ request, options }) {
    const { customExtractFiles = extractFiles, ...restOptions } = options

    // Continue if uploads are possible
    if (typeof FormData !== 'undefined') {
      // Extract any files from the request variables
      const files = customExtractFiles(request.variables, 'variables')

      // Continue if there are files to upload
      if (files.length) {
        // Convert query AST to string for transport
        request.query = printAST(request.query)

        // Construct a multipart form
        let formData = new FormData()
        formData = objectToFormData(request, formData)
        formData.append('operations', JSON.stringify(request))
        files.forEach(({ path, file }) => formData.append(path, file))

        // Send request
        return fetch(this._uri, {
          method: 'POST',
          body: formData,
          ...restOptions
        })
      }
    }

    // Standard fetch method fallback
    return super.fetchFromRemoteEndpoint({ request, options: restOptions })
  }
}

export function createNetworkInterface({ uri, opts = {} }) {
  return new UploadHTTPFetchNetworkInterface(uri, opts)
}
