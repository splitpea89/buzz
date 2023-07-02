import Head from "next/head";
import { api } from "~/utils/api";
import { appRouter } from "~/server/api/root";
import { prisma } from "~/server/db";
import superjson from "superjson"
import type { GetStaticProps, NextPage } from "next";
import { InferGetStaticPropsType } from "next";
import { createServerSideHelpers } from '@trpc/react-query/server';
import { PageLayout } from "~/components/layout";
import Image from "next/image";
import { LoadingPage } from "~/components/loading";
import { PostView } from "~/components/postView";


const ProfileFeed = (props: {userId: string}) => {

  const {data, isLoading} = api.posts.getPostsByUserId.useQuery({userId: props.userId});

  if (isLoading) return <LoadingPage />;

  if (!data || data.length === 0) return <div>User has not posted</div>;

  return <div className="flex flex-col">
    {data.map(fullPost => (<PostView {...fullPost} key={fullPost.post.id}/>))}
  </div>

}

const ProfilePage: NextPage<{username: string}> = ({username}) => {
  const { data } = api.profile.getUserByUsername.useQuery({ username });
  if (!data) return <div>404</div>;
  return (
    <>
      <Head>
        <title>{data.username}</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <PageLayout>
        <div className="border-b border-slate-400 bg-slate-600 h-32 relative">
          <Image src={data.profileImageUrl} alt={`@${data.username ?? ""}'s profile picture`} width={128} height={128} className="-mb-[64px] absolute bottom-0 left-0 ml-4 rounded-full border-2 border-black"></Image>
        </div>
        <div className="h-[64px]" />
        <div className="text-2xl pl-4 pb-4 p-2 font-bold">{`@${data.username ?? ""}`}</div>
        <div className="border-slate-400 w-full border-b" />
        <ProfileFeed userId={data.id} />
      </PageLayout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: { prisma, userId: null },
    transformer: superjson,
  });

  const slug = context.params?.slug;

  if (typeof slug !== "string") throw new Error("no slug");

  const username = slug.replace("@", "");

  await helpers.profile.getUserByUsername.prefetch({username});

  return {
    props: {
      trpcState: helpers.dehydrate(),
      username: username
    }
  };
};

export const getStaticPaths = () => {
  return {
    paths: [],
    fallback: "blocking"
  };
}

export default ProfilePage;