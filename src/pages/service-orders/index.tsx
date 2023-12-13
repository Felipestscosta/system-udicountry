import { GetServerSideProps } from "next";
import Image from "next/image";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import ptBR from "date-fns/locale/pt-BR";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";

import ScanCode from "../../components/scancode";
import { useRouter } from "next/router";
import { ArrowPathIcon, CircleStackIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { useState } from "react";

export interface serviceProps {
  created_at: string;
  delivery: string;
  value: number;
}

export interface ordersProps{
  id: string;
  number: number
  nome: string
  phone: string
  active: boolean
  date: string
  data: string
  total: number
}

interface arrayOrdersProps{
  orders: Array<ordersProps>
}

export default function App({ orders }: arrayOrdersProps) {
  const router = useRouter();
  const [ filteredOrders, setFilteredOrders ] = useState<ordersProps[]>(orders)
  const [ isLoading, setIsLoading ] = useState(false)
  const [ isAllOrders, setIsAllOrders ] = useState(true);
  const [ isTodayFilterOrderActive, setIsTodayFilterOrderActive ] = useState(false);
  const [ isFinishedOutputActive, setIsFinishedOutputActive ] = useState(false);
  
  function handleSearch(wordSearch: any){
    setIsLoading(true)

    const ordersFiltered = orders.filter( (order) => {
      const totalPrice = order.total / 100;
      const formatedTotalPrice = totalPrice.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
      
      return order.nome.includes(wordSearch.toLowerCase()) 
             || order.phone.includes(wordSearch)
             || formatedTotalPrice === Number(wordSearch.replace(',', '') / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
    })

    setFilteredOrders(ordersFiltered)
    setIsLoading(false)
  }

  function handleFilterByFinish(status: boolean){
    
    if(status){
      const ordersFilteredByFinish = orders.filter( (order) => {
        return order.active === false
      })
      setFilteredOrders(ordersFilteredByFinish)
      setIsAllOrders(false)
      setIsTodayFilterOrderActive(false)
      setIsFinishedOutputActive(true)
    }else{
      setFilteredOrders(orders)
      setIsAllOrders(true)
      setIsTodayFilterOrderActive(false)
      setIsFinishedOutputActive(false)
    }
  }

  function handleByToday(){
    const currentDate = new Date();
    const formatedCurrentDate = format(currentDate, "yyyy-MM-dd");

    const currentDateOrders = orders.filter( (order: ordersProps) => {
      const orderDate = new Date(order.data);
      const formatedOrderDate = format(orderDate, "yyyy-MM-dd");
      return formatedOrderDate === formatedCurrentDate;
    })

    if(currentDateOrders.length !== 0){
      setFilteredOrders(currentDateOrders)
      setIsAllOrders(false)
      setIsFinishedOutputActive(false)
      setIsTodayFilterOrderActive(true)
    }else{
      setFilteredOrders(orders)
      setIsAllOrders(true)
      setIsFinishedOutputActive(false)
      setIsTodayFilterOrderActive(false)
    }
  } 

  return (
    <>
      {isLoading &&
          <div className="flex w-full h-full justify-center items-center fixed bg-amber-950 z-40 opacity-80">
            <ArrowPathIcon className="h-10 animate-spin text-white"/>
          </div>
        }
      <main className="flex flex-col h-full min-h-screen relative bg-gray-50 px-4">
        
        <div className="flex flex-col fixed w-screen justify-center items-center p-8 pb-2 pt-4 left-0 z-10 bg-gray-50 shadow-lg rounded-b-2xl">
          <div className="flex relative w-full">
            <input
              className="rounded-full w-full px-16 py-2 outline-none h-14 shadow-lg"
              type="text"
              placeholder="Nome do cliente, Nº serviço..."
              onChange={(e) => { handleSearch(e.target.value)}}
            />
            <MagnifyingGlassIcon className="absolute left-6 top-4 h-6 text-gray-400" />
          </div>

          <div className="flex gap-4 my-3 items-center justify-center">
            <button 
              className={`${isAllOrders ? "text-gray-950 font-bold underline" : "text-gray-500"}`} 
              onClick={() => { handleFilterByFinish(false) }}>Todos</button>
            <span className="text-gray-300">|</span>
            <button 
              className={`${isTodayFilterOrderActive ? "text-gray-950 font-bold underline" : "text-gray-500"}`} 
              onClick={() => { handleByToday() }}>Hoje</button>
            <span className="text-gray-300">|</span>
            <button 
              className={`${isFinishedOutputActive ? "text-gray-950 font-bold underline" : "text-gray-500"}`} 
              onClick={() => { handleFilterByFinish(true) }}>Entregues</button>
          </div>

        </div>        

        <div className="flex flex-col gap-10 pt-48">
          {
            filteredOrders.length === 0 ?
              <div className="flex flex-col w-full justify-center items-center text-center gap-6">
                <CircleStackIcon className="h-32 text-gray-300"/>
                <p className="w-60 text-lg font-medium text-gray-300">Não foi encontrado nenhum serviço. <Link className="underline" href={`/service-orders/new`}>Cadastrar</Link></p>
              </div>
              :   
              filteredOrders.map((order: any, index: number) => {
                  const services = JSON.parse(order.services);
                  let totalValue = 0;
                  services.map((service: serviceProps) => {
                    totalValue += service.value;
                  });

                  let formatedValue = totalValue / 100;

                  return (                     
                      <div
                        key={index}
                        className={`flex shadow-2xl relative items-center justify-center rounded-3xl overflow-hidden bg-gradient-to-br ${order.active ? "from-amber-900" : "from-gray-400 line-through text-gray-400 opacity-70"} to-black cursor-pointer`}
                        onClick={() => {
                          setIsLoading(true)
                          router.push(`/service-orders/${order.id}`);
                        }}
                      >

                        <Image
                          className="object-cover rounded-3xl absolute z-0 opacity-20 blur-sm"
                          alt=""
                          src={order.featureImage}
                          width={450}
                          height={170}
                        />

                        <div className="relative p-10 mx-auto w-full z-2">
                          <h3 className="text-zinc-200 font-bold text-3xl capitalize mb-6">
                            {order.nome}
                          </h3>
                          <hr className="mb-4 opacity-30 border-zinc-300" />
                          <div className="grid grid-cols-2">
                            <p className="text-zinc-200 text-2xl">
                              {format(new Date(order.data), "dd MMM", { locale: ptBR })}
                            </p>
                            <p className="text-zinc-200 text-2xl text-right">
                              {formatedValue.toLocaleString("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                  
                    
                  )

              })
              
            }
        </div>
      </main>
      <ScanCode />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const orders = await prisma.order.findMany({
    // where: { active: true },
    include: {
      client: true,
      service: true,
    },
  });

  const dataOrders = orders.map((order) => {
    return {
      id: order.id,
      nome: order.client.name,
      data: order.output.toISOString(),
      active: order.active,
      featureImage: order.service[0]?.image ?? "",
      services: JSON.stringify(order.service),
      number: order.number,
      phone: order.client.phone,
      total: order.total
    };
  });

  return {
    props: {
      orders: dataOrders,
    },
  };
};
