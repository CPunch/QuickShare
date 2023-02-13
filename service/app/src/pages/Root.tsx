import React from 'react';
import { Outlet } from "react-router-dom";
import { Card, CardContent, Grid } from '@mui/material';

import { GetFiles, FileResult } from '../api/web';
import NavbarProvider from '../components/Navbar';

import TokenPrompt from '../components/TokenPrompt';

interface FileListContextType {
    fileList: FileResult[],
    setFileList: React.Dispatch<React.SetStateAction<FileResult[]>>
}

export const TokenContext = React.createContext('');
export const FileListContext = React.createContext<FileListContextType | null>(null);

const Root = () => {
    const [validToken, setValidPage] = React.useState(false);
    const [token, setToken] = React.useState('');
    const [files, setFiles] = React.useState<FileResult[]>([]);
    const onToken = async (token: string) => {
        setToken(token);
        let { data, error } = await GetFiles(token);
        if (data == null) {
            console.error(error)
            data = [];
        }
        setFiles(data);
        setValidPage(true);
    }

    return (
        <TokenContext.Provider value={token}>
            <>{ validToken ?
                <FileListContext.Provider value={{ fileList: files, setFileList: setFiles }}>
                    <NavbarProvider>
                        <Grid
                            container
                            spacing={0}
                            style={{ marginTop: '50px' }}>
                            <Grid item xs={12} sx={{ width: "100%", display: 'flex', justifyContent: 'center'}}>
                                <Card
                                    sx={{
                                        borderRadius: 2,
                                        margin: 'auto',
                                        marginTop: 2,
                                        padding: 0,
                                        maxWidth: 600,
                                        width: "100%",
                                    }}
                                    >
                                    <CardContent sx={{ display: 'flex', justifyContent: 'center', maxWidth: '100%', width: '100%' }}>
                                        <Outlet />
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </NavbarProvider>
                </FileListContext.Provider>
                :
                <Grid
                    container
                    justifyContent="center"
                    alignContent="center"
                    spacing={0}
                    sx={{ width: "100%", height: "100vh", display: 'flex', justifyContent: 'center', alignContent: 'center', margin: 'auto' }}>
                    <Grid item xs={12} sx={{ width: "100%", margin: 2 }}>
                        <Card
                            sx={{
                                borderRadius: 2,
                                margin: 'auto',
                                padding: 0,
                                maxWidth: 600,
                                width: "100%",
                            }}
                            >
                            <CardContent sx={{ display: 'flex', justifyContent: 'center', maxWidth: '100%' }}>
                                <TokenPrompt onToken={onToken}/>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            }</>
        </TokenContext.Provider>
    );
};

export default Root
