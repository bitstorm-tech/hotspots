import type { Deal } from "$lib/database/deal/deal.model";
import { findAllDeals, findDealsByOwnerId, upsertDeal } from "$lib/database/deal/deal.service";
import { extractJwt } from "$lib/jwt.service";
import type { RequestEvent } from "@sveltejs/kit";

export async function post({ request }: RequestEvent) {
  try {
    const jwt = await extractJwt(request);

    if (!jwt || !jwt.sub) {
      return {
        status: 403
      };
    }

    const deal: Deal = await request.json();
    deal.account_id = +jwt.sub;

    await upsertDeal(deal);

    return {
      status: 200
    };
  } catch (error) {
    console.error("Can't post deal:", error);
    return {
      status: 500
    };
  }
}

export async function get({ request, url }: RequestEvent) {
  try {
    const jwt = await extractJwt(request);

    if (!jwt || !jwt.sub) {
      return {
        status: 403
      };
    }

    const filter = url.searchParams.get("filter")?.toLowerCase() || "";

    const deals = filter.includes("own") ? await findDealsByOwnerId(+jwt.sub) : await findAllDeals();

    return {
      body: deals
    };
  } catch (error) {
    console.error("Can't get deals:", error);
    return {
      status: 500
    };
  }
}
