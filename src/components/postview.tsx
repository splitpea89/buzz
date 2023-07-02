import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime)

import Link from "next/link";
import { RouterOutputs } from "~/utils/api";
import Image from "next/image";


type PostWithUser = RouterOutputs["posts"]["getAll"][number];
export const PostView = (props: PostWithUser) => {

  const { post, author } = props;

  return (
    <div key={post.id} className="flex gap-3 p-4 border-b border-slate-400">
      <Image src={author.profileImageUrl} alt={`@${author.username}'s profile picture`} className="w-12 h-12 rounded-full gap-3" height={48} width={48} />
      <div className="flex flex-col">
        <div className="flex text-slate-400 font-bold gap-1">
          <Link href={`/@${author.username}`}><span>{`@${author.username}`}</span></Link>
          <Link href={`/post/${post.id}`}><span className="font-thin">{` · ${dayjs(
            post.createdAt
          ).fromNow()}`}</span></Link>
        </div>
        <span className="text-xl">{post.content}</span>
      </div>
    </div>
  );
}
