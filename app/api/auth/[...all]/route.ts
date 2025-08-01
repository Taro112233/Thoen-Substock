// app/api/auth/[...all]/route.ts
import { auth } from "@/app/utils/auth"; // path to your auth file
import { toNextJsHandler } from "better-auth/next-js";
 
export const { POST, GET } = toNextJsHandler(auth);