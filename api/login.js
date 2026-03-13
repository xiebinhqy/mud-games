export const config = { runtime: 'edge' };
export default async (req) => {
  const {u,p} = await req.json();
  const users = globalThis.users || {};
  if(!users[u] || users[u].pwd!==p){
    return Response.json({ok:false});
  }
  return Response.json({ok:true, data:users[u].data});
};