const createIndexPages = require('./_create-index-pages');
const { tag: page } = require('./page-meta');
const { makePostPayload } = require('../utils');
const { itemsPerPageForIndexPageName } = require('../config');

module.exports = async (args) => {
    const {
        createPagesArgs,
        pendingSchemaData,
        siteLang,
        siteKeywords,
        siteDescription,
    } = args;

    const { graphql, actions } = createPagesArgs;
    const { createPage } = actions;

    const { tags, categories, locales } = pendingSchemaData;

    await Promise.all(locales.map(async (locale) => {
        const args = {
            locale,
            tags,
            categories,
            graphql,
            createPage,
            siteLang,
            siteKeywords,
            siteDescription,
        };
        await _createPageForTagsForLocale(args)
    }));
};

const _createPageForTagsForLocale = async (args) => {
    const {
        tags,
        categories,
        locale,
        siteLang,
        siteKeywords,
        siteDescription,
        graphql,
        createPage
    } = args;

    const itemsPerPage = await itemsPerPageForIndexPageName(page.name, graphql);

    await Promise.all(
        tags.map(async tag => {
            const postFilter = locale
                ? (locale.identifier === siteLang
                        ? `lang: { in: [ null, "${locale.identifier}" ] }`
                        : `lang: { eq: "${locale.identifier}" }`
                ) : 'isLocalized: { eq: false }';

            const result = await graphql(`
                {
                    allPost(
                        filter: {
                            tags: { in: "${tag.name}" }
                            ${postFilter}
                        }
                        sort: { fields: [createdTime], order: DESC }
                    ) {
                        edges {
                            node {
                                title
                                subtitle
                                createdTime
                                documentIdentifier
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

            const items = await Promise.all(posts.map(async (post) => {
                return await makePostPayload({
                    post: post,
                    graphql: graphql,
                    tags: tags,
                    categories: categories,
                    style: "Excerpt",
                })
            }));

            await createIndexPages({
                createPage,
                siteKeywords,
                siteDescription,
                locale: locale,
                itemComponentName : page.itemComponentName,
                layoutComponentName: page.layoutComponentName,
                items,
                itemsPerPage,
                createPageTitle: (locale, pageIndex) => page.getPageTitle(tag, locale, pageIndex),
                createPagePath: (locale, pageIndex) => page.getPagePath(tag, locale, pageIndex),
                showsPageTitle: true,
                previousPageTitle: page.getPreviousPageTitle(locale),
                nextPageTitle: page.getNextPageTitle(locale),
            });
        })
    );
};