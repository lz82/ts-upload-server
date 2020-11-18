import path from 'path';
import fs from 'fs';
import fse, { WriteStream } from 'fs-extra';

const extractExt = (filename: string) => filename.slice(filename.lastIndexOf('.'), filename.length);

const pipeStream = (path: string, writeStream: WriteStream) => {
	return new Promise((resolve) => {
		try {
			const readStream = fse.createReadStream(path);
			console.log(writeStream);
			readStream.on('end', () => {
				console.log('read end...');
				fse.unlinkSync(path);
				resolve('stream read end...');
			});
			readStream.pipe(writeStream);
		} catch (err) {
			console.log(err);
		}
	});
};

export async function mergeFileChunk(dir: string, filePath: string, filename: string, size: number) {
	const chunkDir = path.resolve(dir, filename);
	try {
		const chunkPath: string[] = await fse.readdir(chunkDir);
		chunkPath.sort((a, b) => ((a.split('-')[1] as unknown) as number) - ((b.split('-')[1] as unknown) as number));
		console.log(filePath);
		await Promise.all(
			chunkPath.map((cp, index) => {
				pipeStream(
					path.resolve(chunkDir, cp),
					fs.createWriteStream(filePath, {
						start: index * size,
					})
				);
			})
		);
		try {
			fse.rmdirSync(chunkDir);
		} catch (err) {
			console.log(err);
		}
	} catch (err) {
		console.log(err);
	}
}
