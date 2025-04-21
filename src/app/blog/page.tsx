import Link from "next/link";
import { format, parseISO } from "date-fns";
import { Post, getPostsSortedByDate } from "@/lib/posts";
import { roboto } from "../fonts";

interface PostCardProps {
  post: Post;
}

function PostCard({ post }: PostCardProps) {
  return (
    <div className="mb-8">
      <Link href={`/blog/${post.postId}`}>
        <h2 className="hover:text-gray-400">{post.metaData.title}</h2>
        <time
          dateTime={post.metaData.date}
          className={`${roboto.className} text-gray-600 font-bold uppercase text-sm`}
        >
          {format(parseISO(post.metaData.date), "LLLL d, yyyy")}
        </time>
      </Link>
    </div>
  );
}

export default async function Page() {
  const posts = await getPostsSortedByDate();
  console.log(posts);

  return (
    <div>
      {posts.map((post) => (
        <PostCard key={post.postId} post={post} />
      ))}
    </div>
  );
}
