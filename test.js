const fse = require('fs-extra');
const path = require('path');

const pipeStream = (path, writeStream) => {
	return new Promise((resolve) => {
		try {
			const readStream = fse.createReadStream(path);
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

const chunkDir = '/Users/nickylau/Desktop/learn/GitHub/ts-upload-server/target/Flutter技术解析...1586490568.pdf';

const readStream = fse.createReadStream(
	'/Users/nickylau/Desktop/learn/GitHub/ts-upload-server/target/Flutter技术解析...1586490568.pdf/Flutter技术解析...1586490568.pdf-1'
);

const chunkPath = fse.readdirSync(chunkDir);
chunkPath.sort((a, b) => a.split('-')[1] - b.split('-')[1]);
console.log(chunkPath);
chunkPath.map((cp, index) => {
	pipeStream(
		path.resolve(chunkDir, cp),
		fse.createWriteStream('/Users/nickylau/Desktop/learn/GitHub/ts-upload-server/output/temp', {
			start: index * 10 * 1024 * 1024,
		})
	);
});

readStream.on('end', () => {
	console.log('read end...');
});

const writeStream = fse.createWriteStream('/Users/nickylau/Desktop/learn/GitHub/ts-upload-server/output/temp');

readStream.pipe(writeStream);
