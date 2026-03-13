export const config = { runtime: 'edge' };
export default async () => {
  return Response.json({servers:[{id:1,name:"洪荒1服"},{id:2,name:"洪荒2服"}]});
};