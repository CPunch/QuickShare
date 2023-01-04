import { Paper, Box, Typography, LinearProgress, Divider, Grid, Chip } from "@mui/material";
import FileUploadIcon from '@mui/icons-material/FileUpload';
import DownloadIcon from '@mui/icons-material/Download';
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

    const onDropped = (files: File[]) => {
        // grab selected file data
        let fileDataList: FileEntry[] = files.map(file => {
            return { name: file.name, progress: 0, raw: file , id: UID++};
        });
        setFileList(fileList.concat(fileDataList));

        fileDataList.forEach(async fileData => {
            // TODO: grab expire time from a dropdown or something
            const fileResult = await UploadFile(token, "0s", fileData.name, fileData.raw, (progress) => {        
                setFileList(currentList => {
                    const newList = currentList.slice();
                    const elem = newList.find(e => e.id === fileData.id);
                    if (elem !== undefined) {
                        elem.progress = progress;
                    }
                    return newList;
                });
            });

            if (fileResult === null) { // failed to upload !!! :sob:
                console.log('wtf!!!', fileResult)
                return;
            }

            setFileList(currentList => {
                const newList = currentList.slice();
                const elem = newList.find(e => e.id === fileData.id);
                if (elem !== undefined) {
                    elem.fileResult = fileResult;
                }
                return newList;
            });
        });
    }

    return (
        <Box alignContent='center' sx={{ width: '100%' }}>
            <Dropzone onDrop={onDropped}>
                {({getRootProps, getInputProps}) => (
                    <Paper elevation={0} variant="outlined"  sx={{ borderRadius: 2, padding: 2, marginBottom: 2, textAlign: 'center' }} {...getRootProps()}>
                        <FileUploadIcon sx={{ width: '100%', height: '200px' }}></FileUploadIcon>
                        <input {...getInputProps()} />
                        <Typography align="center" variant="caption">Drag 'n' drop or click to select files</Typography>
                    </Paper>
                )}
            </Dropzone>
            <Divider />
            {
                fileList.map((fileData, index) => (
                    <Paper elevation={1} variant="outlined" sx={{ borderRadius: 2, padding: 1, marginTop: 1 }} key={index}>
                        <Grid container spacing={1} alignItems="center" justifyContent="center">
                            <Grid item xs={ fileData.fileResult === undefined ? 4 : 9}>
                                <Typography noWrap>{ fileData.name }</Typography>
                            </Grid>
                            { fileData.fileResult === undefined 
                                ?
                                <Grid item xs={8}>
                                    <LinearProgress color="secondary" variant="determinate" value={ fileData.progress } />
                                </Grid>
                                :
                                <>
                                <Grid item xs={3} alignItems="center" justifyContent="center" sx={{ display: 'flex'}}>
                                    <Chip icon={<DownloadIcon />} label="Raw" component="a" href={ "/raw/" + fileData.fileResult.id } clickable />
                                </Grid>
                                </>
                            }
                        </Grid>
                    </Paper>
                ))
            }
        </Box>
    )
}

export default UploadPrompt