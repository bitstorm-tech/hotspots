import type { Account } from "$lib/account.model";
import { getAccountsCollection } from "$lib/db.service";
import { extractJwt } from "$lib/jwt.service";
import type { RequestEvent } from "@sveltejs/kit/types/private";
import * as bcryptjs from "bcryptjs";
import { ObjectId } from "mongodb";

export async function get({ request }: RequestEvent) {
  try {
    const jwt = await extractJwt(request);

    if (!jwt) {
      console.warn("Can't get account -> no JWT present");
      return {
        status: 403
      };
    }

    const accounts = await getAccountsCollection();
    const account = await accounts.findOne({ _id: new ObjectId(jwt.sub) });

    return {
      status: 200,
      body: account
    };
  } catch (error) {
    console.error("Error during get account:", error);
    return {
      status: 500
    };
  }
}

export async function post({ request }: RequestEvent) {
  try {
    const accounts = await getAccountsCollection();
    const account: Account = await request.json();
    account.email = account.email.toLowerCase();
    console.debug("Create new account:", account.email);

    const existingAccount = await accounts.findOne({ email: account.email });

    if (existingAccount) {
      console.debug("Account already exists:", account.email);
      return {
        status: 403
      };
    }

    account.password = bcryptjs.hashSync(account.password);
    await accounts.insertOne(account);
    return {
      status: 200
    };
  } catch (error) {
    console.error("Error during post account:", error);
    return {
      status: 500
    };
  }
}