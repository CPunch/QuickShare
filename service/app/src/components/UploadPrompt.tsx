import React from 'react';
import Dropzone from "react-dropzone";
import { Paper, Box, Typography, Divider } from "@mui/material";
import FileUploadIcon from '@mui/icons-material/FileUpload';

import { UploadFile } from '../api/web';
import { RenderFileEntry, FileEntry } from './FileListEntry';

export interface UploadProps {
    token: string,
};

let UID = 0;

const UploadPrompt = ({ token }: UploadProps) => {
    const [fileList, setFileList] = React.useState<FileEntry[]>([]);

    const updateFileListEntry = (id: number, elems: any) => {
        setFileList(currentList => {
            const newList = currentList.slice();
            const indx = newList.findIndex(e => e.id === id);
            newList[indx] = {
                ...newList[indx],
                ...elems
            }
            return newList;
        });
    };

    // upload handler
    const onDropped = (files: File[]) => {
        // grab selected file data
        let fileDataList: FileEntry[] = files.map(file => {
            return { name: file.name, progress: 0, raw: file , id: UID++};
        });
        setFileList(fileList.concat(fileDataList));

        fileDataList.forEach(async fileData => {
            // TODO: grab expire time from a dropdown or something
            const fileResult = await UploadFile(token, "0s", fileData.name, fileData.raw, (progress) => {        
                updateFileListEntry(fileData.id, { progress });
            });

            if (fileResult === null) { // failed to upload !!! :sob:
                console.log('wtf!!!', fileResult)
                return;
            }

            updateFileListEntry(fileData.id, { fileResult });
        });
    }

    // render upload page
    return (
        <Box alignContent='center' sx={{ width: '100%' }}>
            <Dropzone onDrop={onDropped}>
                {({getRootProps, getInputProps}) => (
                    <Paper elevation={0} variant="outlined"  sx={{ boxShadow: 1, borderRadius: 2, padding: 2, marginBottom: 1, textAlign: 'center' }} {...getRootProps()}>
                        <FileUploadIcon sx={{ width: '100%', height: '200px' }}></FileUploadIcon>
                        <input {...getInputProps()} />
                        <Typography align="center" variant="caption">Drag 'n' drop or click to select files</Typography>
                    </Paper>
                )}
            </Dropzone>
            <Divider />
            {
                fileList.map((fileData) => (
                    <RenderFileEntry fileData={fileData} />
                ))
            }
        </Box>
    )
}

export default UploadPrompt