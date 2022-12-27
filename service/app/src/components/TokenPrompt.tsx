import KeyIcon from '@mui/icons-material/Key';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import { Card, CardContent, Button, Box, TextField, Grid } from "@mui/material"
import React from 'react';

export interface TokenProps {
    tokenInput: string;
    setTokenInput: React.Dispatch<React.SetStateAction<string>>;
    onClick: React.MouseEventHandler<HTMLSpanElement>
}

const TokenPrompt = ({tokenInput, setTokenInput, onClick}: TokenProps) => {
    return (
        <Card
            sx={{
                borderRadius: 3,
                marginTop: 3,
                maxWidth: 600,
                width: "100%",
            }}
            >
            <CardContent sx={{ display: 'flex', justifyContent: 'center' }}>
                <Grid container spacing={2} >
                    <Grid item xs={10}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                            <KeyIcon sx={{ marginRight: 1, marginBottom: 'auto', marginTop: 'auto', weight: 'bold' }} />
                            <TextField 
                                variant="standard"
                                value={tokenInput}
                                onChange={(e: any) => setTokenInput(e.target.value)}
                                placeholder="Token"
                                sx={{ width: '100%' }}
                            />
                        </Box>
                    </Grid>
                    <Grid item xs={2}>
                        <Box>
                            <Button
                                variant="contained"
                                component="span"
                                onClick={onClick} >
                                <KeyboardReturnIcon />
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    )
}

export default TokenPrompt