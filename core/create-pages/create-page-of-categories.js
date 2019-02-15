const createTaxonomyIndexPages = require('./_create-taxonomy-index-pages');
const { categories: meta } = require('./taxonomy-index-meta');
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
    const { locales, categories } = pendingSchemaData;

    const config = indexingConfig.filter(config => config.name === 'Categories')[0]
        || { isEnabled : true };

    if (config.isEnabled) {
        const itemsPerPage = await itemsPerPageForIndexPageName(meta.name, graphql);

        const taxonomies = categories.map(category => category.name)
            .sort((c1, c2) => c1 > c2);

        locales.forEach((locale) => {
            createTaxonomyIndexPages({
                template: meta.name,
                createPage : createPage,
                siteKeywords,
                siteDescription,
                locale: locale,
                componentName : meta.componentName,
                taxonomies,
                itemsPerPage,
                createPageTitle: meta.getPageTitle,
                createPagePath: meta.getPagePath,
                showsPageTitle: true,
                previousPageTitle: meta.getPreviousPageTitle(locale),
                nextPageTitle: meta.getNextPageTitle(locale),
            });
        });
    }
};
