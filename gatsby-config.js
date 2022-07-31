module.exports = {
  siteMetadata: {
    siteUrl: "https://scottschedule.wernerdigital.com",
    description: `Schedule Reminder`,
    title: "Scottschedule",
    author: "wdt",
  },
  plugins: [
    "gatsby-plugin-image",
    "gatsby-plugin-sass",
    "gatsby-plugin-react-helmet",
    {
      resolve: "gatsby-plugin-manifest",
      options: {
        name: `Scottschedule - Schedule Reminder`,
        short_name: `Scottschedule`,
        start_url: `/home`,
        background_color: `#d3d7d8`,
        theme_color: `#e9ebeb`,
        display: `minimal-ui`,
        icon: "src/images/wernerdigital-hosted.png",
        cache_busting_mode: 'none'
      },
    },
    {
        resolve: "gatsby-plugin-offline",
        options: {
          workboxConfig: {
              globPatterns: ['**/src/images*']
          }
        },
    },
    "gatsby-plugin-sharp",
    "gatsby-transformer-sharp",
    "gatsby-remark-images",
    {
      resolve: "gatsby-plugin-mdx",
      options: {
        defaultLayouts: {
          default: require.resolve("./src/components/layout.tsx"),
        },
        gatsbyRemarkPlugins: [
          {
            resolve: "gatsby-remark-images",
            options: {
              maxWidth: 1200,
            },
          }
        ],
      }
    },
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "images",
        path: "./src/images/",
      },
      __key: "images",
    },
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "pages",
        path: "./src/pages/",
      },
      __key: "pages",
    },

  ],
};
