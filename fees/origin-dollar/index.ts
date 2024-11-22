// https://docs.originprotocol.com/ogn/staking#staking-rewards
import axios from "axios";
import { Adapter, FetchOptions, FetchResultV2 } from "../../adapters/types";
import { CHAIN } from "../../helpers/chains";
import ADDRESSES from "../../helpers/coreAssets.json";

const apiUrl: string = "https://api.originprotocol.com/api/v2/protocol-fees";
const USDT: string = ADDRESSES.ethereum.USDT;
const decimals: number = 1e6;

interface DayData {
  date: number;
  revenue: number;
}

interface ApiResponse {
  revenue: {
    now: number;
    oneDayAgo: number;
    twoDaysAgo: number;
    oneWeekAgo: number;
    twoWeeksAgo: number;
    thirtyDaysAgo: number;
    sixtyDaysAgo: number;
    ninetyDaysAgo: number;
  };
  days: DayData[];
}

const fetch = async (options: FetchOptions): Promise<FetchResultV2> => {
  const { startOfDay, createBalances } = options;
  const dailyRevenue = createBalances();
  const totalRevenue = createBalances();

  const { data } = await axios.get<ApiResponse>(apiUrl);

  const dailyData = data.days.find((day) => day.date === startOfDay);
  if (dailyData) dailyRevenue.add(USDT, dailyData.revenue * decimals);
  totalRevenue.add(USDT, data.revenue.now * decimals);

  return {
    dailyRevenue,
    dailyFees: dailyRevenue,
    totalRevenue,
    totalFees: totalRevenue,
  };
};

const adapter: Adapter = {
  adapter: {
    [CHAIN.ETHEREUM]: {
      fetch,
      start: '2021-11-02',
      runAtCurrTime: false,
      meta: {
        methodology:
          "20% of all yield generated by OUSD and OETH is collected as a protocol fee.",
      },
    },
  },
  version: 2,
};

export default adapter;
