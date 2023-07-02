import { SignIn, SignInButton, useUser } from "@clerk/nextjs";
import { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { RouterOutputs, api } from "~/utils/api";

const CreatePostWizard = () => {

  const { user } = useUser();

  if (!user) return null;

  return <div className="flex gap-3 w-full">
    <img src={user.profileImageUrl} alt="Profile image" className="w-12 h-12 rounded-full" />
    <input placeholder="Type your post!" className="bg-transparent grow outline-none" />
  </div>

}

type PostWithUser = RouterOutputs["posts"]["getAll"][number];
const PostView = (props: PostWithUser) => {

  const { post, author } = props;

  return (
    <div key={post.id} className="flex gap-3 p-4 border-b border-slate-400">
      <img src={author.profileImageUrl} alt="Profile image" className="w-12 h-12 rounded-full gap-3" />
      <div className="flex flex-col">
        <div className="flex text-slate-400">
          <span>{`@${author.username}`}</span>
        </div>
        <span>{post.content}</span>
      </div>
    </div>
  );
}

export default function Home() {
  const user = useUser();

  const { data, isLoading } = api.posts.getAll.useQuery();

  if (isLoading) return <div>Loading...</div>;

  if (!data) return <div>Something went wrong</div>;

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex justify-center h-screen">
        <div className="w-full md:max-w-2xl border-x h-full border-slate-400">
          <div className="border-b border-slate-400 flex p-4">
            {!user.isSignedIn && <div className="flex justify-center"><SignInButton /></div>}
            {user.isSignedIn && <CreatePostWizard />}
          </div>
          <div className="flex flex-col">
            {data?.map((fullPost) => (
              <PostView {...fullPost} key={fullPost.post.id} />
            ))}
          </div>
          <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" />
        </div>
      </main>
    </>
  );
}
