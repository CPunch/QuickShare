import React from 'react';
import { Card, CardContent, Grid } from '@mui/material';

import TokenPrompt from '../components/TokenPrompt';
import UploadPrompt from '../components/UploadPrompt';

import { GetFiles, FileResult } from '../api/web';

type PageState = 'token' | 'upload';

const Root = () => {
    const [page, setPage] = React.useState<PageState>('token');
    const [files, setFiles] = React.useState<FileResult[]>([])
    const [token, setToken] = React.useState('');
    const onToken = async (token: string) => {
        setToken(token);
        let { data, error } = await GetFiles(token);
        if (data == null) {
            console.error(error)
            data = [];
        }
        setFiles(data);
        setPage('upload');
    }

    return (
        <Grid
            container
            spacing={0}
            style={{ marginTop: '50px' }}
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
    );
}

export default Root
