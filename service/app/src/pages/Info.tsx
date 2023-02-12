import React from 'react';
import { LoaderFunctionArgs, useLoaderData } from "react-router-dom";
import { Card, CardContent, Grid } from '@mui/material';

import { FileResult } from '../api/web';

export const InfoLoader = ({ params }: LoaderFunctionArgs): FileResult => {
    return {
        id: params.fileID ?? 'err',
        name: 'chinese weather device',
        hash: '',
        mime: '',
        size: 0,
        uploadTime: new Date(),
        expire: new Date()
    };
}

export const Info = () => {
    const file = useLoaderData() as FileResult;

    console.log(file);
    return (<></>);
}
