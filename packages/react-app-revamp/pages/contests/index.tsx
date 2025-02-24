import ListContests from "@components/_pages/ListContests";
import { SearchBar } from "@components/_pages/SearchBar";
import { isSupabaseConfigured } from "@helpers/database";
import useContestSortOptions from "@hooks/useSortOptions";
import { getLayout } from "@layouts/LayoutContests";
import { useQuery } from "@tanstack/react-query";
import { fetchEnsAddress } from "@wagmi/core";
import { getRewards, ITEMS_PER_PAGE, searchContests } from "lib/contests";
import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

type SearchCriteria = {
  searchString: string;
  searchColumn: string;
};

function useContests(searchCriteria: SearchCriteria, sortBy?: string) {
  const [page, setPage] = useState(0);
  const { address } = useAccount();

  const {
    status,
    data: contestData,
    error,
    isFetching: isContestDataFetching,
  } = useQuery(
    ["searchedContests", searchCriteria.searchString, page, sortBy],
    () => {
      return searchContests(
        {
          searchString: searchCriteria.searchString,
          searchColumn: searchCriteria.searchColumn,
          pagination: {
            currentPage: page,
          },
        },
        address,
        sortBy,
      );
    },
    {
      enabled: searchCriteria.searchString !== "",
    },
  );

  const { data: rewardsData, isFetching: isRewardsFetching } = useQuery(
    ["rewards", contestData],
    data => getRewards(contestData?.data ?? []),
    {
      enabled: !!contestData,
    },
  );

  return {
    page,
    setPage,
    status,
    contestData,
    rewardsData,
    isRewardsFetching,
    error,
    isContestDataFetching,
  };
}

const Page: NextPage = () => {
  const router = useRouter();
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>({
    searchString: "",
    searchColumn: "title",
  });
  const [sortBy, setSortBy] = useState<string>("");
  const sortOptions = useContestSortOptions("liveContests");
  const { page, setPage, status, contestData, rewardsData, error, isContestDataFetching, isRewardsFetching } =
    useContests(searchCriteria, sortBy);

  useEffect(() => {
    const query = router.query;
    if (query.title) {
      setSearchCriteria({
        searchString: query.title as string,
        searchColumn: "title",
      });

      setSortBy(query.sortBy as string);
    }
  }, [router.query]);

  const handleSearch = async (criteria: { query: string; filterType: string }) => {
    if (criteria.filterType === "user") {
      let targetAddress = criteria.query;

      if (criteria.query.endsWith(".eth")) {
        try {
          const resolvedAddress = await fetchEnsAddress({ name: criteria.query, chainId: 1 });
          targetAddress = resolvedAddress || criteria.query;
        } catch (error) {
          return;
        }
      }

      router.push(`/creator/${targetAddress}`);
    } else {
      setSearchCriteria({
        searchString: criteria.query,
        searchColumn: criteria.filterType,
      });
    }
  };

  const adjustPaddingForInline = searchCriteria.searchString.length > 0 ? "p-3" : "p-20";

  return (
    <>
      <Head>
        <title>Contests - jokerace</title>
        <meta name="description" content="@TODO: change this" />
      </Head>

      <div>
        <div className={`container mx-auto ${adjustPaddingForInline}`}>
          {!searchCriteria.searchString.length && (
            <h1 className="text-[16px] sm:text-[28px] font-sabo text-primary-10 font-bold mb-4 text-center">
              Search contests
            </h1>
          )}

          <SearchBar isInline={searchCriteria.searchString.length ? true : false} onSearch={handleSearch} />
        </div>

        {searchCriteria.searchString.length > 0 && (
          <div className="container mx-auto">
            <h1 className="sr-only">Searched contests</h1>
            {isSupabaseConfigured ? (
              <ListContests
                isContestDataFetching={isContestDataFetching}
                itemsPerPage={ITEMS_PER_PAGE}
                status={status}
                error={error}
                page={page}
                setPage={setPage}
                contestData={contestData}
                rewardsData={rewardsData}
                isRewardsFetching={isRewardsFetching}
                onSortChange={setSortBy}
                sortOptions={sortOptions}
              />
            ) : (
              <div className="border-neutral-4 animate-appear p-3 rounded-md border-solid border mb-5 text-sm font-bold">
                This site&apos;s current deployment does not have access to jokerace&apos;s reference database of
                contests, but you can check out our Supabase backups{" "}
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
          </div>
        )}
      </div>
    </>
  );
};

//@ts-ignore
Page.getLayout = getLayout;

export default Page;
