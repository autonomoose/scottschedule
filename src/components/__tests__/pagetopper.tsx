import React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";

import PageTopper from "../pagetopper";
//                <Link key="home" to={linkDebug('/home', vdebug)}>Home</Link>
//              <Link key={item.title}
//                to={linkDebug(item.plink, vdebug)}>
//                {item.title}</Link>
//             <Link to={linkDebug(item.plink,vdebug)}>
//               <small>{item.title}</small></Link>



const myhelp = '/help/pagetopper';
const myLinks = [
    {title: 'bcrumb1', plink: `/bcrumblink1`},
    {title: 'bcrumb2', plink: `/bcrumblink2?test=special`},
    ];
const myXtras = [
    {title: 'xtra1', plink: `/xtralink1`},
    {title: 'xtra2', plink: `/xtralink2`},
    ];

describe("PageTopper", () => {
    it("renders home snapshot correctly", async () => {
      const {container} = render(
        <PageTopper pname='Home' ptitle='Testing Home'
          helpPage={myhelp}
          linksList={myLinks}
          xtraList={myXtras}
        />
      );
      expect(container.firstChild).toMatchSnapshot();
    });
    it("renders debug", async () => {
      render(
        <PageTopper pname='Home' vdebug='true'
        helpPage={myhelp}
        linksList={myLinks}
        xtraList={myXtras}
        />
      );
    });
    it("renders /wo title or help", async () => {
      render(
        <PageTopper pname='Home'
        linksList={myLinks}
        xtraList={myXtras}
        />
      );
    });
});


