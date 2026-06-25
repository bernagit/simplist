import ky from "ky";

const api = ky.extend({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}`,
    prefix: "api/",
    cache: "no-store",
    credentials: "include",
});

export default api;
