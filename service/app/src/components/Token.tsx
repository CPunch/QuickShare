import KeyIcon from '@mui/icons-material/Key';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import { Button, Box, TextField, Grid } from "@mui/material"
import React from 'react';

const TokenPrompt = () => {
    const [tokenInput, setTokenInput] = React.useState("");

    return (
        <Grid container spacing={2} >
            <Grid item xs={10}>
                <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                    <KeyIcon sx={{ color: 'action.active', my: 0.5 }} />
                    <TextField 
                        variant="standard"
                        value={tokenInput}
                        onChange={(e: any) => setTokenInput(e.target.value)}
                        label="Token"
                        sx={{ width: '100%' }}
                    />
                </Box>
            </Grid>
            <Grid item xs={2}>
                <Box>
                    <Button
                        variant="contained"
                        component="span" >
                        <KeyboardReturnIcon sx={{ my: 0.5}} />
                    </Button>
                </Box>
            </Grid>
        </Grid>
    )
}

export default TokenPrompt