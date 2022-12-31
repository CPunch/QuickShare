import { Card, CardContent, Box, Button } from "@mui/material";
import React from 'react';
import Dropzone from "react-dropzone";

const readFile = (file: File) => {
    return new Promise((resolve, reject) => {
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
}

const Upload = () => {
    const [uploading, setUploading] = React.useState(false);

    const onDropped = async (files: File[]) => {
        // grab selected file data
        const fileDataList = await Promise.all(files.map(async file => {
            const data = await readFile(file);
            const name = file.name;
            return { name, data };
        }));

        // honestly, should I batch these instead of doing them 1 at a time?
        fileDataList.forEach(fileData => {
            // TODO: upload each file
        });
    }

    return (
        <Box>
            <Dropzone onDrop={onDropped} />
        </Box>
    )
}

export default Upload