import fs from "fs";
import path from "path";
import { compareDesc } from "date-fns";

const postsDirectory = path.join(process.cwd(), "src", "posts");

export interface Post {
  postId: string;
  metaData: PostMetaData;
}

export interface PostMetaData {
  title: string;
  date: string;
  tags: string[];
}

export async function getPostsSortedByDate(): Promise<Post[]> {
  // Get file names under /posts
  const posts: Post[] = [];
  const fileNames = fs.readdirSync(postsDirectory);
  for (const fileName of fileNames) {
    const { metaData } = await import(`@/posts/${fileName}/index.mdx`);
    const post = { postId: fileName, metaData: metaData };
    posts.push(post);
  }

  // Sort posts by date
  return posts.sort((a: Post, b: Post) => {
    return compareDesc(new Date(a.metaData.date), new Date(b.metaData.date));
  });
}
