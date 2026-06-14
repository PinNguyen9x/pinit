import { safeFetchJson } from "@/utils";
import { GetStaticProps } from "next";
import Link from "next/link";
import * as React from "react";

export interface PostsPageProps {
  posts: { id: string; title: string }[];
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

export const getStaticProps: GetStaticProps<PostsPageProps> = async () => {
  const data = await safeFetchJson<{ data: { id: string; title: string }[] }>(
    "https://js-post-api.herokuapp.com/api/posts?_page=1"
  );
  return {
    props: {
      posts:
        data?.data?.map((x) => ({ id: x.id, title: x.title })) ?? [],
    },
    revalidate: 60,
  };
};
