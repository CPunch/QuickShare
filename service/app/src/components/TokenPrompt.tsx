import KeyIcon from '@mui/icons-material/Key';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import { Box, TextField, Grid, Popover, Typography, IconButton } from "@mui/material"
import { useSnackbar } from 'notistack';
import React from 'react';

import { VerifyToken } from '../api/web';

export interface TokenProps {
    onToken: (token: string) => void // callback for a successful valid token submitted
}

const TOKEN_STORAGE = 'tkn';

const TokenPrompt = ({ onToken }: TokenProps) => {
    const [popover, setPopover] = React.useState<null | string>(null);
    const inputRef = React.useRef<HTMLDivElement>(null);
    const { enqueueSnackbar } = useSnackbar();

    // load token from localStorage (if it exists!)
    const [tokenInput, setTokenInput] = React.useState(() => {
        let tkn = localStorage.getItem(TOKEN_STORAGE)
        return tkn === null ? "" : tkn
    });

    // update token in localStorage && call onToken() callback if token is valid
    const onSubmit = async (event: React.MouseEvent<HTMLSpanElement>) => {
        event.preventDefault();
        localStorage.setItem(TOKEN_STORAGE, tokenInput);

        const { data, error } = await VerifyToken(tokenInput);
        if (data === null) {
            enqueueSnackbar('Failed to verify token: ' + error, {
                variant: 'error'
            });
        } else if (data === false) {
            setPopover('Invalid token!');
        } else if (data === true) {
            setPopover(null);
            onToken(tokenInput);
        }
    };

    const onPopoverClose = () => {
        setPopover(null);
    };

    return (
        <Grid container spacing={1} >
            <Grid item xs={11} alignItems="center" justifyContent="center"  sx={{ display: 'flex' }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-end', width: '100%' }}>
                    <KeyIcon sx={{ marginRight: 1, marginBottom: 'auto', marginTop: 'auto', weight: 'bold' }} />
                    <Popover
                        anchorEl={inputRef.current}
                        open={popover !== null}
                        onClose={onPopoverClose}
                        anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'left',
                        }}
                        transformOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                        }}
                    ><Typography sx={{ p: 2}}>{popover}</Typography></Popover>
                    <TextField
                        ref={inputRef}
                        variant="standard"
                        value={tokenInput}
                        color="secondary"
                        onChange={(e: any) => setTokenInput(e.target.value)}
                        placeholder="Token"
                        type="password"
                        sx={{ width: '100%' }}
                    />
                </Box>
            </Grid>
            <Grid item xs={1} alignItems="right" justifyContent="right" sx={{ display: 'flex' }}>
                <Box>
                    <IconButton
                        color={popover === null ? 'secondary' : 'error'}
                        onClick={onSubmit} >
                        <KeyboardReturnIcon />
                    </IconButton>
                </Box>
            </Grid>
        </Grid>
    );
}

export default TokenPrompt