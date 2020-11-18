import path from 'path';
import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-body';
import cors from 'koa-cors';
import fse from 'fs-extra';
import { mergeFileChunk } from './utils/file';

const UPLOAD_DIR = path.resolve(__dirname, '..', 'target');
const SAVE_DIR = path.resolve(__dirname, '..', 'save');

const app = new Koa();

const router = new Router();

app.use(
	bodyParser({
		multipart: true,
	})
);
app.use(cors());
router.get('/', async (ctx) => {
	ctx.body = `hello world`;
});

router.post('/upload', async (ctx, next) => {
	const { hash, order, filename } = ctx.request.body;
	const chunk = ctx.request.files?.chunk;

	const chunkDir = path.resolve(UPLOAD_DIR, filename);
	if (!fse.existsSync(UPLOAD_DIR)) {
		await fse.mkdir(UPLOAD_DIR);
	}
	if (!fse.existsSync(chunkDir)) {
		await fse.mkdir(chunkDir);
	}
	if (chunk?.path) {
		await fse.move(chunk.path, `${chunkDir}/${hash}`);
	}
	console.log(hash + 'upload complete');
	ctx.body = `received file chunk...`;
});

router.post('/merge', async (ctx) => {
	const { filename, size } = ctx.request.body;
	console.log(filename, size);
	const filePath = path.resolve(SAVE_DIR, `${filename}`);
	mergeFileChunk(UPLOAD_DIR, filePath, filename, size);
	ctx.body = `merge...`;
});

app.use(router.routes());

app.listen(6066);
