import React from 'react';
import { Card, CardContent, Grid } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Upload from './components/Upload';
import TokenPrompt from './components/TokenPrompt';

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
});

const TOKEN_STORAGE = 'tkn'

const App = () => {
    // load token from localStorage (if it exists!)
    const [tokenInput, setTokenInput] = React.useState(() => {
        let tkn = localStorage.getItem(TOKEN_STORAGE)
        return tkn === null ? "" : tkn
    });

    // update token in localStorage and (TODO!) test token validity
    const onSubmit = (event: React.MouseEvent<HTMLSpanElement>) => {
        console.log(event)
        localStorage.setItem(TOKEN_STORAGE, tokenInput)
    }

    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <Grid
                container
                spacing={0}
                direction="column"
                alignItems="center"
                justifyContent="center"
                style={{ minHeight: '100vh' }}
            >
                <Grid item xs={12} sx={{ width: "100%", display: 'flex', justifyContent: 'center'}}>
                    <Card
                        sx={{
                            borderRadius: 2,
                            margin: 2,
                            paddingLeft: 0,
                            paddingRight: 1,
                            paddingTop: 0,
                            paddingBottom: 0,
                            maxWidth: 500,
                            width: "100%",
                        }}
                        >
                        <CardContent sx={{ display: 'flex', justifyContent: 'center' }}>
                            <TokenPrompt tokenInput={tokenInput} setTokenInput={setTokenInput} onClick={onSubmit}/>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid> 
        </ThemeProvider>
    );
}

export default App
