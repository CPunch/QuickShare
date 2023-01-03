import { Paper, Box, Typography, LinearProgress, Divider } from "@mui/material";
import FileUploadIcon from '@mui/icons-material/FileUpload';
import React from 'react';
import Dropzone from "react-dropzone";

import { FileResult, UploadFile } from '../api/web';

export interface UploadProps {
    token: string,
};

let UID = 0;

type FileEntry = {
    id: number,
    name: string,
    progress: number,
    raw: File,
    fileResult?: FileResult,
}

const UploadPrompt = ({ token }: UploadProps) => {
    const [fileList, setFileList] = React.useState<FileEntry[]>([]);

    const onDropped = async (files: File[]) => {
        // grab selected file data
        let fileDataList: FileEntry[] = await Promise.all(files.map(async file => {
            const name = file.name;
            return { name, progress: 0, raw: file , id: UID++};
        }));
        setFileList(fileList.concat(fileDataList));

        fileDataList.forEach(async (fileData) => {
            // TODO: grab expire time from a dropdown or something
            const fileResult = await UploadFile(token, "0s", fileData.name, fileData.raw, (progress) => {        
                setFileList((state) => {
                    const newList = state.slice();
                    const indx = newList.findIndex(e => e.id === fileData.id);
                    newList[indx] = {
                        ...fileData,
                        progress: progress
                    };
                    return newList;
                });
            });

            if (fileResult === null) { // failed to upload !!! :sob:
                console.log('wtf!!!', fileResult)
                return;
            }

            setFileList((state) => {
                const newList = state.slice();
                const indx = newList.findIndex(e => e.id === fileData.id);
                newList[indx] = {
                    ...fileData,
                    fileResult: fileResult,
                };
                return newList;
            });
        });
    }

    return (
        <Box>
            <Dropzone onDrop={onDropped}>
                {({getRootProps, getInputProps}) => (
                    <Paper elevation={0} variant='outlined' sx={{ borderRadius: 2, padding: 2, marginBottom: 2 }}>
                        <div {...getRootProps()}>
                            <FileUploadIcon sx={{ width: '100%', height: '200px' }}></FileUploadIcon>
                            <input {...getInputProps()} />
                            <Typography>Drag 'n' drop some files here, or click to select files</Typography>
                        </div>
                    </Paper>
                )}
            </Dropzone>
            <Divider />
            {
                fileList.map((fileData, index) => (
                    <Box sx={{ width: '100%' }} key={index}>
                        <Typography>{ fileData.name }</Typography>
                        { fileData.fileResult === undefined ? <LinearProgress color="secondary" variant="determinate" value={ fileData.progress } /> : <a href={ "/raw/" + fileData.fileResult.id }></a> }
                    </Box>
                ))
            }
        </Box>
    )
}

export default UploadPrompt