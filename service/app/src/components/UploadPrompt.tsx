import { Card, CardContent, Box, Button } from "@mui/material";
import React from 'react';
import Dropzone from "react-dropzone";

import { UploadFile } from '../api/web';

const readFile = (file: File) => {
    return new Promise<ArrayBuffer | null>((resolve, reject) => {
        const reader = new FileReader()

        // read file and dispatch promise
        reader.onerror = (event) => {
            reject(event);
        }
        reader.onload = (event) => {
            resolve(event.target?.result as ArrayBuffer)
        }
        reader.readAsArrayBuffer(file)
    })
};

export interface UploadProps {
    token: string,
};

const UploadPrompt = ({ token }: UploadProps) => {
    const [fileList, setFileList] = React.useState(); // TODO

    const onDropped = async (files: File[]) => {
        // grab selected file data
        const fileDataList = await Promise.all(files.map(async file => {
            const data = await readFile(file);
            const name = file.name;
            return { name, data };
        }));

        // honestly, should I batch these instead of doing them 1 at a time?
        fileDataList.forEach(async fileData => {
            // no data ? no bitches ?
            if (fileData.data === null) {
                return;
            }

            // TODO: grab expire time from a dropdown or something
            const fileResult = await UploadFile(token, "0s", fileData.name, fileData.data)
            if (fileResult === null) { // failed to upload !!! :sob:
                return;
            }
        });
    }

    return (
        <Box>
            <Dropzone onDrop={onDropped} />
        </Box>
    )
}

export default UploadPrompt