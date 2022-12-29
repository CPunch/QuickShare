import React from 'react';
import { Card, CardContent, Grid } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import Upload from './components/Upload';
import TokenPrompt from './components/TokenPrompt';

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
});


const App = () => {
    const onToken = (token: string) => {
        // TODO: token is validated, open upload page
    }

    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <Grid
                container
                spacing={0}
                direction="column"
                alignItems="center"
                justifyContent="center"
                style={{ minHeight: '100vh' }}
            >
                <Grid item xs={12} sx={{ width: "100%", display: 'flex', justifyContent: 'center'}}>
                    <Card
                        sx={{
                            borderRadius: 2,
                            margin: 2,
                            paddingLeft: 0,
                            paddingRight: 1,
                            paddingTop: 0,
                            paddingBottom: 0,
                            maxWidth: 500,
                            width: "100%",
                        }}
                        >
                        <CardContent sx={{ display: 'flex', justifyContent: 'center' }}>
                            <TokenPrompt onToken={onToken}/>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid> 
        </ThemeProvider>
    );
}

export default App
