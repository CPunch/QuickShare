import React from 'react';
import Dropzone from "react-dropzone";
import { Paper, Box, Typography, Divider, FormHelperText, FormControl, Tabs, Tab, MenuItem, Select, Grid, LinearProgress, Button, IconButton } from "@mui/material";
import FileUploadIcon from '@mui/icons-material/FileUpload';
import CancelIcon from '@mui/icons-material/Cancel';

import { FileResult, UploadFile } from '../api/web';
import { RenderFileEntry } from './FileListEntry';

export interface UploadProps {
    token: string,
};

export type UploadEntry = {
    id: number,
    name: string,
    progress: number,
    isUploading: boolean,
    abort: AbortController,
    raw: File,
}

const ExpireTimes = [
    {label: "Never", value: '0s'},
    {label: "5 seconds", value: '5s'},
    {label: "15 Minutes", value: '15m'},
    {label: "1 Hour", value: '1h'},
    {label: "24 Hours", value: '24h'},
];

let UID = 0;

const UploadPrompt = ({ token }: UploadProps) => {
    const [uploadList, setUploadList] = React.useState<UploadEntry[]>([]);
    const [fileList, setFileList] = React.useState<FileResult[]>([]);
    const [expireTime, setExpireTime] = React.useState("0s");
    const [selectedTab, setSelectedTab] = React.useState(0);

    const updateUploadListEntry = (id: number, elems: any) => {
        setUploadList(currentList => {
            const newList = currentList.slice();
            const indx = newList.findIndex(e => e.id === id);
            newList[indx] = {
                ...newList[indx],
                ...elems
            }
            return newList;
        });
    };

    const removeUploadListEntry = (id: number) => {
        setUploadList(currentList => {
            const newList = currentList.slice();
            const indx = currentList.findIndex(e => e.id === id);
            newList[indx].abort.abort();
            newList.splice(indx, 1);
            return newList;
        });
    };

    // upload handler
    const onDropped = (files: File[]) => {
        // grab selected file data
        let fileDataList: UploadEntry[] = files.map(file => {
            return {
                id: UID++,
                name: file.name,
                progress: 0,
                isUploading: false,
                abort: new AbortController(),
                raw: file,
            };
        });

        setUploadList(uploadList.concat(fileDataList));
    }

    const onUpload = () => {
        uploadList.forEach(async uploadData => {
            // ignore already uploading files
            if (uploadData.isUploading) return;

            updateUploadListEntry(uploadData.id, { isUploading: true })
            const fileResult = await UploadFile(token, expireTime, uploadData.name, uploadData.raw, uploadData.abort, (progress) => {        
                updateUploadListEntry(uploadData.id, { progress });
            });

            if (uploadData.abort.signal.aborted) {
                removeUploadListEntry(uploadData.id);
                return;
            }

            if (fileResult === null) { // failed to upload !!! :sob:
                console.log('wtf!!!', fileResult)
                return;
            }

            removeUploadListEntry(uploadData.id);
            setFileList(currentList => {
                return currentList.concat([fileResult])
            });
        });
    }

    // render upload page
    return (
        <Box alignContent='center' justifyContent='center' sx={{ width: '100%' }}>
            <Tabs 
                value={selectedTab}
                onChange={(e, i) => setSelectedTab(i)}
                variant="fullWidth"
                sx={{ mb: 1 }}
            >
                <Tab label="Upload" />
                <Tab label="Files" />
            </Tabs>
            <Box hidden={selectedTab !== 0}>
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
                    <FormHelperText sx={{ margin: 'auto' }}>{ expireTime === "0s" ? "Selected files will not expire" : "Selected files will expire in " + expireTime }</FormHelperText>
                </FormControl>
                <Divider />
                {
                    uploadList.map(uploadData => (
                        <Paper elevation={1} variant="outlined" sx={{ boxShadow: 1, borderRadius: 2, padding: 1, marginTop: 1 }} key={ uploadData.id }>
                            <Grid container spacing={1} alignItems="center" justifyContent="center">
                                <Grid item xs={uploadData.isUploading ? 10.75 : 4}>
                                    <Typography noWrap>{ uploadData.name }</Typography>
                                </Grid>
                                { uploadData.isUploading &&
                                    <Grid item xs={6.75}>
                                        <LinearProgress color="secondary" variant="determinate" value={ uploadData.progress } />
                                    </Grid>
                                }
                                <Grid item xs={1.25} alignItems="right" justifyContent="right" sx={{ display: 'flex'}}>
                                    <IconButton
                                        size="small"
                                        onClick={() => removeUploadListEntry(uploadData.id)}
                                        >
                                        <CancelIcon />
                                    </IconButton>
                                </Grid>
                            </Grid>
                        </Paper>
                    ))
                }
                { uploadList.length > 0 && (
                    <Button
                        variant="outlined"
                        onClick={onUpload}
                        sx={{ width: '100%', borderRadius: 2, padding: 1, marginTop: 1 }}
                    >
                        <Typography>Upload selected files</Typography>
                    </Button>
                )}
            </Box>
            <Box hidden={selectedTab !== 1} sx={{ minHeight: '200px' }}>
                {
                    fileList.length > 0 ? fileList.map((fileResult) => (
                        <RenderFileEntry fileResult={fileResult} />
                    )) : <Typography>Upload files to get started!</Typography>
                }
            </Box>
        </Box>
    )
}

export default UploadPrompt