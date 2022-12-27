import { Box, Button } from "@mui/material";
import React from 'react';

const Upload = () => {
    const [uploading, setUploading] = React.useState(false)

    const selectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUploading(true)
        // TODO: implement logic lol
    }

    return (
        <Box>
            <label htmlFor="btn-upload">
                <input
                    id="btn-upload"
                    name="btn-upload"
                    style={{ display: 'none' }}
                    type="file"
                    onChange={selectFile}  
                />
                <Button
                    variant="outlined"
                    component="span" >
                    Choose Files
                </Button>
            </label>
            <div className="file-name"></div>
        </Box>
    )
}

export default Upload