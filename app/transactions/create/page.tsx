'use client'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState } from 'react'
import Link from 'next/link';
interface User {
    id: number;
    username: string;
  }
  
  interface TransactionData {
    title: string;
    payedBy: string;
    total: number;
    groupId: number;
    createdAt: Date;
    comment: string;
  }

const ExpenseForm = () => {
    const supabase = createClientComponentClient();
    const [groupName, setGroupName] = useState<string>('');
  const [groupId, setGroupId] = useState<number>(0);
  const [title, setTitle] = useState<string>('');
  const [paidByUserId, setPaidByUserId] = useState<string>('');
  const [total, setTotal] = useState<number>(0);
  const [users, setUsers] = useState<User[]>([]);
  const [amount, setAmount] = useState<{ [key: string]: number }>({});
  const [isChecked, setIsChecked] = useState<{ [key: string]: boolean }>({});
  const [split, setSplit] = useState<{ [key: string]: boolean }>({});
  const [comment, setComment] = useState<string>('')

    const toggleCheckbox = (userId : any ) => {
        setIsChecked({
          ...isChecked,
          [userId]: !isChecked[userId]
        })
    }

    const handleAmountChange = (userId : any, value : any) => {
        setAmount({
          ...amount,
          [userId]: value
        })
    }
    
    const handleSplitChange = (userId : any) => {
        setSplit({
            ...split,
            [userId]: !split[userId]
        });
    };

    const handleTitleChange = (event : any) => {
        setTitle(event.target.value)
    }


    const handlePaidByChange = (event : any) => {
        setPaidByUserId(event.target.value)
    }

    const handleTotalChange = (event : any) => {
        setTotal(event.target.value)
    }

    const handleCommentChange = (event : any) => {
        setComment(event.target.value);
    }

    const handleFormSubmit = async (event : any) => {
        event.preventDefault()
        const { data: transactionData, error: transactionError } = await supabase
            .from('transactions')
            .insert([{ title: title, payedBy: paidByUserId, total: total, group_id: groupId, createdAt: new Date(), comment: comment }])
        if (transactionError) {
            console.error(transactionError)
        } else {
            const { data: latestTransactionData, error: latestTransactionError } = await supabase
                .from('transactions')
                .select('id')
                .eq('payedBy', paidByUserId)
                .order('createdAt', { ascending: false })
                .limit(1)
    
            if (latestTransactionError) {
                console.error(latestTransactionError);
            } else {
                const transactionId = latestTransactionData[0].id;
            
                let countSplitUsers = 0
                users.map(user => {
                    if (isChecked[user.id] && split[user.id]) {
                        countSplitUsers++
                    }
                })
            
                let remainingAmount = total
            
                const userTransactionRows = users
                    .filter(user => isChecked[user.id] && !split[user.id])
                    .map(user => {
                        remainingAmount -= amount[user.id]
                        return {
                            transactionId: transactionId, 
                            userId: user.id, 
                            amount: amount[user.id]*-1 || 0
                        }
                    })
            
                const splitUserTransactionRows = users
                    .filter(user => isChecked[user.id] && split[user.id])
                    .map(user => {
                        return {
                            transactionId: transactionId, 
                            userId: user.id, 
                            amount: remainingAmount/countSplitUsers*-1 || 0
                        }
                    })
            
                const allTransactions = [
                    { transactionId, userId: paidByUserId, amount: total },
                    ...userTransactionRows,
                    ...splitUserTransactionRows
                ];
            
                const { data: userTransactionRowData, error: userTransactionRowError } = await supabase
                    .from('userTransaction')
                    .insert(allTransactions)
            
                if (userTransactionRowError) {
                    console.error(userTransactionRowError)
                    return
                }
            }
        
            setTitle('')
            setPaidByUserId('')
            setTotal(0)
            setComment('')
        }
    };
    

    useEffect(() => {
        const fetchData = async () => {
            const { data: groupData, error: groupError } = await supabase.from('groups').select('groupname, id').single();
            if (groupError) {
                console.error(groupError);
            } else {
                setGroupName(groupData.groupname);
                setGroupId(groupData.id);
            }

            const { data: usersData, error: usersError } = await supabase.from('users').select('id, username');
            if (usersError) {
                console.error(usersError);
            } else {
                setUsers(usersData);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="m-auto my-auto">
            <div className="my-auto">
                <h2>{groupName}</h2>
                <form onSubmit={handleFormSubmit}>
                    <table className="table">
                        <tbody> 
                            <tr className="table-row">
                                <td className="table-cell">Title:</td>
                                <td className="table-cell-form">
                                    <input type="text" value={title} onChange={handleTitleChange} />
                                </td>
                            </tr>
                            <tr className="table-row">
                                <td className="table-cell">Who paid?</td>
                                <td className="table-cell-form">
                                    <select value={paidByUserId} onChange={handlePaidByChange}>
                                        <option value="">Select user</option>
                                        {users.map((user) => (
                                            <option key={user.id} value={user.id}>
                                                {user.username}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                            </tr>
                            <tr className="table-row">
                                <td className="table-cell">Total:</td>
                                <td className="table-cell-form">
                                    <input type="number" step=".01" value={total} onChange={handleTotalChange} />
                                    <span> €</span>
                                </td>
                            </tr>
                            {users.map((user) => (
                                <tr className="table-row" key={user.id}>
                                    <td className="table-cell">
                                        <input 
                                            type="checkbox" 
                                            checked={isChecked[user.id] || false}
                                            onChange={() => toggleCheckbox(user.id)}
                                        />
                                        {user.username}:
                                        <input 
                                            type="number" 
                                            value={amount[user.id] || ''}
                                            disabled={!isChecked[user.id] || split[user.id]}
                                            onChange={(e) => handleAmountChange(user.id, e.target.value)}
                                        />
                                        <span> €</span>
                                        <span> or </span>
                                        <input type="checkbox" 
                                            disabled={!isChecked[user.id]} 
                                            checked={split[user.id] || false} 
                                            onChange={() => handleSplitChange(user.id)}/>
                                        <span> split the rest</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <span>Comment:</span>
                    <textarea value={comment} onChange={handleCommentChange}></textarea>
                    <div className="button-container">
                        <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4">Add</button>
                      
                    </div>
                   
                    <Link href={'/'}>
                    <div className="button-container">
                        <div className="bg-blue-500 hover:bg-blue-700 text-white text-center font-bold py-2 px-4 rounded mt-4">
                            Back
                        </div>
                    </div>
                    </Link>
                </form>
            </div>
        </div>
    );
};

export default ExpenseForm;