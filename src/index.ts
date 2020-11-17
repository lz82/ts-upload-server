import path from 'path';
import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-body'
import cors from 'koa-cors';
import fse from 'fs-extra';
import { mergeFileChunk } from './utils/file'

const UPLOAD_DIR = path.resolve(__dirname, '..', 'target')

const app = new Koa();

const router = new Router();

app.use(bodyParser({
  multipart: true
}))
app.use(cors())
router.get('/', async (ctx) => {
  ctx.response.body = `hello world`
})

router.post('/upload', async (ctx, next) => {
  const { hash, order, filename } = ctx.request.body;
  const chunk = ctx.request.files?.chunk;

  const chunkDir = path.resolve(UPLOAD_DIR, filename);

  if (!fse.existsSync(chunkDir)) {
    await fse.mkdir(chunkDir)
  }
  if (chunk?.path) {
    await fse.move(chunk.path, `${chunkDir}/${hash}`)
  }
  ctx.response.body = `received file chunk...`
  next()
})

router.post('/merge', async (ctx) => {
  const { filename, size } = ctx.request.body;
  console.log(filename, size)
  const filePath = path.resolve(UPLOAD_DIR, `${filename}`)
  mergeFileChunk(UPLOAD_DIR, filePath, filename, size)
  ctx.response.body = `merge...`
})

app.use(router.routes())

app.listen(6066)