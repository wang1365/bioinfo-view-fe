from fastapi import FastAPI, Request, Response

host = 'http://10.10.0.208:8080/'
proxies = {'http': 'http://192.168.31.11:1082'}
api = FastAPI()

import requests


@api.get('/{path:path}')
async def proxy_get(request: Request, path: str):
    resp = requests.get(f'{host}{path}',
                        params=request.query_params,
                        cookies=request.cookies,
                        headers=request.headers,
                        proxies=proxies)
    return Response(resp.content, resp.status_code, resp.headers)


@api.post('/{path:path}')
async def proxy_post(request: Request, path: str):
    resp = requests.post(f'{host}{path}',
                         params=request.query_params,
                         cookies=request.cookies,
                         headers=request.headers,
                         json=await request.json(),
                         proxies=proxies)
    return Response(resp.content, resp.status_code, resp.headers)


@api.put('/{path:path}')
async def proxy_put(request: Request, path: str):
    resp = requests.put(f'{host}{path}',
                        params=request.query_params,
                        cookies=request.cookies,
                        headers=request.headers,
                        json=await request.json(),
                        proxies=proxies)
    return Response(resp.content, resp.status_code, resp.headers)


@api.delete('/{path:path}')
async def proxy_delete(request: Request, path: str):
    resp = requests.delete(f'{host}{path}',
                           params=request.query_params,
                           cookies=request.cookies,
                           headers=request.headers,
                           json=await request.json(),
                           proxies=proxies)
    return Response(resp.content, resp.status_code, resp.headers)
