import { auth } from "@/auth";

export async function GET(request) {
  const session = await auth();

  if (!session || !session.user?.id) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  return new Response(
    JSON.stringify({
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
      },
    }),
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}
