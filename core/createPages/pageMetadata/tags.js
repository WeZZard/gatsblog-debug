module.exports = {
    name: 'Tags',
    itemComponentName : 'TagSummary',
    layoutComponentName: 'TagListLayout',
    getPageTitle: (locale, pageIndex) => {
        return pageIndex === 0
            ? `Tags`
            : `Tags (Page ${pageIndex})`
    },
    getPagePath: (locale, pageIndex) => {
        const localeSlug = locale ? locale.slug : '';
        return [
            localeSlug,
            `tag`,
            pageIndex > 0 ? `page-${pageIndex}` : ``,
        ].filter(_ => _).join('/');
    },
    getPreviousPageTitle: (locale) => {
        return 'Previous Page'
    },
    getNextPageTitle: (locale) => {
        return 'Next Page'
    },
};