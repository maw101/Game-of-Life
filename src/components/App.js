import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import './css/App.css';

import Grid from './Grid';

const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  });

const App = () => {

    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <Grid />
        </ThemeProvider>
    );

}

export default App;
