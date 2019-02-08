const createIndexPages = require('./_create-index-pages');
const { tags: page } = require('./page-meta');
const { makeTagSummaryPayload } = require('../utils');
const { itemsPerPageForIndexPageName } = require('../config');

module.exports = async (args) => {
    const {
        createPagesArgs,
        pendingSchemaData,
        indexingConfig,
        siteKeywords,
        siteDescription,
    } = args;

    const { graphql, actions } = createPagesArgs;
    const { createPage } = actions;
    const { locales, tags } = pendingSchemaData;

    const config = indexingConfig.filter(config => config.name === 'Tags')[0] || { isEnabled : true };

    if (config.isEnabled) {
        const itemsPerPage = await itemsPerPageForIndexPageName(page.name, graphql);

        const items = await Promise.all(tags.map(async (tag) => {
            return await makeTagSummaryPayload(tag, graphql)
        }));

        locales.forEach((locale) => {
            createIndexPages({
                createPage : createPage,
                siteKeywords,
                siteDescription,
                locale: locale,
                itemComponentName : page.itemComponentName,
                layoutComponentName: page.layoutComponentName,
                items,
                itemsPerPage,
                createPageTitle: page.getPageTitle,
                createPagePath: page.getPagePath,
                showsPageTitle: true,
                previousPageTitle: page.getPreviousPageTitle(locale),
                nextPageTitle: page.getNextPageTitle(locale),
            });
        });
    }
};