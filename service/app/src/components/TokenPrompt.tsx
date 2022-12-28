import KeyIcon from '@mui/icons-material/Key';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import { Button, Box, TextField, Grid } from "@mui/material"
import React from 'react';

export interface TokenProps {
    tokenInput: string;
    setTokenInput: React.Dispatch<React.SetStateAction<string>>;
    onClick: React.MouseEventHandler<HTMLSpanElement>
}

const TokenPrompt = ({tokenInput, setTokenInput, onClick}: TokenProps) => {
    return (
        <Grid container spacing={1} >
            <Grid item xs={10}>
                <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                    <KeyIcon sx={{ marginRight: 1, marginBottom: 'auto', marginTop: 'auto', weight: 'bold' }} />
                    <TextField 
                        variant="standard"
                        value={tokenInput}
                        onChange={(e: any) => setTokenInput(e.target.value)}
                        placeholder="Token"
                        type="password"
                        sx={{ width: '100%' }}
                    />
                </Box>
            </Grid>
            <Grid item xs={2}>
                <Box>
                    <Button
                        variant="outlined"
                        onClick={onClick} >
                        <KeyboardReturnIcon />
                    </Button>
                </Box>
            </Grid>
        </Grid>
    );
}

export default TokenPrompt