import { useSnackbar } from 'notistack';
import { Paper, Box, Typography, LinearProgress, Divider, Grid, Chip, Collapse, ToggleButton, Button } from "@mui/material";
import FileUploadIcon from '@mui/icons-material/FileUpload';
import ContentPasteGoIcon from '@mui/icons-material/ContentPasteGo';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
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

    // list item
    type RenderFileEntryProps = {
        fileData: FileEntry
    }
    
    const RenderFileEntry = ({ fileData }: RenderFileEntryProps) => {
        const [isOpen, setIsOpen] = React.useState(true);
        const { enqueueSnackbar } = useSnackbar();
    
        return (
            <Paper elevation={1} variant="outlined" sx={{ borderRadius: 2, padding: 1, marginTop: 1 }} key={fileData.id}>
                <Grid container spacing={1} alignItems="center" justifyContent="center">
                    <Grid item xs={ fileData.fileResult === undefined ? 4 : 8}>
                        <Typography noWrap>{ fileData.name }</Typography>
                    </Grid>
                    { fileData.fileResult === undefined 
                        ?
                        <Grid item xs={8}>
                            <LinearProgress color="secondary" variant="determinate" value={ fileData.progress } />
                        </Grid>
                        :
                        <>
                        <Grid item xs={2} alignItems="center" justifyContent="center" sx={{ display: 'flex'}}>
                            <Button onClick={() => {
                                if (fileData.fileResult !== undefined) {
                                    navigator.clipboard.writeText(window.location.origin + '/raw/' + fileData.fileResult.id);
                                    enqueueSnackbar('Copied ' + fileData.name + ' URL!', {
                                        variant: 'success',
                                    });
                                }
                            }}>
                                <ContentPasteGoIcon />
                            </Button>
                        </Grid>
                        <Grid item xs={2} alignItems="center" justifyContent="center" sx={{ display: 'flex'}}>
                            <ToggleButton
                                value="close"
                                size="small"
                                selected={!isOpen}
                                onChange={() => {
                                    setIsOpen(!isOpen);
                                }}
                                >
                                <KeyboardArrowDownIcon />
                            </ToggleButton>
                        </Grid>
                        </>
                    }
                </Grid>
                <Collapse in={!isOpen}>
                    <Grid container spacing={0}>
                        <Grid item xs={10} sx={{ maxWidth: '100%' }}>
                            <Typography variant="caption" noWrap fontSize='0.5rem'>SHA256: { fileData.fileResult === undefined ? '' : fileData.fileResult.hash.toUpperCase() }</Typography>
                        </Grid>
                        <Grid item xs={2} sx={{ maxWidth: '100%' }}>
                            <Typography variant="caption" noWrap fontSize='0.5rem'>{ fileData.fileResult === undefined ? '' : fileData.fileResult.mime }</Typography>
                        </Grid>
                    </Grid>
                </Collapse>
            </Paper>
        )
    }

    // render upload page
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
                fileList.map((fileData) => (
                    <RenderFileEntry fileData={fileData} />
                ))
            }
        </Box>
    )
}

export default UploadPrompt