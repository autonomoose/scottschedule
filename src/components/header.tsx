import React, { useState } from 'react';
import { StaticImage } from 'gatsby-plugin-image'
import { Link, navigate } from "gatsby";
import { Auth } from 'aws-amplify';

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import HomeIcon from '@mui/icons-material/Home';
import MenuIcon from '@mui/icons-material/Menu';
import StarIcon from '@mui/icons-material/Star';

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
          <Link to={link}>
            <ListItem button><ListItemIcon>{icon}</ListItemIcon>
            <ListItemText>{text}</ListItemText>
            </ListItem>
          </Link>
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
}

const Header = ({uname}: HeaderProps) => {
  const [open, setOpen] = useState(false);

  async function signOut() {
    try {
        await Auth.signOut({ global: true });
        navigate("/");
    } catch (error) {
        console.warn('error signing out: ', error);
    }
  };

  const homePage = (uname !== '')? "/home": "/";
  return(
    <div><CssBaseline />
      <AppBar position="fixed" elevation={0}
      style={{ height: "54px", background: 'linear-gradient(to right,  #F5F5E6, #FAFAFA)',
          boxShadow: '0 1px 20px #000000', borderRadius: '0 0 5px 5px' }}
      >
        <Toolbar sx={{ justifyContent: 'space-around'}}>

          <IconButton aria-label="Open menu" onClick={() => {setOpen(true);}} edge="start"  >
            <MenuIcon /> M
          </IconButton>

          <Link to={homePage}>
            <StaticImage width={26} alt="Werner Digital" src="../images/wernerdigital-hosted.png"
            /><Typography variant='body'>
            Scottschedule
            </Typography>
          </Link>

          { (uname !== '') ?
              <Box sx={{ whiteSpace: 'nowrap', textAlign: 'right' }}>
                  <Link to="/usermaint" style={{ marginRight: `1em`}} >
                    <Typography variant='body'>
                    {uname}
                    </Typography>

                  </Link>
                  <Button variant="outlined" onClick={signOut}>
                    Sign Out
                  </Button>
               </Box>
               :
               <Box sx={{ whiteSpace: 'nowrap', textAlign: 'right' }}>
                 <Link to="/home" style={{ marginRight: `1em`}} >
                     <Button variant="outlined">
                       Sign In
                     </Button>
                 </Link>
               </Box>
          }

        </Toolbar>
      </AppBar>

      <Drawer variant="persistent" anchor="left" open={open} >
        <div style={{ width:"178px", height: (uname !== '')? "39px": "54px", background: 'linear-gradient(to right,  #F5F5E6, #FAFAFA)', padding: '8px 8px',
              boxShadow: '0 1px 20px #000000', borderRadius: '0 0 5px 5px' }}
        >

          <strong>Main Menu</strong>

          <IconButton onClick={() => {setOpen(false);}} aria-label="Close menu" >
              <ChevronLeftIcon /> C
          </IconButton>
        </div>
        <Divider />

        <List>
          { (uname !== '') ?
            <>
            <ListItemMenu link="/home" icon={<HomeIcon />} text="Home" />
            <ListItemMenu link="/help" icon={<StarIcon />} text="Help" />
            <ListItemMenu jslink={signOut} icon={<StarIcon />} text="Logout" />
            </>
          :
            <>
            <ListItemMenu link="/" icon={<HomeIcon />} text="Home" />
            <ListItemMenu link="/home" icon={<StarIcon />}  text="Login" />
            </>
          }
        </List>
      </Drawer>
    </div>
  )
};

export default Header