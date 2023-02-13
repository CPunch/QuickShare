import React from 'react';
import ReportGmailerrorredIcon from '@mui/icons-material/ReportGmailerrorred';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { RenderFileEntry } from '../components/FileListEntry';
import { TokenContext, FileListContext } from './Root';

const Files = () => {
    const token = React.useContext(TokenContext);
    const { fileList, setFileList } = React.useContext(FileListContext) ?? {fileList: [], setFileList: () => {}};

    const removeFileListEntry = (id: string) => {
        setFileList(currentList => {
            const newList = currentList.slice();
            const indx = currentList.findIndex(e => e.id === id);
            newList.splice(indx, 1);
            return newList;
        });
    }

    return (
        <Box sx={{ width: '100%' }}>
            {
                fileList.length > 0
                ?
                fileList.map((fileResult) => (
                    <RenderFileEntry token={token} fileResult={fileResult} removeFileListEntry={removeFileListEntry} />
                ))
                :
                <Box sx={{ padding: 2, textAlign: 'center' }}>
                    <ReportGmailerrorredIcon sx={{ width: '100%', height: '200px' }} />
                    <Typography variant="subtitle1" color="silver">Upload files from the 'Upload' tab to get started!</Typography>
                </Box>
            }
        </Box>
    );
};

export default Files;