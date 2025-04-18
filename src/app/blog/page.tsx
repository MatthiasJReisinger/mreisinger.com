import Link from "next/link";
import { format, parseISO } from "date-fns";
import { Post, getPostsSortedByDate } from "@/lib/posts";

interface PostCardProps {
  post: Post;
}

function PostCard({ post }: PostCardProps) {
  return (
    <div className="mb-8">
      <h2 className="mb-1">
        <Link
          href={`/blog/${post.postId}`}
          className="text-blue-700 hover:text-blue-900 dark:text-blue-400"
        >
          {post.metaData.title}
        </Link>
      </h2>
      <time dateTime={post.metaData.date} className="mb-2 block text-gray-600">
        {format(parseISO(post.metaData.date), "LLLL d, yyyy")}
      </time>
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
