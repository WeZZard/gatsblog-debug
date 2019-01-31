import React from 'react'
import MDXRenderer from "gatsby-mdx/mdx-renderer";
import styles from './PostFullText.module.scss'

import PostMetadataItem from './PostMetadataItem'
import CategoryLabel from './CategoryLabel'
import TagsLabel from './TagsLabel'
import TimeLabel from './TimeLabel'
import License from './License';

class PostFullText extends React.Component {
    render() {
        const { post, defaultLicense } = this.props;
        const {
            title,
            subtitle,
            createdTime,
            tags,
            category,
            code,
            license
        } = post;

        const createdTimeComponent = <TimeLabel dateTime={createdTime}/>;

        const categoryComponent = <CategoryLabel category={category}/>;

        const tagsComponent = tags.length > 0 ? <TagsLabel tags={tags}/> : null;

        const subtitleComponent = subtitle
            ? <div className={styles.postSubtitle}><h2>{subtitle}</h2></div>
            : null;

        return <article className={styles.post}>
            <header className={styles.postHeader}>
                <div className={styles.postTitle}><h1>{title}</h1></div>
                {subtitleComponent}
                <div className={styles.postCaption}>
                    <PostMetadataItem>{createdTimeComponent}</PostMetadataItem>
                    <PostMetadataItem>{categoryComponent}</PostMetadataItem>
                </div>
            </header>
            <section className={styles.postContent}>
                <MDXRenderer>{code.body}</MDXRenderer>
            </section>
            <footer className={styles.postFooter}>
                <PostMetadataItem>{tagsComponent}</PostMetadataItem>
                <License license={license || defaultLicense} />
            </footer>
        </article>
    }
}

export default PostFullText
