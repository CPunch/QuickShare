import React from 'react';
import { LoaderFunctionArgs, useLoaderData } from "react-router-dom";
import { Card, CardContent, Grid, Typography, Paper } from '@mui/material';
import { FileResult, GetFileInfo } from '../api/web';
import { FileInfo } from '../components/FileListEntry';

export const InfoLoader = ({ params }: LoaderFunctionArgs): string => {
    return params.fileID ?? 'err'
}

const PreviewRenderer = (file: FileResult) => {
    const generalMime = file.mime.split('/', 1)[0];
    const rawURL = '/raw/' + file.id;

    switch (generalMime) {
        case 'image': return (<img src={rawURL} style={{ maxWidth: '100%' }}></img>);
        case 'video': return (<video controls><source src={rawURL} style={{ maxWidth: '100%' }}/></video>);
    }
}

export const Info = () => {
    const [fileID, setFileID] = React.useState<string>(useLoaderData() as string);
    const [file, setFile] = React.useState<null | FileResult>(null);

    React.useEffect(() => {
        const LoadFile = async () => {
            const res = await GetFileInfo(fileID);

            if (res.error) {
                throw res.error;
            }

            setFile(res.data as FileResult);
        }

        if (file === null) {
            LoadFile();
        }
    }, [fileID]);

    return (
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
                        maxWidth: '100%',
                    }}
                    >
                    <CardContent sx={{ display: 'flex-wrap', justifyContent: 'center', textAlign: 'center', maxWidth: '100%', width: '100%', margin: '0 auto' }}>
                        {file !== null && (<>
                            {PreviewRenderer(file)}
                            <Paper elevation={1} variant="outlined" sx={{ boxShadow: 1, borderRadius: 2, padding: 1, marginTop: 1 }}>
                                <FileInfo file={file} />
                            </Paper>
                        </>)}
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
}
