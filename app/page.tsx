import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import LogoutButton from './logout-button'
import Login from './login/page'
import IndexPage from './transactions/page'
import Redirect from './redirect'

export default async function Index() {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="flex-1 flex flex-col max-w-3xl mt-24">
      <h1 className="text-2xl mb-2 flex justify-between">
        <span className="sr-only">Supabase and Next.js Starter Template</span>
      </h1>
      <Redirect/>
      {user ? (
       <div>
        <IndexPage></IndexPage>
       </div>
      ): 
      (
        <Login></Login>
      )}
      
    </div>
  )
}
