import { Typography } from '@mui/material';
import { Box } from '@mui/system';
import { isRouteErrorResponse, useRouteError } from "react-router-dom";

const makeErrorText = (error: any) => {
    if (isRouteErrorResponse(error)) {
        return <i>Route Error: { error.statusText }</i>;
    }

    return <i>{ error.message }</i>;
}

const Error = () => {
    const error = useRouteError();
    console.error(error);

    return (
        <Box sx={{ textAlign: 'center' }}>
            <Typography variant='h2' sx={{ padding: 4 }}>Oops!</Typography>
            <Typography paragraph={true}>Looks like something went wrong...</Typography>
            <Typography paragraph={true} color="silver">{makeErrorText(error)}</Typography>
        </Box>
    );
}

export default Error
