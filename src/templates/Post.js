import React from 'react';
import styles from './Post.module.scss';

import { graphql } from 'gatsby';

import GatsbyPage from '../gatsby/Page';
import Main from '../components/Main';
import Title from '../components/Title';
import MDXMetadata from '../components/MDXMetadata';
import MDXBody from '../components/MDXBody';
import PostFooter from '../components/PostFooter';
import MorePosts from '../components/MorePosts';

class Post extends GatsbyPage {
  render() {
    const { data } = this.props;

    const { post, earlierPostExcerpt, laterPostExcerpt } = data;

    const {
      title,
      subtitle,
      createdTime,
      category,
      tags,
      license,
      file: {
        childMdx: { code, headings },
      },
    } = post;

    const article = (
      <article className={styles.post}>
        <header className={styles.header}>
          <Title textStyle={'serif'} title={title} subtitle={subtitle} />
          <aside className={styles.metadata}>
            <MDXMetadata
              items={[
                { name: 'time', data: createdTime },
                { name: 'category', data: category },
              ]}
            />
          </aside>
        </header>
        <main className={styles.main}>
          <MDXBody textStyle={'serif'} code={code} />
        </main>
        <footer className={styles.footer}>
          <PostFooter tags={tags} license={license} />
        </footer>
      </article>
    );

    const moreItems =
      earlierPostExcerpt || laterPostExcerpt ? (
        <MorePosts
          earlierPostExcerpt={earlierPostExcerpt}
          laterPostExcerpt={laterPostExcerpt}
        />
      ) : null;

    return (
      <Main
        title={post.title}
        headings={headings}
        sections={[article, moreItems].filter(_ => _)}
      />
    );
  }
}

export default Post;

export const pageQuery = graphql`
  query PostQuery(
    $postId: String!
    $earlierPostId: String
    $laterPostId: String
  ) {
    config {
      site {
        lang
      }
    }
    post(id: { eq: $postId }) {
      title
      subtitle
      isPublished
      createdTime
      lastModifiedTime
      license
      tags
      category
      file {
        childMdx {
          code {
            body
            scope
          }
          headings {
            value
            depth
          }
        }
      }
    }
    earlierPostExcerpt: post(id: { eq: $earlierPostId }) {
      slug
      title
      subtitle
      createdTime
      tags
      category
      file {
        childMdx {
          excerpt(pruneLength: 300)
        }
      }
    }
    laterPostExcerpt: post(id: { eq: $laterPostId }) {
      slug
      title
      subtitle
      createdTime
      tags
      category
      file {
        childMdx {
          excerpt(pruneLength: 300)
        }
      }
    }
  }
`;
