const createIndexPages = require('./_createIndexPages');
const { home: page } = require('./pageMetadata');
const { makePostExcerptPayload } = require('../Payload');
const { getItemsPerPageInIndexWithName } = require('../config');

module.exports = async (args) => {
    const {
        createPagesArgs,
        pendingSchemaData,
        siteLang
    } = args;

    const { graphql, actions } = createPagesArgs;
    const { createPage } = actions;
    const { locales, tags, categories } = pendingSchemaData;

    await Promise.all(locales.map(async (locale) => {
        const postFilter = locale
            ? (locale.identifier === siteLang
                    ? `filter: { lang: { in: [ null, "${locale.identifier}" ] } }`
                    : `filter: { lang: { eq: "${locale.identifier}" } }`
            ) : 'filter: { isLocalized: { eq: false } }';

        const result = await graphql(`
        {
            allPost(
                ${postFilter}
                sort: { fields: [createdTime], order: DESC }
            ) {
                edges {
                    node {
                        title
                        subtitle
                        slug
                        createdTime
                        tags
                        category
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
        } = (allPost || { edges: [] });

        const itemsPerPage = await getItemsPerPageInIndexWithName(page.name, graphql);

        await createIndexPages({
            graphql: graphql,
            createPage : createPage,
            locale: locale,
            itemComponentName : page.itemComponentName,
            layoutComponentName: page.layoutComponentName,
            primitiveItems: posts,
            itemsPerPage: itemsPerPage,
            createItem: async (post) => await makePostExcerptPayload({
                post: post,
                graphql: graphql,
                tags: tags,
                categories: categories,
            }),
            createPageTitle: page.getPageTitle,
            createPagePath: page.getPagePath,
            showsPageTitle: false,
            previousPageTitle: page.getPreviousPageTitle(locale),
            nextPageTitle: page.getNextPageTitle(locale),
        });
    }))
};
