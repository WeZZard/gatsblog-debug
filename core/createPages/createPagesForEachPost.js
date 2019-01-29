const path = require('path');
const assert = require('assert');
const { makePostPayload } = require('../Payload');
const Template = path.resolve('src/templates/Post.js');

module.exports = async (args) => {
    const {
        createPagesArgs,
        pendingSchemaData,
        siteLang,
    } = args;

    const { graphql, actions } = createPagesArgs;
    const { createPage } = actions;
    const { tags, categories } = pendingSchemaData;

    const result = await graphql(`
        {
            allPost(sort: { fields: [createdTime], order: DESC }) {
                edges {
                    node {
                        title
                        subtitle
                        isPublished
                        createdTime
                        lastModifiedTime
                        documentIdentifier
                        slug
                        lang
                        isLocalized
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

    const { data: { allPost } } = result;

    const { edges: posts } = allPost || { edges: [] };

    await Promise.all(
        posts.map( async (postNode, index) => {
            const postPayload = await makePostPayload({
                post: postNode,
                tags,
                categories,
                graphql,
                style: 'FullText',
            });

            let earlierPostPayload = null;
            if (index - 1 >= 0) {
                const earlierPost = posts[index - 1];
                earlierPostPayload = await makePostPayload({
                    post: earlierPost,
                    tags,
                    categories,
                    graphql,
                    style: 'Excerpt',
                })
            }

            let laterPostPayload = null;
            if (index + 1 < posts.length) {
                const laterPost = posts[index + 1];
                laterPostPayload  = await makePostPayload({
                    post: laterPost,
                    tags,
                    categories,
                    graphql,
                    style: 'Excerpt',
                })
            }

            let localeSlug = postNode.node.isLocalized
                ? postNode.node.lang
                : '';

            let path = [localeSlug, postNode.node.slug].filter(_ => _).join('/');

            console.log(`Create page for post: ${path}`);

            createPage({
                path: path,
                component: Template,
                context: {
                    isLocalized: postNode.node.isLocalized,
                    lang: postNode.node.lang.identifier || siteLang,
                    post: postPayload,
                    earlier: earlierPostPayload,
                    later: laterPostPayload,
                },
            });

            if (!postNode.node.isLocalized && postNode.node.lang) {
                let localizedPath = `${postNode.node.lang}/${postNode.node.slug}`;

                console.log(`Create localized page for post: ${localizedPath}`);

                createPage({
                    path: localizedPath,
                    component: Template,
                    context: {
                        isLocalized: postNode.node.isLocalized,
                        lang: postNode.node.lang.identifier,
                        post: postPayload,
                        earlier: earlierPostPayload,
                        later: laterPostPayload,
                    },
                });
            }
        })
    );
};
