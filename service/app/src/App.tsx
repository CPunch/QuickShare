import React from 'react';
import { SnackbarProvider } from 'notistack';
import { Card, CardContent, Grid } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CssBaseline from '@mui/material/CssBaseline';

import TokenPrompt from './components/TokenPrompt';
import UploadPrompt from './components/UploadPrompt';

import { GetFiles, FileResult } from './api/web';

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
});

type PageState = 'token' | 'upload';

const App = () => {
    const [page, setPage] = React.useState<PageState>('token');
    const [files, setFiles] = React.useState<FileResult[]>([])
    const [token, setToken] = React.useState('');
    const onToken = async (token: string) => {
        setToken(token);
        let { data, error } = await GetFiles(token);
        if (error !== null) {
            console.error(error)
            data = [];
        }
        setFiles(files);
        setPage('upload');
    }

    return (
        <ThemeProvider theme={darkTheme}>
            <SnackbarProvider maxSnack={4} iconVariant={{
                success: <CheckCircleOutlineIcon />,
                error: <ErrorOutlineIcon />,
            }} anchorOrigin={{ horizontal: 'right', vertical: 'top' }}>
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
                                { page === 'upload' ? <UploadPrompt token={token} files={files} /> : <TokenPrompt onToken={onToken}/> }
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </SnackbarProvider>
        </ThemeProvider>
    );
}

export default App
