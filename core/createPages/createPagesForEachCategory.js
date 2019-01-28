const createIndexPages = require('./_createIndexPages');
const { category: page } = require('./pageMetadata');
const { makePostExcerptPayload } = require('../Payload');
const { getItemsPerPageInIndexWithName } = require('../config');

module.exports = async (args) => {
    const {
        createPagesArgs,
        pendingSchemaData,
        siteLang,
    } = args;

    const { graphql, actions } = createPagesArgs;
    const { createPage } = actions;

    const { tags, categories, locales } = pendingSchemaData;

    await Promise.all(locales.map(async (locale) => {
        const args = {
            categories,
            tags,
            locale,
            graphql,
            createPage,
            siteLang,
        };
        await _createPageForCategoriesForLocale(args)
    }));
};

const _createPageForCategoriesForLocale = async (args) => {
    const { categories, tags, locale, siteLang, graphql, createPage } = args;

    const itemsPerPage = await getItemsPerPageInIndexWithName(page.name, graphql);

    await Promise.all(categories.map(async (category) => {
        const postFilter = locale
            ? (locale.identifier === siteLang
                    ? `lang: { in: [ null, "${locale.identifier}" ] }`
                    : `lang: { eq: "${locale.identifier}" }`
            ) : 'isLocalized: { eq: false }';

        const result = await graphql(`
            {
                allPost(
                    filter: { 
                        category: { eq: "${category.name}" }
                        ${postFilter} 
                    }
                    sort: { fields: [createdTime], order: DESC }
                ) {
                    edges {
                        node {
                            title
                            subtitle
                            createdTime
                            tags
                            category
                            slug
                            parent {
                                id
                            }
                        }
                    }
                }
            }
        `);

        if (result.errors) {
            throw result.errors
        }

        const {
            data: {
                allPost,
            },
        } = result;

        const {
            edges: posts
        } = allPost || { edges: [] };

        await createIndexPages({
            graphql: graphql,
            createPage : createPage,
            locale: locale,
            itemComponentName : page.itemComponentName,
            layoutComponentName: page.layoutComponentName,
            primitiveItems: posts || [],
            itemsPerPage: itemsPerPage,
            createItem: async (post) => await makePostExcerptPayload({
                post: post,
                graphql: graphql,
                tags: tags,
                categories: categories,
            }),
            createPageTitle: (locale, pageIndex) => page.getPageTitle(category, locale, pageIndex),
            createPagePath: (locale, pageIndex) => page.getPagePath(category, locale, pageIndex),
            showsPageTitle: true,
            previousPageTitle: page.getPreviousPageTitle(locale),
            nextPageTitle: page.getNextPageTitle(locale),
        });
    }));
};
