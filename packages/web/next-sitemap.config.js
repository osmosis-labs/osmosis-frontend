/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || "https://app.osmosis.zone",
  generateRobotsTxt: true,
  sitemapSize: 7000,
};
