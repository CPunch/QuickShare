import React from 'react';
import Dropzone from "react-dropzone";
import { Paper, Box, Typography, Divider, FormHelperText, FormControl, Tabs, Tab, MenuItem, Select, Grid, LinearProgress, Button, IconButton, Badge } from "@mui/material";
import FileUploadIcon from '@mui/icons-material/FileUpload';
import ClearIcon from '@mui/icons-material/Clear';
import ReportGmailerrorredIcon from '@mui/icons-material/ReportGmailerrorred';
import FolderIcon from '@mui/icons-material/Folder';

import { FileResult, UploadFile } from '../api/web';
import { RenderFileEntry } from './FileListEntry';
import { useSnackbar } from 'notistack';

export interface UploadProps {
    token: string,
    files: FileResult[],
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
    {label: "15 Minutes", value: '15m'},
    {label: "1 Hour", value: '1h'},
    {label: "8 Hours", value: '8h'},
    {label: "24 Hours", value: '24h'},
    {label: "48 Hours", value: '48h'},
];

let UID = 0;

const UploadPrompt = ({ token, files }: UploadProps) => {
    const [uploadList, setUploadList] = React.useState<UploadEntry[]>([]);
    const [fileList, setFileList] = React.useState<FileResult[]>(files);
    const [expireTime, setExpireTime] = React.useState("0s");
    const [selectedTab, setSelectedTab] = React.useState(0);
    const [newFilesBadge, setNewFilesBadge] = React.useState(0);
    const { enqueueSnackbar } = useSnackbar();

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
    }

    const removeUploadListEntry = (id: number) => {
        setUploadList(currentList => {
            const newList = currentList.slice();
            const indx = currentList.findIndex(e => e.id === id);
            newList[indx].abort.abort();
            newList.splice(indx, 1);
            return newList;
        });
    }

    const removeFileListEntry = (id: string) => {
        setFileList(currentList => {
            const newList = currentList.slice();
            const indx = currentList.findIndex(e => e.id === id);
            newList.splice(indx, 1);
            return newList;
        });
    }

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
            const { data, error } = await UploadFile(token, expireTime, uploadData.name, uploadData.raw, uploadData.abort, (progress) => {        
                updateUploadListEntry(uploadData.id, { progress });
            });

            if (uploadData.abort.signal.aborted) {
                removeUploadListEntry(uploadData.id);
                return;
            }

            if (error !== null) {
                enqueueSnackbar('Failed to upload: ' + error, {
                    variant: 'error'
                });
                updateUploadListEntry(uploadData.id, { isUploading: false, progress: 0 });
                return;
            }

            if (data === null) { // if data is null and error is null.. wtf happened??
                console.error('wtf!!!', data)
                return;
            }

            setNewFilesBadge(value => value+1);
            removeUploadListEntry(uploadData.id);
            setFileList(currentList => {
                return currentList.concat([data])
            });
        });
    }

    // render upload page
    return (
        <Box sx={{ width: '100%' }}>
            <Tabs
                value={selectedTab}
                onChange={(e, i) => {setSelectedTab(i); setNewFilesBadge(0);}}
                variant="fullWidth"
                textColor="secondary"
                indicatorColor="secondary"
                sx={{ mb: 1, marginTop: -2}}
            >
                <Tab label="Upload" icon={<FileUploadIcon />} iconPosition="start" />
                <Tab label="Files" icon={<Badge badgeContent={newFilesBadge} color="secondary"><FolderIcon /></Badge>} iconPosition="start" />
            </Tabs>
            <Box hidden={selectedTab !== 0}>
                <Dropzone onDrop={onDropped}>
                    {({getRootProps, getInputProps}) => (
                        <Paper elevation={0} variant="outlined"  sx={{ boxShadow: 1, borderRadius: 2, padding: 2, textAlign: 'center' }} {...getRootProps()}>
                            <FileUploadIcon sx={{ width: '100%', height: '200px' }} />
                            <input {...getInputProps()} />
                            <Typography variant="subtitle1" color="silver">Drag 'n' drop or click to select files</Typography>
                        </Paper>
                    )}
                </Dropzone>
                <FormControl sx={{ width: '100%', borderRadius: 2, padding: 2}}>
                    <Select
                        value={expireTime}
                        color="secondary"
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
                                <Grid item xs={uploadData.isUploading ? 4 : 11}>
                                    <Typography noWrap>{ uploadData.name }</Typography>
                                </Grid>
                                { uploadData.isUploading &&
                                    <Grid item xs={7}>
                                        <LinearProgress color="secondary" variant="determinate" value={ uploadData.progress } />
                                    </Grid>
                                }
                                <Grid item xs={1} alignItems="right" justifyContent="right" sx={{ display: 'flex' }}>
                                    <IconButton
                                        size="small"
                                        onClick={() => removeUploadListEntry(uploadData.id)}
                                        >
                                        <ClearIcon />
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
                        color='secondary'
                        sx={{ width: '100%', borderRadius: 2, padding: 1, marginTop: 1 }}
                    >
                        <Typography>Upload selected files</Typography>
                    </Button>
                )}
            </Box>
            <Box hidden={selectedTab !== 1}>
                {
                    fileList.length > 0
                    ?
                    fileList.map((fileResult) => (
                        <RenderFileEntry token={token} fileResult={fileResult} removeFileListEntry={removeFileListEntry} />
                    ))
                    :
                    <Box sx={{ padding: 2, textAlign: 'center' }}>
                        <ReportGmailerrorredIcon sx={{ width: '100%', height: '200px' }} />
                        <Typography variant="subtitle1" color="silver">Upload files from the 'Upload' tab to get started!</Typography>
                    </Box>
                }
            </Box>
        </Box>
    )
}

export default UploadPrompt