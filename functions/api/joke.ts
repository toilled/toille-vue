interface Env {
  // Add environment variables here if needed
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const response = await fetch("https://icanhazdadjoke.com/", {
    headers: {
      "Accept": "application/json"
    }
  });
  const data = await response.json();

  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store"
    },
  });
};
