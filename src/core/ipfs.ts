export class IPFSService {
  constructor(private gateway: string, private rpc: string) {}

  /**
   * Uploads a file to ipfs
   * @param {File} content filelist object
   * @returns {(Object|Promise)} ancon file post response object
   */
  async uploadFile(content: File) {
    const body = new FormData()
    body.append('file', content)

    const ipfsAddRes = await fetch(`${this.rpc}/api/v0/add?pin=true`, {
      body,
      method: 'POST',
    })

    const ipfsAddResJSON = await ipfsAddRes.json()

    const cid = ipfsAddResJSON.Hash

    const imageUrl = `${this.gateway}/ipfs/${cid}`
    return {
      image: imageUrl,
      cid: cid,
      error: false,
    }
  }
}
