import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
export default async function Index({ params }: any) {
  const supabase = createServerComponentClient({ cookies });

  const {data: transaction } = await supabase.from('transactions').select('*').eq('id',params.id).single();

const { data: userTransactions} = await supabase.from('userTransaction').select('*').eq('transactionId',params.id).order('amount')

  const { data: userGroupData } = await supabase    
  .from('userInGroup')
  .select('userId')
  .eq('groupId', 1);

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
    <div className="my-auto">
        <h1 className="text-2xl">{transaction.title}</h1>
        <span>{new Date(transaction.createdAt).toLocaleString()}</span>
        <table className="table-auto">
        <thead>
      <tr>
        <th>Name</th>
        <th>Amount</th>
      </tr>
    </thead>
    <tbody>
   
    {userTransactions?.map((transaction, index) => (
      <tr key={index}>
        <td>{usersMap[transaction.userId]?.username || 'Unknown'}</td>
        
        <td>{transaction.amount}€</td>
      </tr>
       
    ))}
    </tbody>
  </table>
        <Link href={'/'}>
            Back
            </Link>
    </div>   

  );
}