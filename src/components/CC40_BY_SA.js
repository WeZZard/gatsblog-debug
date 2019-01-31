import React from 'react';
import { StaticQuery, graphql } from 'gatsby';
import Img from "gatsby-image";

export default () => <StaticQuery
    query={graphql`
        {
            file(relativePath: { eq: "images/cc4.0-by-sa.png" }) {
                childImageSharp {
                    fixed(width: 88, height: 32) {
                      ...GatsbyImageSharpFixed
                    }
                }
            }
        }`
    }
    render={ data => <Img fixed={data.file.childImageSharp.fixed}/>}
/>
