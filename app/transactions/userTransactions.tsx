'use client'

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
interface UserTransaction {
    userId: string;
    username: string;
    totalAmount: number;
  }

export default function UserTransactions() {
  const [userTransactions, setUserTransactions] = useState<UserTransaction[]>([]);
  const supabase = createClientComponentClient();
  useEffect(() => {
    const fetchUserTransactions = async () => {
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, username');

      if (usersError) {
        console.log('Error fetching users:', usersError);
        return;
      }

      const fetchedUserTransactions: UserTransaction[] = [];

      for (let user of users) {
        const { data: transactions, error: transactionsError } = await supabase
          .from('userTransaction')
          .select('amount')
          .eq('userId', user.id);

        if (transactionsError) {
          console.log(`Error fetching transactions for user ${user.id}:`, transactionsError);
          continue;
        }

        const totalAmount = transactions.reduce((sum : any, transaction : any) => sum + transaction.amount, 0);
        fetchedUserTransactions.push({ userId: user.id, username: user.username, totalAmount });
      }

      setUserTransactions(fetchedUserTransactions);
    };

    fetchUserTransactions();
  }, []);

  return (
    <div>
       
      <h1>User Transactions</h1>
      {userTransactions.map(userTransaction => (
        <div key={userTransaction.userId} className='flex'>
          <h2 className='mr-10'>{userTransaction.username}: </h2>
          <p> {userTransaction.totalAmount} €</p>
        </div>
      ))}
    </div>
  );
}