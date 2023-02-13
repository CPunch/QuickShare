import React from 'react';
import { Link } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Badge from '@mui/material/Badge';
import Paper from '@mui/material/Paper';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

import FolderIcon from '@mui/icons-material/Folder';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';

interface SidebarLink {
    title: string,
    link: string,
    icon: React.ReactElement,
}

interface FileBadgeContextType {
    filesBadge: number,
    setFilesBadge: React.Dispatch<React.SetStateAction<number>>
}

interface Props {

}

export const FileBadgeContext = React.createContext<FileBadgeContextType | null>(null);
const drawerWidth = 200;

// thanks https://mui.com/material-ui/react-drawer/#ResponsiveDrawer.tsx !!
export default function NavbarProvider({ children }: React.PropsWithChildren<Props>) {
    const [mobileOpen, setMobileOpen] = React.useState(false);
    const [filesBadge, setFilesBadge] = React.useState(0);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const links: SidebarLink[] = [
        {
            title: 'Upload',
            link: '/upload',
            icon: (<FileUploadIcon />)
        },
        {
            title: 'Files',
            link: '/files',
            icon: (<Badge badgeContent={filesBadge} color="secondary"><FolderIcon /></Badge>)
        },
    ];

    const drawer = (
        <Paper sx={{ height: '100%' }}>
            <Toolbar /> {/* this is a little hacky, just get the alignment under our appbar */}
            <List>
                {links.map((link) => (
                    <ListItem key={ link.link } disablePadding component={ Link } to={ link.link }>
                        <ListItemButton onClick={() => setFilesBadge(0)}>
                            <ListItemIcon>
                                { link.icon }
                            </ListItemIcon>
                            <ListItemText primary={<Typography color="white" variant="button">{link.title}</Typography>} />
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
                sx={{ width: { sm: drawerWidth }}}
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
                sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` }}}
            >
                <FileBadgeContext.Provider value={{ filesBadge, setFilesBadge }}>
                    {children}
                </FileBadgeContext.Provider>
            </Box>
        </Box>
    );
}