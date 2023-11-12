import { MainForm } from '@/components/MainForm'
import { Question } from '@/components/Question'
import { Input } from '@/components/ui/input'

export default function Home() {
  return (
    <div className="flex flex-col md:flex-row  min-h-screen items-center justify-center gap-6">

      <div className="flex w-full max-w-xl flex-col gap-4 rounded-lg bg-white p-6 drop-shadow-md ">
        <h1 className="text-xl font-semibold leading-none">AI Tools</h1>
        <MainForm />
      </div>
      <div className="flex w-full max-w-xl flex-col gap-4 rounded-lg bg-white p-6 drop-shadow-md">
        <Question />
      </div>
    </div>
  )
}
