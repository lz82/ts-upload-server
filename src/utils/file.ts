import path from 'path'
import fs from 'fs';
import fse, { WriteStream } from 'fs-extra';

const pipeStream = (path: string, writeStream: WriteStream) => {
  new Promise((resolve) => {
    const readStream = fse.createReadStream(path);
    readStream.on('end', () => {
      // fse.unlinkSync(path);
      resolve()
    })
    readStream.pipe(writeStream)
  })
}

export async function mergeFileChunk(dir: string, filePath: string, filename: string, size: number) {
  const chunkDir = path.resolve(dir, filename);
  try {
    const chunkPath: string[] = await fse.readdir(chunkDir);
    chunkPath.sort((a, b) => (a.split('-')[1] as unknown as number) - (b.split("-")[1] as unknown as number));
    console.log(chunkPath)
    const res = await Promise.all(
      chunkPath.map((cp, index) => {
        pipeStream(path.resolve(chunkDir, cp), fse.createWriteStream(filePath, {
          start: index * size
        }))
      })
    )
    console.log('res', res)
    // fse.rmdirSync(chunkDir)
  } catch (err) {
    console.log(err)
  }
}