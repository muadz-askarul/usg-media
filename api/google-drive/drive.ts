import { google } from 'googleapis';
import path from 'path';
import fs from 'node:fs';

const KEY_FILE_PATH = path.join(__dirname, 'cred.json');

const SCOPES = ['https://www.googleapis.com/auth/drive'];

const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE_PATH,
    scopes: SCOPES,
});

const getMimeType = (filePath: string): string => {
    const extension = filePath.split('.').pop();
    const mimeTypeMap: { [key: string]: string } = {
        txt: 'text/plain',
        html: 'text/html',
        jpg: 'image/jpeg',
        png: 'image/png',
        // Add more mappings as needed
    };

    const mimeType = mimeTypeMap[extension as keyof typeof mimeTypeMap] || 'application/octet-stream';
    return mimeType;
};

export const uploadToDrive = async (filePath: string, fileName: string, directory?: string) => {
    fs.readFile(filePath, (err, data) => {
        if (err) {
            console.error(err);
            return;
        }

        const mimeType = getMimeType(filePath);
        console.log(mimeType);
    });

    try {
        const { data } = await google.drive({ version: 'v3', auth: auth }).files.create({
            media: {
                mimeType: getMimeType(filePath),
                body: fs.createReadStream(filePath),
            },
            requestBody: {
                name: fileName,
                parents: [process.env.DRIVE_FOLDER_ID],
            },
            fields: 'id,name',
        });

        console.log(`File uploaded successfully -> ${JSON.stringify(data)}`);

        return { status: 1, message: 'success', file_id: data.id, file_name: data.name };
    } catch (error) {
        console.log(error);
        return { status: -1, message: 'failure', err: error.message };
    }
};
