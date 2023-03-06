import { useStore as useStoreContest } from "@hooks/useContest/store";

import { IconSpinner } from "@components/UI/Icons";
import { CONTEST_STATUS } from "@helpers/contestStatus";
import Countdown from "./Countdown";
import Steps from "./Steps";

export const Timeline = () => {
  const { contestStatus } = useStoreContest(state => ({
    //@ts-ignore
    contestStatus: state.contestStatus,
  }));

  if (contestStatus === CONTEST_STATUS.SNAPSHOT_ONGOING)
    return (
      <div className="animate-appear py-2 flex text-neutral-10 items-center flex-col">
        <IconSpinner className="animate-spin text-lg mb-2 text-neutral-11" />
        <span className="text-xs font-bold">Snapshot ongoing...</span>
      </div>
    );

  return (
    <>
      <div className="animate-appear mb-4 md:mb-6">
        <Countdown />
      </div>
      <div className="animate-appear">
        <Steps />
      </div>
    </>
  );
};

export default Timeline;
