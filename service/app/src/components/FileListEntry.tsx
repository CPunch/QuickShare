import React from 'react';
import { useSnackbar } from 'notistack';
import { Paper, Typography, LinearProgress, Divider, Grid, Chip, Collapse, IconButton, Tooltip } from "@mui/material";
import ContentPasteGoIcon from '@mui/icons-material/ContentPasteGo';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import AlarmIcon from '@mui/icons-material/Alarm';

import { FileResult } from '../api/web';

export type FileEntry = {
    id: number,
    name: string,
    progress: number,
    raw: File,
}

export type RenderFileEntryProps = {
    fileResult: FileResult
}

const sizeAbbreviate = (size: number) => {
    let sizeString = size.toString();
    if (size >= 1000) {
        const suffixes = ["", "K", "M", "G", "T", "P"];
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

    return sizeString + "B";
}

// tries to copy text to clipboard. this can fail !
const simpleCopy = (text: string): boolean => {
    try {
        navigator.clipboard.writeText(text);
    } catch {
        const tempText = document.createElement("textarea");
        tempText.value = text;
        document.body.appendChild(tempText);
        tempText.focus();
        tempText.select();
        try {
            document.execCommand('copy');
        } catch (err) {
            return false;
        }
        document.body.removeChild(tempText);
    }
    return true;
}

const RenderFileEntry = ({ fileResult }: RenderFileEntryProps) => {
    const [isOpen, setIsOpen] = React.useState(true);
    const { enqueueSnackbar } = useSnackbar();

    return (
        <Paper elevation={1} variant="outlined" sx={{ boxShadow: 1, borderRadius: 2, padding: 1, marginTop: 1 }} key={fileResult.id}>
            <Grid container spacing={1} alignItems="center" justifyContent="center">
                <Grid item xs={6}>
                    <Typography noWrap>{ fileResult.name }</Typography>
                </Grid>
                <Grid item xs={4.75} alignItems="right" justifyContent="right" sx={{ display: 'flex'}}>
                    <Tooltip title={ fileResult.expire === null ? fileResult.mime : fileResult.mime + ' - expires at ' + fileResult.expire }>
                        <Chip size="small" variant="outlined" label={ fileResult.mime } icon={ fileResult.expire === null ? <></> : <AlarmIcon /> } />
                    </Tooltip>
                </Grid>
                <Grid item xs={1.25} alignItems="right" justifyContent="right" sx={{ display: 'flex'}}>
                    <IconButton
                        size="small"
                        onClick={() => {
                            setIsOpen(!isOpen);
                        }}
                        >
                        {isOpen ? <KeyboardArrowDownIcon /> : <KeyboardArrowUpIcon /> }
                    </IconButton>
                </Grid>
            </Grid>
            <Collapse in={!isOpen}>
                <Divider sx={{ paddingTop: 1}} />
                <Grid container spacing={0} sx={{ paddingTop: 0.5, paddingBottom: 0.5 }}>
                    <Grid item xs={9}>
                        <Tooltip title={ fileResult.name }>
                            <Typography noWrap fontFamily="Monospace" fontSize="0.6rem">{ 'Name: ' + fileResult.name }</Typography>
                        </Tooltip>
                    </Grid>
                    <Grid item xs={3} textAlign="right">
                        <Typography noWrap fontFamily="Monospace" fontSize="0.6rem">{ 'Size: ' + sizeAbbreviate(fileResult.size) }</Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Tooltip title={ fileResult.hash }>
                            <Typography noWrap fontFamily="Monospace" fontSize="0.6rem">{ 'SHA256: ' + fileResult.hash.toUpperCase() }</Typography>
                        </Tooltip>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography noWrap fontFamily="Monospace" fontSize="0.6rem">{ 'Uploaded: ' + fileResult.uploadTime.toString() }</Typography>
                    </Grid>
                    { fileResult.expire !== null && (
                        <Grid item xs={6} textAlign="right">
                            <Typography noWrap fontFamily="Monospace" fontSize="0.6rem">{ 'Expires: ' + fileResult.expire.toString() }</Typography>
                        </Grid>
                    )}
                </Grid>
                <Chip size="small" icon={<ContentPasteGoIcon />} variant="outlined" label="Copy URL" clickable onClick={() => {
                    if (simpleCopy(window.location.origin + '/raw/' + fileResult!.id)) {
                        enqueueSnackbar('Copied ' + fileResult.name + ' URL!', {
                            variant: 'success',
                        });
                    } else {
                        enqueueSnackbar('Failed to copy ' + fileResult.name + ' URL!', {
                            variant: 'error',
                        });
                    }
                }} />
            </Collapse>
        </Paper>
    )
}

export { RenderFileEntry }