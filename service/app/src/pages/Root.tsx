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
        <>{ page === 'upload' ? <UploadPrompt token={token} files={files} /> : <TokenPrompt onToken={onToken}/> }</>
    );
}

export default Root
