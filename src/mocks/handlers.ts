import { graphql, http, HttpResponse } from 'msw'

interface APIRequestHandlerI {
	params: Record<string, string | readonly string[]>
	request: Request
}

export const handlers = [
	http.get(
		"/api/value",
		({ params: _params, request: _req }: APIRequestHandlerI) => {
			return HttpResponse.json({ a: "value" });
		},
	),
]
