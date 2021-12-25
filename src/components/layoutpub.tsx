import React from 'react';
import { Link } from 'gatsby';

import Divider from '@mui/material/Divider';
import HomeIcon from '@mui/icons-material/Home';

import Header from './header';
import './layout.scss';

interface FtrLinkProps {
        external?: boolean,
        children: React.ReactNode,
        to: string,
}
const FtrLink = (props: FtrLinkProps) => (
  <li style={{ display: `inline-block`, marginRight: `1rem` }}>
  { (props.external)?
      <a style={{color: `black`}} href={props.to}>{props.children}</a>
      :
      <Link style={{color: `black`}} to={props.to}>{props.children}</Link>
  }
  </li>
)

interface LayoutPubProps {
        children: React.ReactNode,
}
const LayoutPub = ({ children }: LayoutPubProps) => {
  return (
        <div style={{
            margin: `1rem auto`,
            minHeight: '100vh',
          }}
        >
          <Header uname=""/>
          <div
            style={{
              margin: `0 auto`,
              padding: `50px 1.0875rem 1.45rem`,
                maxWidth: 960,
            }}
          >
            <main>{children}</main>
            <footer style={{ paddingTop: 40 }}>
                <Divider />
                <nav><ul>
                <FtrLink to="/"><HomeIcon /> Home</FtrLink>

                </ul></nav>
                <Divider />
              &copy; {new Date().getFullYear()}, Werner Digital Technology Inc
              {` `}
            </footer>
          </div>
        </div>
  )
}


export default LayoutPub
