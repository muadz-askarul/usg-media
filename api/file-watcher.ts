import { watch } from 'chokidar';
import { prisma } from './prisma';
import { TPatient, TUsgImage } from './models/patient.model';
import moment from 'moment';
import { uploadToDrive } from './google-drive/drive';

export default (path: string) => {
    const watcher = watch(path, {
        ignored: /[\/\\]\./,
        persistent: true,
    });

    const onWatcherReady = () => {
        console.info('From here can you check for real changes, the initial scan has been completed.');
    };

    // Declare the listeners of the watcher
    watcher
        .on('add', async (path: string) => {
            console.log('File', path, 'has been added');
            let filePath = path.replace(process.env.WATCH_PATH, '');
            filePath = filePath.charAt(0) === '/' ? filePath.slice(1) : filePath;

            const [identifier, examintaion_date, fileName] = filePath.split('/');

            if (!!!identifier || !!!examintaion_date || !!!fileName) return;

            const [patient_id, name] = identifier.split('_');

            const patientData: TPatient = {
                name,
                patient_id: +patient_id,
            };

            console.log('find existing with patient id', patientData.patient_id);
            let existingPatient = await prisma.patient.findUnique({
                where: {
                    patient_id: patientData.patient_id,
                },
            });
            let existingFile = await prisma.usg_image.findFirst({
                where: {
                    url: filePath,
                },
            });
            let patient;
            if (!!!existingPatient) {
                patient = await prisma.patient.create({
                    data: patientData,
                });
            }
            
            const { status, file_id } = await uploadToDrive(path, fileName);
            if (!status) return;
            if (!!existingFile) {
                existingFile.url = filePath;
                await prisma.usg_image.update({ where: { id: existingFile.id }, data: {url: file_id} });
            } else {
                const usgImage: TUsgImage = {
                    patient_id: +patient_id,
                    examination_date: moment(examintaion_date, 'YYYYMMDD').toDate(),
                    url: file_id,
                };
                await prisma.usg_image.create({
                    data: usgImage,
                });
            }

        })
        // .on('addDir', (path) => {
        //     console.log('Directory', path, 'has been added');
        // })
        .on('change', (path) => {
            console.log('File', path, 'has been changed');
        })
        .on('unlink', (path) => {
            console.log('File', path, 'has been removed');
        })
        // .on('unlinkDir', (path) => {
        //     console.log('Directory', path, 'has been removed');
        // })
        .on('error', (error) => {
            console.log('Error happened', error);
        })
        .on('ready', onWatcherReady);
    // .on('raw', (event, path, details) => {
    //     // This event should be triggered everytime something happens.
    //     console.log('Raw event info:', event, path, details);
    // });
};
