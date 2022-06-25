import React, { useState } from 'react';
import { StaticImage } from 'gatsby-plugin-image'
import { navigate } from "gatsby";
import { Auth } from 'aws-amplify';

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import GroupIcon from '@mui/icons-material/Group';
import HomeIcon from '@mui/icons-material/Home';
import MenuIcon from '@mui/icons-material/Menu';
import StarIcon from '@mui/icons-material/Star';

import { LinkD } from './pagetopper';


interface ListItemMenuBasics {
    icon: React.ReactNode,
    text: string,
}
interface ListItemMenuLink extends ListItemMenuBasics {
    link: string,
    exlink?: never,
    jslink?: never,
}
interface ListItemMenuExLink extends ListItemMenuBasics {
    link?: never,
    exlink: string,
    jslink?: never,
}
interface ListItemMenuJsLink extends ListItemMenuBasics {
    link?: never,
    exlink?: never,
    jslink: () => void,
}
type ListItemMenuProps = ListItemMenuLink | ListItemMenuExLink | ListItemMenuJsLink;

const ListItemMenu = (props: ListItemMenuProps) => {
    const {link, icon, text, exlink, jslink} = props;
    return(
      <>
        { (link) ?
          <LinkD to={link}>
            <ListItem button><ListItemIcon>{icon}</ListItemIcon>
            <ListItemText>{text}</ListItemText>
            </ListItem>
          </LinkD>
          :
          <>
            { (exlink) ?
              <a href={exlink}>
                <ListItem button><ListItemIcon>{icon}</ListItemIcon>
                <ListItemText>{text}</ListItemText>
                </ListItem>
              </a>
              :
              <ListItem button onClick={jslink}><ListItemIcon>{icon}</ListItemIcon>
              <ListItemText>{text}</ListItemText>
              </ListItem>
            }
          </>
        }
      </>
    );
};


interface HeaderProps {
        uname?: string,
        mode?: string,
        setMode?: (arg0:string) => void,
}

const Header = (props: HeaderProps) => {
  const [open, setOpen] = useState(false);
  // handle user changing dark/light mode with button
  const handleDarkClick = (oldMode?: string) => {
      if (typeof oldMode === 'string' && props.setMode) {
          const newMode = (oldMode === 'dark') ? "light" : "dark";
          props.setMode(newMode);
          window.localStorage.setItem('color-mode', newMode);
      }
  };

  async function signOut() {
    try {
        await Auth.signOut({ global: true });
        navigate("/");
    } catch (error) {
        console.warn('error signing out: ', error);
    }
  };

  const homePage = (props.uname && props.uname !== '')? "/home": "/";
  return(
    <Box>
      <AppBar position="fixed" elevation={0} color='transparent'
        sx={{
          bgcolor: 'site.main',
          height: "54px", borderRadius: '0 0 5px 5px',
          boxShadow: '-5px 5px 12px #888888',
        }}>
        <Toolbar sx={{ justifyContent: 'space-around' }}>
          <IconButton aria-label="Open menu" onClick={() => {setOpen(true);}} edge="start"  >
            <MenuIcon />
          </IconButton>

          <LinkD to={homePage}>
            <Box display='flex' >
            <StaticImage width={26} alt="Werner Digital" src="../images/wernerdigital-hosted.png"/>
            <Typography variant='body1' sx={{
              color: (theme) => (theme.palette.text.primary),
            }}>
              Scottschedule
            </Typography>
            </Box>
          </LinkD>

          { (props.uname && props.uname !== '') ?
              <Box mr={1} display='flex' alignItems='center' sx={{ whiteSpace: 'nowrap', textAlign: 'right' }}>
                  <LinkD to="/usermaint" style={{ marginRight: `1rem`}} >
                    <Typography variant='body1'>
                      {props.uname}
                    </Typography>
                  </LinkD>
                  <Button variant="outlined" onClick={signOut}>
                    Sign Out
                  </Button>
               </Box>
               :
               <Box sx={{ whiteSpace: 'nowrap', textAlign: 'right' }}>
                 <LinkD to="/home" style={{ marginRight: `1em`}} >
                     <Button variant="outlined">
                       Sign In
                     </Button>
                 </LinkD>
               </Box>
          }
          <IconButton aria-label="Dark/light mode" onClick={() => handleDarkClick(props.mode)} edge="start"  >
            {(props.mode === 'dark') ? <DarkModeIcon /> : <LightModeIcon />}
          </IconButton>

        </Toolbar>
      </AppBar>

      <Drawer variant="persistent" anchor="left" open={open} >
        <Box sx={{
          width:"178px",
          height: (props.uname && props.uname !== '')? "39px": "54px",
          padding: '8px 8px',
          boxShadow: '0 1px 20px #000000',
          borderRadius: '0 0 5px 5px'
        }}
        >
          <Box ml={4} display='flex' alignItems='center'>
          <Typography variant='subtitle1'>
            Main&nbsp;Menu
          </Typography>
          <IconButton onClick={() => {setOpen(false);}} aria-label="Close menu" >
            <ArrowDropUpIcon />
          </IconButton>
          </Box>
        </Box>
        <Divider />

        <List>
          { (props.uname && props.uname !== '') ?
            <>
            <ListItemMenu link="/home" icon={<HomeIcon />} text="Home" />
            <ListItemMenu link="/usermaint" icon={<StarIcon />} text="Account" />
            <ListItemMenu link="/scheds" icon={<StarIcon />} text="Schedules" />
            <ListItemMenu link="/events" icon={<StarIcon />} text="Events" />
            <ListItemMenu link="/help" icon={<StarIcon />} text="Help" />
            <ListItemMenu jslink={signOut} icon={<StarIcon />} text="Logout" />
            </>
          :
            <>
            <ListItemMenu link="/" icon={<HomeIcon />} text="Home" />
            <ListItemMenu exlink="https://www.wernerdigital.com/about" icon={<GroupIcon />}   text="About" />
            <ListItemMenu link="/home" icon={<StarIcon />}  text="Login" />
            </>
          }
        </List>
      </Drawer>
    </Box>
  )
};

export default Header