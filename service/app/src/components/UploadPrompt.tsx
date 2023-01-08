import React from 'react';
import Dropzone from "react-dropzone";
import { Paper, Box, Typography, Divider, FormHelperText, FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import FileUploadIcon from '@mui/icons-material/FileUpload';
import AlarmIcon from '@mui/icons-material/Alarm';

import { UploadFile } from '../api/web';
import { RenderFileEntry, FileEntry } from './FileListEntry';

export interface UploadProps {
    token: string,
};

const ExpireTimes = [
    {label: "Never", value: '0s'},
    {label: "5 seconds", value: '5s'},
    {label: "15 Minutes", value: '15m'},
    {label: "1 Hour", value: '1h'},
    {label: "24 Hours", value: '24h'},
];

let UID = 0;

const UploadPrompt = ({ token }: UploadProps) => {
    const [fileList, setFileList] = React.useState<FileEntry[]>([]);
    const [expireTime, setExpireTime] = React.useState("0s");

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

    const removeFileListEntry = (id: number) => {
        setFileList(currentList => {
            const newList = currentList.slice();
            const indx = currentList.findIndex(e => e.id === id);
            newList.slice(indx, 1);
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
            const fileResult = await UploadFile(token, expireTime, fileData.name, fileData.raw, (progress) => {        
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
        <Box alignContent='center' justifyContent='center' sx={{ width: '100%' }}>
            <Dropzone onDrop={onDropped}>
                {({getRootProps, getInputProps}) => (
                    <Paper elevation={0} variant="outlined"  sx={{ boxShadow: 1, borderRadius: 2, padding: 2, textAlign: 'center' }} {...getRootProps()}>
                        <FileUploadIcon sx={{ width: '100%', height: '200px' }}></FileUploadIcon>
                        <input {...getInputProps()} />
                        <Typography align="center" variant="caption">Drag 'n' drop or click to select files</Typography>
                    </Paper>
                )}
            </Dropzone>
            <FormControl sx={{ width: '100%', borderRadius: 2, padding: 2}}>
                <Select
                    value={expireTime}
                    onChange={(e) => setExpireTime(e.target.value)}
                >
                    {ExpireTimes.map(time => (
                        <MenuItem key={time.value} value={time.value}>{time.label}</MenuItem> 
                    ))}
                </Select>
                <FormHelperText sx={{ margin: 'auto' }}>{ expireTime === "0s" ? "Uploaded files will not expire" : "Uploaded files will expire in " + expireTime }</FormHelperText>
            </FormControl>
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