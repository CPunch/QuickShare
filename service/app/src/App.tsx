import Upload from './components/Upload';
import Token from './components/Token';
import { Card, CardContent, Container } from '@mui/material';

const App = () => {
    return (
        <>
            <Container sx={{  display: 'flex', justifyContent: 'center' }}>
                <Card
                    sx={{
                        borderRadius: 3,
                        marginTop: 3,
                        maxWidth: 600,
                        width: "100%",
                    }}
                    >
                    <CardContent sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Token />
                    </CardContent>
                </Card>
            </Container>
        </>
    )
}

export default App
