import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export default async function Index() {
  const supabase = createServerComponentClient({ cookies });

  const { data: users } = await supabase.from("users").select();

  return (
    <ul className="my-auto">
      {users?.length}
      {users?.map((users) => (
        <li key={users.id}>{users.username}</li>
      ))}
    </ul>
  );
}