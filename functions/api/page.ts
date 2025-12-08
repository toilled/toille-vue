import pages from '../../src/configs/pages.json';

interface Env {
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request } = context;
  const url = new URL(request.url);
  const name = url.searchParams.get('name');

  let page;

  if (name) {
      // Find page matching the name (link minus the leading slash)
      page = pages.find((p) => p.link.slice(1) === name);
  } else {
      // Default to the first page (Home)
      page = pages[0];
  }

  if (page) {
    return new Response(JSON.stringify(page), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  return new Response(JSON.stringify(null), {
    status: 404,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
