import { useSnackbar } from 'notistack';
import { Paper, Box, Typography, LinearProgress, Divider, Grid, Chip, Collapse, IconButton, Tooltip } from "@mui/material";
import FileUploadIcon from '@mui/icons-material/FileUpload';
import ContentPasteGoIcon from '@mui/icons-material/ContentPasteGo';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import AlarmIcon from '@mui/icons-material/Alarm';
import React from 'react';
import Dropzone from "react-dropzone";

import { FileResult, UploadFile } from '../api/web';

export interface UploadProps {
    token: string,
};

let UID = 0;

const sizeAbbreviate = (size: number) => {
    let sizeString = size.toString();
    if (size >= 1000) {
        const suffixes = ["", "k", "m", "g", "t", "p"];
        let suffixNum = Math.floor(sizeString.length / 3);
        let shortValue: number = 0;

        for (let prec = 2; prec >= 1; prec--) {
            shortValue = parseFloat((suffixNum != 0 ? (size / Math.pow(1000,suffixNum)) : size).toPrecision(prec))
            if (shortValue.toString().replace(/[^a-zA-Z 0-9]+/g, '').length <= 2) {
                break;
            }
        }

        sizeString = (shortValue % 1 != 0 ? shortValue.toFixed(1) : shortValue.toString()) + suffixes[suffixNum]
    }

    return sizeString + "b";
}

type FileEntry = {
    id: number,
    name: string,
    progress: number,
    raw: File,
    fileResult?: FileResult,
}

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

    // list item (TODO: move this to it's own file in components directory)
    type RenderFileEntryProps = {
        fileData: FileEntry
    }

    const RenderFileEntry = ({ fileData }: RenderFileEntryProps) => {
        const [isOpen, setIsOpen] = React.useState(true);
        const { enqueueSnackbar } = useSnackbar();
    
        return (
            <Paper elevation={1} variant="outlined" sx={{ boxShadow: 1, borderRadius: 2, padding: 1, marginTop: 1 }} key={fileData.id}>
                <Grid container spacing={1} alignItems="center" justifyContent="center">
                    <Grid item xs={ fileData.fileResult === undefined ? 4 : 7}>
                        <Typography noWrap>{ fileData.name }</Typography>
                    </Grid>
                    { fileData.fileResult === undefined 
                        ?
                        <Grid item xs={8}>
                            <LinearProgress color="secondary" variant="determinate" value={ fileData.progress } />
                        </Grid>
                        :
                        <>
                        <Grid item xs={4} alignItems="right" justifyContent="right" sx={{ display: 'flex'}}>
                            <Tooltip title={ fileData.fileResult.mime }>
                                <Chip size="small" variant="outlined" label={ fileData.fileResult.mime } />
                            </Tooltip>
                        </Grid>
                        <Grid item xs={1} alignItems="right" justifyContent="right" sx={{ display: 'flex'}}>
                            <IconButton
                                size="small"
                                onClick={() => {
                                    setIsOpen(!isOpen);
                                }}
                                >
                                {isOpen ? <KeyboardArrowDownIcon /> : <KeyboardArrowUpIcon /> }
                            </IconButton>
                        </Grid>
                        </>
                    }
                </Grid>
                { fileData.fileResult === undefined
                    ?
                    <>{/* i do not perceive -.- */}</>
                    :
                    <Collapse in={!isOpen}>
                        <Divider sx={{ paddingTop: 1}} />
                        <Grid container spacing={0} sx={{ paddingTop: 0.5, paddingBottom: 0.5 }}>
                            <Grid item xs={9}>
                                <Tooltip title={ fileData.name }>
                                    <Typography noWrap fontFamily="Monospace" fontSize="0.6rem">{ 'Name: ' + fileData.fileResult.name }</Typography>
                                </Tooltip>
                            </Grid>
                            <Grid item xs={3} textAlign="right">
                                <Typography noWrap fontFamily="Monospace" fontSize="0.6rem">{ 'Size: ' + sizeAbbreviate(fileData.fileResult.size) }</Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Tooltip title={ fileData.fileResult.hash }>
                                    <Typography noWrap fontFamily="Monospace" fontSize="0.6rem">{ 'SHA256: ' + fileData.fileResult.hash.toUpperCase() }</Typography>
                                </Tooltip>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography noWrap fontFamily="Monospace" fontSize="0.6rem">{ 'Uploaded: ' + fileData.fileResult.uploadTime.toString() }</Typography>
                            </Grid>
                        </Grid>
                        <Chip size="small" icon={<ContentPasteGoIcon />} variant="outlined" label="Copy URL" clickable onClick={() => {
                            navigator.clipboard.writeText(window.location.origin + '/raw/' + fileData.fileResult!.id);
                            enqueueSnackbar('Copied ' + fileData.name + ' URL!', {
                                variant: 'success',
                            });
                        }} />
                        { fileData.fileResult.expire === null
                            ?
                            <></>
                            :
                            <Chip size="small" icon={<AlarmIcon />} variant="outlined" label={ 'Expires: ' + fileData.fileResult.expire.toString() } />
                        }
                    </Collapse>
                }
            </Paper>
        )
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