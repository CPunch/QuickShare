import React from 'react';
import { Card, CardContent, Grid } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import TokenPrompt from './components/TokenPrompt';
import UploadPrompt from './components/UploadPrompt';

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
});

type PageState = 'token' | 'upload';

const App = () => {
    const [page, setPage] = React.useState<PageState>('token');
    const [token, setToken] = React.useState('');
    const onToken = (token: string) => {
        setPage('upload');
        setToken(token);
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
                            padding: 0,
                            maxWidth: 500,
                            width: "100%",
                        }}
                        >
                        <CardContent sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                            { page === 'upload' ? <UploadPrompt token={token} /> : <TokenPrompt onToken={onToken}/> }
                        </CardContent>
                    </Card>
                </Grid>
            </Grid> 
        </ThemeProvider>
    );
}

export default App
