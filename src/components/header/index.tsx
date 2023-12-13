import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/solid";
import { HomeIcon } from "@heroicons/react/24/solid";
import { signOut } from "next-auth/react";
import Link from "next/link";

interface TitleProps {
  Title: string;
}

export default function Header(props: TitleProps) {
  return (
    <header className="flex fixed w-full justify-between items-center px-6 py-4 mb-16 shadow-lg bg-white z-40 capitalize">
      <Link href='/'>
        <HomeIcon className="h-6 text-slate-950"/>
      </Link>
      <h3 className="text-slate-950 text-lg font-bold w-full text-center" title={props.Title}>{props.Title.slice(0,15)}</h3>
      {/* <button onClick={() => signOut({ redirect: true })}>
        <ArrowRightOnRectangleIcon className="h-6 w-6 text-red-500" title="sair"/>
      </button> */}
    </header>
  );
}
