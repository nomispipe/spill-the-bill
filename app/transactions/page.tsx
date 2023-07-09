import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Link from 'next/link';
import UserTransactions from "./userTransactions";
export default async function IndexPage() {
  const supabase = createServerComponentClient({ cookies });

  const { data: userGroupData } = await supabase
  .from('userInGroup')
  .select('userId')
  .eq('groupId', 1);

  const { data: transactions} = await supabase.from('transactions').select('*').eq('group_id',1);
  const userIds = userGroupData!.map((item) => item.userId);

  const { data: users } = await supabase
  .from('users')
  .select('*')
  .in('id', userIds);

const { data: usersData, error: usersError } = await supabase
  .from('users')
  .select('*')
  .in('id', userIds);

if (usersError) {
  console.error('Error fetching users:', usersError);
  return;
}
const usersMap = usersData.reduce((map, user) => ({ ...map, [user.id]: user }), {});


  return (
    <ul className="my-auto">
      <UserTransactions/>
    <ul>    
    
    <h1 className="text-2xl mt-4">Expenses</h1>
    {transactions?.map((transaction, index) => (
      <li key={index} style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
            <Link href={`/transactions/${transaction.id}`  }>
            <p className="underline">{transaction.title}</p>
            </Link>
          <p><strong>Payed By:</strong> {usersMap[transaction.payedBy]?.username || 'Unknown'}</p>
        </div>
        <div>
          <p><strong>Amount:</strong> {transaction.total} €</p>
        </div>
        <hr/>
      </li>
    ))}
  </ul>
     <Link href={'/transactions/create'}>
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4">add Transaction</button>
     </Link>
    </ul>


  );
}