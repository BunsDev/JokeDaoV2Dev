import UserSubmissions from "@components/_pages/User/components/SubmissionsList";
import { isSupabaseConfigured } from "@helpers/database";
import { getAddressProps } from "@helpers/getAddressProps";
import LayoutUser from "@layouts/LayoutUser";
import { useQuery } from "@tanstack/react-query";
import { ITEMS_PER_PAGE } from "lib/contests";
import { getUserSubmissions } from "lib/user";
import { SubmissionsResult } from "lib/user/types";
import { FC, useState } from "react";
import { UserPageProps } from "..";

function useUserSubmissions(userAddress: string) {
  const [page, setPage] = useState(0);

  const {
    data: userSubmissionsData,
    isError: isError,
    isFetching: isLoading,
  } = useQuery<SubmissionsResult>(
    ["userSubmissions", userAddress, page],
    () => {
      return getUserSubmissions(userAddress, page, ITEMS_PER_PAGE);
    },
    {
      enabled: !!userAddress,
    },
  );

  return {
    page,
    setPage,
    userSubmissionsData,
    isError,
    isLoading,
  };
}

const Page: FC<UserPageProps> = ({ address }) => {
  const { page, setPage, userSubmissionsData, isLoading, isError } = useUserSubmissions(address);

  return (
    <LayoutUser address={address}>
      {isSupabaseConfigured ? (
        <UserSubmissions
          submissions={userSubmissionsData}
          page={page}
          itemsPerPage={ITEMS_PER_PAGE}
          setPage={setPage}
          isError={isError}
          isLoading={isLoading}
        />
      ) : (
        <div className="container mx-auto border-neutral-4 animate-appear p-3 rounded-md border-solid border mb-5 text-sm font-bold">
          This site&apos;s current deployment does not have access to jokerace&apos;s reference database of contests,
          but you can check out our Supabase backups{" "}
          <a
            className="link px-1ex"
            href="https://github.com/jk-labs-inc/jokerace/tree/staging/packages/supabase"
            target="_blank"
            rel="noreferrer"
          >
            here
          </a>{" "}
          for contest chain and address information!
        </div>
      )}
    </LayoutUser>
  );
};

export async function getStaticPaths() {
  return { paths: [], fallback: true };
}

export async function getStaticProps({ params }: any) {
  const { address: pathAddress } = params;

  const addressProps = await getAddressProps(pathAddress);

  if (addressProps.notFound) {
    return { notFound: true };
  }

  return {
    props: addressProps,
  };
}

export default Page;
