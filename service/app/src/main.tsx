import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { SnackbarProvider } from 'notistack';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CssBaseline from '@mui/material/CssBaseline';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import Root from './pages/Root';
import Error from './pages/Error';
import Upload from './pages/Upload';
import { Info, InfoLoader } from './pages/Info';

const router = createBrowserRouter([
    {
        path: "/",
        element: <Root />,
        errorElement: <Error />,
        children: [
            {
                path: "upload",
                element: <Upload />
            }
        ]
    },
    {
        path: "/info/:fileID",
        element: <Info />,
        loader: InfoLoader,
    }
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
                <RouterProvider router={router} />
            </SnackbarProvider>
        </ThemeProvider>
    </React.StrictMode>
)
