import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MenuIcon from '@mui/icons-material/Menu';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

import { Link } from 'react-router-dom';
import zIndex from '@mui/material/styles/zIndex';
const drawerWidth = 200;

interface SidebarLink {
    title: string,
    link: string,
    icon: React.JSXElementConstructor<any>,
}

interface Props {
    links: SidebarLink[],
}

// thanks https://mui.com/material-ui/react-drawer/#ResponsiveDrawer.tsx !!
export default function NavbarProvider({ children, links }: React.PropsWithChildren<Props>) {
    const [mobileOpen, setMobileOpen] = React.useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const drawer = (
        <Paper sx={{ height: '100%' }}>
            <Toolbar /> {/* this is a little hacky, just get the alignment under our appbar */}
            <List>
                {links.map((link) => (
                    <ListItem key={link.title} disablePadding component={Link} to={link.link}>
                        <ListItemButton>
                            <ListItemIcon>
                                <link.icon size='large' />
                            </ListItemIcon>
                            <ListItemText primary={<Typography color='white' variant='button'>{link.title}</Typography>} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Paper>
    );

    return (
        <Box sx={{ display: 'flex' }}>
            <AppBar
                position="fixed"
                sx={{
                    boxShadow: 0,
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div">
                        QuickShare
                    </Typography>
                </Toolbar>
            </AppBar>
            <Box
                component="nav"
                sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
            >
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true, // Better open performance on mobile.
                    }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                >
                   {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, zIndex: 1000 },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>
            <Box
                component="main"
                sx={{ flexGrow: 1, p: 3, width: '100%' }}
            >
                {children}
            </Box>
        </Box>
    );
}