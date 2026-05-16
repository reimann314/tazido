/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as applications from "../applications.js";
import type * as auth from "../auth.js";
import type * as candidateNotes from "../candidateNotes.js";
import type * as companyMembers from "../companyMembers.js";
import type * as conversations from "../conversations.js";
import type * as cv from "../cv.js";
import type * as evaluations from "../evaluations.js";
import type * as http from "../http.js";
import type * as interviews from "../interviews.js";
import type * as jobs from "../jobs.js";
import type * as messages from "../messages.js";
import type * as notifications from "../notifications.js";
import type * as offers from "../offers.js";
import type * as programs from "../programs.js";
import type * as search from "../search.js";
import type * as seed from "../seed.js";
import type * as sessionHelpers from "../sessionHelpers.js";
import type * as shortlists from "../shortlists.js";
import type * as stats from "../stats.js";
import type * as successStories from "../successStories.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  applications: typeof applications;
  auth: typeof auth;
  candidateNotes: typeof candidateNotes;
  companyMembers: typeof companyMembers;
  conversations: typeof conversations;
  cv: typeof cv;
  evaluations: typeof evaluations;
  http: typeof http;
  interviews: typeof interviews;
  jobs: typeof jobs;
  messages: typeof messages;
  notifications: typeof notifications;
  offers: typeof offers;
  programs: typeof programs;
  search: typeof search;
  seed: typeof seed;
  sessionHelpers: typeof sessionHelpers;
  shortlists: typeof shortlists;
  stats: typeof stats;
  successStories: typeof successStories;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
