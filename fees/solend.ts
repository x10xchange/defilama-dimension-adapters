import {
  Adapter,
  FetchOptions,
  FetchResultFees,
} from "../adapters/types";
import { CHAIN } from "../helpers/chains";
import fetchURL from "../utils/fetchURL";

const solendFeesURL = 'https://api.solend.fi/stats/daily-fees';

interface DailyStats {
  date: string,
  start: number,
  end: number,
  hostOriginationFees: string,
  hostFlashLoanFees: string,
  protocolOriginationFees: string,
  protocolFlashLoanFees: string,
  protocolSpreadFees: string,
  protocolLiquidationTakeRate: string,
  liquidityProviderInterest: string,
  previous: string,
  next: string,
}

const methodology = {
  Fees: 'Interest and fees paid by borrowers and the liquidated',
  ProtocolReveneue: 'The portion of the total fees going to the Solend DAO treasury'
}

const fetchSolendStats = async ({ endTimestamp }: FetchOptions) => {
  const url = `${solendFeesURL}?ts=${endTimestamp}&span=24h`
  const stats: DailyStats = (await fetchURL(url));

  const userFees =
    parseInt(stats.liquidityProviderInterest) +
    parseFloat(stats.hostOriginationFees) +
    parseFloat(stats.hostFlashLoanFees) +
    parseFloat(stats.protocolSpreadFees) +
    parseFloat(stats.hostOriginationFees) +
    parseFloat(stats.protocolFlashLoanFees) +
    parseFloat(stats.protocolSpreadFees) +
    parseFloat(stats.protocolLiquidationTakeRate);

  const dailyRevenue = parseFloat(stats.protocolSpreadFees) +
    parseFloat(stats.protocolFlashLoanFees) +
    parseFloat(stats.protocolSpreadFees) +
    parseFloat(stats.protocolLiquidationTakeRate);
  return {
    dailyFees: userFees,
    dailyUserFees: userFees,
    dailyRevenue: dailyRevenue,
    dailyProtocolRevenue: dailyRevenue,
    dailySupplySideRevenue: stats.liquidityProviderInterest, // some day is negative
  };
};


const adapter: Adapter = {
  version: 2,
  adapter: {
    [CHAIN.SOLANA]: {
      runAtCurrTime: false,
      customBackfill: undefined,
      fetch: fetchSolendStats,
      start: '2023-01-31',
      meta: {
        methodology,
      },
    },
  },
};

export default adapter;
