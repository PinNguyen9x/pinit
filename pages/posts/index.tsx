import { GetStaticProps, GetStaticPropsContext } from "next";
import Link from "next/link";
import * as React from "react";

export interface PostsPageProps {
  posts: any[];
}

export default function PostsPage(props: PostsPageProps) {
  return (
    <div>
      <ul>
        {props.posts.map((x) => (
          <li key={x.id}>
            <Link href={`/posts/${x.id}`}>{x.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export const getStaticProps: GetStaticProps<PostsPageProps> = async (
  context: GetStaticPropsContext
) => {
  // server-side code
  // build -times
  const response = await fetch(
    "https://js-post-api.herokuapp.com/api/posts?_page=1"
  );
  const data = await response.json();
  return {
    props: {
      posts: data.data.map((x: any) => ({ id: x.id, title: x.title })),
    },
  };
};
