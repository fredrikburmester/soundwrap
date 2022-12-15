import * as fs from 'fs';

export const logMessage = (message: string, type: 'info' | 'error') => {
	const dateTime = new Date().toLocaleString('sv-SE', {
		timeZone: 'Europe/Stockholm',
		});

	// Open logs/info.log or logs/error.log
	const logStream = fs.createWriteStream
		(`logs/${
			type === 'info' ? 'info' : 'error'
		}.log`, { flags: 'a' });

	// Write log
	logStream.write(`[${dateTime}] ${message}\n`);
}