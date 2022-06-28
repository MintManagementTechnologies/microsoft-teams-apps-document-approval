import { baseApi } from './';

export const configService = baseApi.injectEndpoints({
   endpoints: (build) => ({
      getNewRefNumber: build.query<{refNumber: number}, void>({
         query: () => `config/refNumber`,
      }),
   }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
   endpoints: configEndpoints,
   useGetNewRefNumberQuery,
   useLazyGetNewRefNumberQuery,
} = configService;
