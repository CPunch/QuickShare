import React from 'react';
import ReactDOM from 'react-dom/client';
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import { SnackbarProvider } from 'notistack';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Card, CardContent, Grid } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CssBaseline from '@mui/material/CssBaseline';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import Root from './pages/Root';
import Error from './pages/Error';

const router = createBrowserRouter([
    {
        path: "/",
        element: <Root />,
        errorElement: <Error />
    },
]);

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <ThemeProvider theme={darkTheme}>
            <SnackbarProvider maxSnack={4} iconVariant={{
                success: <CheckCircleOutlineIcon />,
                error: <ErrorOutlineIcon />,
            }} anchorOrigin={{ horizontal: 'right', vertical: 'top' }}>
                <CssBaseline />
                <Grid
                    container
                    spacing={0}
                    style={{ marginTop: '50px' }}>
                    <Grid item xs={12} sx={{ width: "100%", display: 'flex', justifyContent: 'center'}}>
                        <Card
                            sx={{
                                borderRadius: 2,
                                margin: 2,
                                padding: 0,
                                maxWidth: 600,
                                width: "100%",
                            }}
                            >
                            <CardContent sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                                <RouterProvider router={router} />
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </SnackbarProvider>
        </ThemeProvider>
    </React.StrictMode>
)
